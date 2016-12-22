import React, { Component } from 'react';
import { Link } from 'react-router';
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
    this.state = {client:false, errors:[], schemaBump:0};
    this.bumpSchema = this.bumpSchema.bind(this);
    this.updateSecret = this.updateSecret.bind(this);
    this.observerCallback = this.observerCallback.bind(this);
    this._onBreadcrumbItemClicked = this._onBreadcrumbItemClicked.bind(this);

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
  _onBreadcrumbItemClicked(item) {
    console.log("Breadcrumb",item)
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
    if (this.state.client) {
      crumb = <Breadcrumb
      items={ [firstItem].concat(splat.split('/').map((db_name, i, path)=>{
        return {
          text : db_name,
          key : db_name,
          onClick : this._onBreadcrumbItemClicked.bind(this, path.slice(0,i+1))
        }
      })) }
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
            </div>
            <div className="ms-Grid-row">
              {/* nav */}
              <div className="ms-Grid-col ms-u-sm12 ms-u-md5 ms-u-lg4 sidebar">
                <NavTree nonce={this.state.schemaBump}
                  client={this.state.client} path={path}/>
                <SecretForm onSubmit={this.updateSecret} />
              </div>
              {/* main */}
              <div className="ms-Grid-col ms-u-sm12 ms-u-md7 ms-u-lg8">
                {this.state.errors.map((error)=>{
                  return (<MessageBar
                  messageBarType={ MessageBarType.error }>{error.message}</MessageBar>)
                })}
                {contents}
              </div>
            </div>
          </div>
        </FaunaRepl>
    )
  }
}
