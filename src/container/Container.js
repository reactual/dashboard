import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router';
import { Button, MessageBar, MessageBarType, Breadcrumb } from 'office-ui-fabric-react'

import { clientForSubDB } from '../persistence/FaunaDB';
import { logout } from "../authentication"
import NotificationBar from '../notification/NotificationBar'
import SecretForm from '../authentication/SecretForm'

import {NavTree} from '../nav-tree/NavTree'
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
    this.props.dispatch(logout())
    browserHistory.push("/")
  }

  bumpSchema(){
    this.setState({schemaBump : this.state.schemaBump+1})
  }

  _onBreadcrumbItemClicked(item, e, crumb) {
    browserHistory.push(crumb.url);
  }

  render() {
    const rootClient = this.props.currentUser ? this.props.currentUser.client : null

    var splat = this.props.params.splat ?
      this.props.params.splat.replace(/^db\/?/,'') : "";

    var sharedProps = {
      scopedClient : clientForSubDB(rootClient, splat, "server"),
      scopedAdminClient : clientForSubDB(rootClient, splat, "admin"),
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
              <Button className="logout" onClick={this.logout}>Log out</Button>
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
    notifications: state.notifications
  })
)(Container)
