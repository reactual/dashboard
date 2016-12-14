import React, { Component } from 'react';
import { Link } from 'react-router';
import {MessageBar, MessageBarType} from 'office-ui-fabric-react'
import faunadb from 'faunadb';
import {NavTree} from './NavTree'
import {SecretForm} from './Secrets'
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
  render() {
    const childrenWithProps = React.Children.map(this.props.children,
     (child) => React.cloneElement(child, {
       client: this.state.client,
       bumpSchema : this.bumpSchema
     })
    );
    // console.log("Container",this.props);
    var path = (this.props.location||{}).pathname.replace("/",'');
    return (
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
            {childrenWithProps}
          </div>
        </div>
      </div>
    )
  }
}
