import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router';
import { Button, MessageBar, MessageBarType, Breadcrumb } from 'office-ui-fabric-react'

import { createClient, clientForSubDB } from '../persistence/FaunaDB';
import { loginWithUnknownUser, logout } from "../authentication/login"
import { pushNotification, removeNotification, Notification, NotificationType } from '../notification'
import NotificationBar from '../notification/NotificationBar'

import {NavTree} from '../nav-tree/NavTree'
import {SecretForm} from '../secrets/Secrets'
import IntercomWidget from '../external/intercom/Widget'
import FaunaRepl from '../fauna-repl/FaunaRepl'
import logo from '../logo.svg';

class Container extends Component {
  constructor(props) {
    super(props);
    this.bumpSchema = this.bumpSchema.bind(this);
    this.updateSecret = this.updateSecret.bind(this);
    this.logout = this.logout.bind(this);
    this.hideErrorMessages = this.hideErrorMessages.bind(this)
    this.showErrorMessages = this.showErrorMessages.bind(this)
    this._onBreadcrumbItemClicked = this._onBreadcrumbItemClicked.bind(this);

    this.state = {
      client: createClient(
        props.currentUser,
        this.hideErrorMessages,
        this.showErrorMessages
      ),
      errors: [],
      schemaBump: 0
    };
  }

  componentWillReceiveProps(next) {
    if (this.props.currentUser === next.currentUser) return;

    this.setState({
      client: createClient(
        next.currentUser,
        this.hideErrorMessages,
        this.showErrorMessages
      ),
    })
  }

  componentDidMount() {
    setTimeout(()=>{this.setState({viewportReady : true})}, 10);
  }

  showErrorMessages(messages) {
    const errors = messages.map(
      message => new Notification(NotificationType.ERROR, message)
    )

    this.setState({ errors: this.state.errors.concat(errors) })
    this.props.dispatch(pushNotification(errors))
  }

  hideErrorMessages() {
    this.props.dispatch(removeNotification(this.state.errors))
    this.setState({ errors: [] })
  }

  updateSecret(data) {
    this.props.dispatch(loginWithUnknownUser(data.endpoint, data.secret))
  }

  logout() {
    this.props.dispatch(logout())
    browserHistory.push("/")
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
              <NotificationBar />
              {contents}
            </NavTree>
          </div>
          <IntercomWidget user={this.props.currentUser} />
        </FaunaRepl>
    )
  }
}

export default connect(
  state => ({
    currentUser: state.currentUser
  })
)(Container)
