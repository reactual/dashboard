import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import {MessageBar, MessageBarType, Breadcrumb} from 'office-ui-fabric-react'
import faunadb from 'faunadb';
import {NavTree} from './NavTree'
import {SecretForm} from './Secrets'
import FaunaRepl from './FaunaRepl'
import logo from './logo.svg';
import {parse as parseURL} from 'url'

const ERROR_MESSAGE_DISPLAY_MS = 5000;

export default class Container extends Component {
  constructor(props) {
    super(props);
    this.state = {client:false, errors:[], schemaBump:0, bugs : false};
    this.bumpSchema = this.bumpSchema.bind(this);
    this.updateSecret = this.updateSecret.bind(this);
    this.observerCallback = this.observerCallback.bind(this);
    this._onBreadcrumbItemClicked = this._onBreadcrumbItemClicked.bind(this);

  }
  componentDidMount() {
    setTimeout(()=>{this.setState({viewportReady : true})}, 10);
  }
  updateSecret(data) {
    // get a new client for that secret and set state
    // observer for errors...
    var opts = {
      secret: data.secret,
      observer : this.observerCallback
    };
    if (data.endpoint) {
      var endpointURL = parseURL(data.endpoint)
      opts.domain = endpointURL.hostname
      opts.scheme = endpointURL.protocol.replace(/:$/,'')
      if (endpointURL.port) {
        opts.port = endpointURL.port
      }
    }
    // console.log("client", opts.secret, opts)
    var clientForSecret = new faunadb.Client(opts);
    this.setState({client : clientForSecret});
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

    const childrenWithProps = React.Children.map(this.props.children,
     (child) => React.cloneElement(child, {
       client: this.state.client,
       bumpSchema : this.bumpSchema,
       splat
     })
    );
    // console.log("Container",this.props);
    var path = (this.props.location||{}).pathname.replace(/\/db\/?/,'');

    var contents = <MessageBar messageBarType={ MessageBarType.error }>
      Please provide a FaunaDB secret.</MessageBar>;
    var firstItem = {text : "/", key : "/"};

    var crumb = <Breadcrumb items={[firstItem]}/>;
    if (splat && this.state.client) {
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
      contents = <div>
        {childrenWithProps}
      </div>
    }

    return (
        <FaunaRepl splat={splat} crumb={crumb} client={this.state.client}>
          <div className="ms-Grid ms-Fabric ms-font-m">
            {/* header */}
            <div className="ms-Grid-row header">
              <Link to="/"><img src={logo} className="logo" alt="logo" /></Link>
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
