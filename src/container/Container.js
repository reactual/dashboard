import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router';
import { Button, MessageBar, MessageBarType, Breadcrumb } from 'office-ui-fabric-react'

import { logout } from "../authentication"
import { logoutUrl } from "../authentication/session"
import SecretForm from '../authentication/SecretForm'
import NotificationBar from '../notification/NotificationBar'

import NavTree from '../nav-tree/NavTree'
import IntercomWidget from '../external/intercom/Widget'
import FaunaRepl from '../fauna-repl/FaunaRepl'
import logo from '../logo.svg';

class Container extends Component {
  constructor(props) {
    super(props);
    this.bumpSchema = this.bumpSchema.bind(this);
    this.logout = this.logout.bind(this);
    this._onBreadcrumbItemClicked = this._onBreadcrumbItemClicked.bind(this);
    this.state = { schemaBump: 0 };
  }

  logout() {
    const redirect = logoutUrl()
    this.props.dispatch(logout())
    window.location = redirect
  }

  bumpSchema(){
    this.setState({schemaBump : this.state.schemaBump+1})
  }

  _onBreadcrumbItemClicked(item, e, crumb) {
    browserHistory.push(crumb.url);
  }

  render() {
    const splat = this.props.params.splat ?
      this.props.params.splat.replace(/^db\/?/,'') : "";

    const clients = this.props.clients
    const rootClient = clients.rootClient

    var sharedProps = {
      scopedClient: clients.scopedServerClient,
      scopedAdminClient: clients.scopedAdminClient,
      bumpSchema: this.bumpSchema,
      rootClient: clients.rootClient,
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
    if (rootClient) {
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
              <ul className="menu">
                <li><a href="http://fauna.com/tutorials" target="_blank">Tutorials</a></li>
                <li><a href="http://fauna.com/documentation" target="_blank">Documentation</a></li>
                <li><a href="https://fauna.com/resources#drivers" targe="_blank">Drivers</a></li>
                <li><Button className="logout" onClick={this.logout}>Log out</Button></li>
              </ul>
              <SecretForm />
            </div>
            <NavTree
              nonce={this.state.schemaBump}
              client={rootClient}
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
    currentUser: state.currentUser,
    notifications: state.notifications,
    clients: state.clients
  })
)(Container)
