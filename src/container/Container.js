import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router';
import { Button, MessageBar, MessageBarType, Breadcrumb } from 'office-ui-fabric-react'
import {parse as parseURL} from 'url'

import faunadb from 'faunadb';
import clientForSubDB from "../clientForSubDB";
import { loginWithUnknownUser, logout } from "../authentication/login"

import {NavTree} from '../nav-tree/NavTree'
import {SecretForm} from '../secrets/Secrets'
import FaunaRepl from '../fauna-repl/FaunaRepl'
import logo from '../logo.svg';

const ERROR_MESSAGE_DISPLAY_MS = 5000;

class Container extends Component {
  constructor(props) {
    super(props);
    this.state = { client: this._connect(props.currentUser), errors: [], schemaBump: 0, bugs: false };
    this.bumpSchema = this.bumpSchema.bind(this);
    this.updateSecret = this.updateSecret.bind(this);
    this.observerCallback = this.observerCallback.bind(this);
    this.logout = this.logout.bind(this);
    this._onBreadcrumbItemClicked = this._onBreadcrumbItemClicked.bind(this);
  }

  componentWillReceiveProps(next) {
    if (this.props.currentUser === next.currentUser) return;
    this.setState({ ...this.state, client: this._connect(next.currentUser) })
  }

  componentDidMount() {
    setTimeout(()=>{this.setState({viewportReady : true})}, 10);
  }

  updateSecret(data) {
    this.props.dispatch(loginWithUnknownUser(data.endpoint, data.secret))
  }

  _connect(user) {
    if (!user) return null;
    // get a new client for that secret and set state
    // observer for errors...
    var opts = {
      secret: user.secret,
      observer : this.observerCallback
    };

    if (user.endpoint) {
      var endpointURL = parseURL(user.endpoint)
      opts.domain = endpointURL.hostname
      opts.scheme = endpointURL.protocol.replace(/:$/,'')
      if (endpointURL.port) {
        opts.port = endpointURL.port
      }
    }

    return new faunadb.Client(opts);
  }

  logout() {
    this.props.dispatch(logout())
    browserHistory.push("/")
  }

  observerCallback(res) { // render any error messages
    if (res.responseContent.errors) {
      console.error("observerCallback errors", res.responseContent.errors)
      var newErrors = res.responseContent.errors.map((error) => {
        var message = "";
        if (error.description) {
          message += error.description
        }
        if (error.failures) {
          error.failures.forEach((failure) => {
            message += " ("+ failure.field.join('.') +") " + failure.description
          })
        }
        return {message, id : Math.random().toString()};
      })
      // push them to the top of the list
      var oldErrors = this.state.errors;
      var allErrors = newErrors.concat(oldErrors);
      this.setState({errors : allErrors})
      // if errors get out of hand, cut off the client
      var bugs = this.state.bugs;
      if (!bugs && this.state.errors.length > 10) {
        this.setState({bugs:true});
        let first = true;
        // eslint-disable-next-line
        this.state.client.__proto__._performRequest = () => {
          console.log("_performRequest", this.state.client, arguments)
          if (first) {
            first = false;
            browserHistory.push("/")
            return Promise.resolve({
              status: 429,
              header : {},
              text:'{"errors":[{"description":"Too many errors, please refresh the page"}]}'})
          } else {
            return Promise.reject(new Error("too many client errors, please refresh the page to recover"))
          }
        }
        // this.setState({client: false})
      }
      // automatically remove them after a few seconds
      setTimeout(()=>{
        var removeIDs = newErrors.map((error) => error.id)
        var prunedErrors = this.state.errors.filter((error)=>{
          return !removeIDs.includes(error.id)
        });
        this.setState({errors : prunedErrors})
      }, ERROR_MESSAGE_DISPLAY_MS)
    }
  }
  bumpSchema(){
    this.setState({schemaBump : this.state.schemaBump+1})
  }
  _onBreadcrumbItemClicked(item, e, crumb) {
    // console.log("Breadcrumb",item, e, crumb)
    browserHistory.push(crumb.url);
  }
  render() {
    var splat = this.props.params.splat ?
      this.props.params.splat.replace(/^db\/?/,'') : "";
    var sharedProps = {
      scopedClient : clientForSubDB(this.state.client, splat, "server"),
      scopedAdminClient : clientForSubDB(this.state.client, splat, "admin"),
      // rootClient: this.state.client,
      bumpSchema : this.bumpSchema,
      splat
    };
    const childrenWithProps = React.Children.map(this.props.children,
     (child) => React.cloneElement(child, sharedProps)
    );
    // console.log("Container",this.props);
    var path = (this.props.location||{}).pathname.replace(/\/db\/?/,'');

    var contents = <MessageBar messageBarType={ MessageBarType.error }>
      No FaunaDB client.</MessageBar>;
    var firstItem = {text : "/", key : "/"};

    var crumb = <Breadcrumb items={[firstItem]}/>;
    if (this.state.client) {
      contents = <div>
        {childrenWithProps}
      </div>
      if (splat) {
        var breadcrumbItems = [firstItem].concat(splat.split('/').map((db_name, i, path)=>{
          var db_key = path.slice(0,i+1).join('/');
          return {
            text : db_name,
            key : db_key,
            url : "/db/"+db_key+"/databases",
            onClick : this._onBreadcrumbItemClicked.bind(this, db_key)
          }
        }))
        crumb = <Breadcrumb
          items={ breadcrumbItems }
          maxDisplayedItems={ 4 } />
      }
    }

    return (
        <FaunaRepl splat={splat} crumb={crumb} scopedClient={sharedProps.scopedClient}>
          <div className="ms-Grid ms-Fabric ms-font-m">
            {/* header */}
            <div className="ms-Grid-row header">
              <Link to="/"><img src={logo} className="logo" alt="logo" /></Link>
              <Button className="logout" onClick={this.logout}>Log out</Button>
              <SecretForm showDialog={!this.state.client} onSubmit={this.updateSecret} />
            </div>
            <NavTree
              nonce={this.state.schemaBump}
              client={this.state.client}
              splat={splat} path={path}>
              {this.state.errors.map((error)=>{
                return (<MessageBar
                messageBarType={ MessageBarType.error }>{error.message}</MessageBar>)
              })}
              {contents}
            </NavTree>
          </div>
        </FaunaRepl>
    )
  }
}

function connectContainer(state, props) {
  return {
    ...props,
    currentUser: state.currentUser
  }
}

export default connect(connectContainer)(Container)
