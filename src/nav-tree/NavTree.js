import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import {Nav} from 'office-ui-fabric-react'
import { clientForSubDB } from "../persistence/FaunaDB";
import { getAllIndexes } from '../indexes'
import { getAllClasses } from '../classes'
import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

import { connect } from 'react-redux'

class NavTree extends Component {
  constructor(props) {
    super(props);
    this.scopedClient = this.scopedClient.bind(this);
  }
  scopedClient() { // todo this is available on the current user
    if (this.props.adminClient) {
      // return a client for the current page url path
      return clientForSubDB(this.props.adminClient, this.props.splat, "server")
    } else if (this.props.serverClient) {
      // todo in the future server clients should be able to access nested scopes
      return this.props.serverClient;
    }
  }
  render() {
    var path = this.props.path ? this.props.path.split('/') : [];
    if (this.props.serverClient || this.props.adminClient) {
      return (
        <div className="NavTree ms-Grid-row">
          {/* nav databases */}
          <div className="ms-Grid-col ms-u-sm6 ms-u-md3 ms-u-lg2">
            <NavDBTree nonce={this.props.nonce} path={path} adminClient={this.props.adminClient}/>
          </div>
          <div className="ms-Grid-col ms-u-sm6 ms-u-md3 ms-u-lg2">
            <NavSchema nonce={this.props.nonce} splat={this.props.splat} serverClient={this.scopedClient()} expanded/>
          </div>
          <div className="ms-Grid-col ms-u-sm12 ms-u-md6 ms-u-lg8">
            {this.props.children}
          </div>
        </div>
      );
    }
    return null;
  }
}

function mapStateToProps(state) {
  return {
    adminClient: state.currentUser && state.currentUser.adminClient,
    serverClient: state.currentUser && state.currentUser.serverClient
  }
}

export default connect(mapStateToProps)(NavTree)

class NavSchema1 extends Component {
  constructor(props) {
    super(props);
    this.navLinkClicked = this.navLinkClicked.bind(this)
  }
  getInfos(props) {
    this.getIndexes(props.serverClient)
    this.getClasses(props.serverClient)
  }
  getIndexes(client) {
    client && this.props.dispatch(getAllIndexes(client))
  }
  getClasses(client) {
    client && this.props.dispatch(getAllClasses(client))
  }
  componentDidMount() {
    this.getInfos(this.props)
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.splat)
      this.getInfos(nextProps)
  }
  navLinkClicked(e, link) {
    e.preventDefault();
    browserHistory.push(link.url)
  }
  render() {
    const dbpath = this.props.splat;
    var options = {
      name : "Options",
      links : [
        {
          name : "Create Database",
          key : (dbpath+"/"||"")+"databases",
          url : "/db/"+(dbpath?dbpath+"/":"")+"databases"
        },
        {
          name : "Create Class",
          key : (dbpath+"/"||"")+"classes",
          url : "/db/"+(dbpath?dbpath+"/":"")+"classes"
        },
        {
          name : "Create Index",
          key : (dbpath+"/"||"")+"indexes",
          url : "/db/"+(dbpath?dbpath+"/":"")+"indexes"
        }
      ]
    };
    return (
      <Nav groups={[options, this.props.classes, this.props.indexes]}
        onLinkClick={this.navLinkClicked}/>
    );
  }
}

let mapStateToProp = (state, ownProps) => {
  const dbpath = ownProps.splat;

  const indexesLinks = !state.indexes.byName ? [] :
    Object.keys(state.indexes.byName)
      .map(key => {
        const slug = dbpath ? dbpath+"/indexes" : "indexes"
        const index = state.indexes.byName[key].indexInfo
        const name = index.ref.id

        return {
          name : name,
          url : "/db/"+slug+"/"+name,
          key : slug+"/"+name
        }
      })

  const classesLinks = !state.classes.byName ? [] :
    Object.keys(state.classes.byName)
      .map(key => {
        const slug = dbpath ? dbpath+"/classes" : "classes"
        const clazz = state.classes.byName[key].classInfo
        const name = clazz.ref.id

        return {
          name : name,
          url : "/db/"+slug+"/"+name,
          key : slug+"/"+name
        }
      })

  return {
    classes: {
      name: "classes",
      links: classesLinks
    },
    indexes: {
      name: "indexes",
      links: indexesLinks
    }
  }
}

let NavSchema = connect(
  mapStateToProp
)(NavSchema1)

class NavDBTree1 extends Component {
  constructor(props) {
    super(props);
    this.navLinkClicked = this.navLinkClicked.bind(this)
    this.state = {navGroup:{links:[]}};
  }
  componentDidMount() {
    this.getInfos(this.props)
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.nonce === nextProps.nonce &&
      this.props.client === nextProps.client) return;
    this.getInfos(nextProps)
  }
  getInfos(props) {
    this.getDatabases(props.adminClient);
  }
  resultToNavRows(result, root) {
    const slug = root ? root+"/" : "";
    return result.data.map((db) => {
      var name = _valueTail(db.value);
      return {
        name : name,
        url : "/db/"+slug+name+"/databases",
        key : slug+name
      }
    })
  }
  getDatabases(client) {
    client && client.query(q.Paginate(Ref("databases"))).then( (res) => {
      var rows = this.resultToNavRows(res);
      this.getDBsForRows(client, rows, this.state.navGroup.links).then((decoratedRows)=>{
        this.setState({navGroup : {name: "databases", links : decoratedRows}})
      })
    }).catch(console.error.bind(console, "getDatabases"))
  }
  getDBsForRows(client, rows, oldRows) {
    return Promise.all(rows.map((r, i) => {
      var oldRow = oldRows.find(or=>or.key === r.key);
      var links = [];
      if (oldRow) {
        rows[i].isExpanded = oldRow.isExpanded;
        links = oldRow.links || [];
      }
      const dbClient = clientForSubDB(client, r.key, "admin")
      return dbClient.query(q.Paginate(Ref("databases"))).then( (res) => {
        return this.getDBsForRows(client, this.resultToNavRows(res, r.key), links).then((rowLinks) => {
          // rows[i].isExpanded = false;
          // console.log("rowLinks", rows[i].links, rowLinks)
          rows[i].links = rowLinks;
        })
      })
    })).then(()=>{
      return rows;
    })
  }
  getSubDatabases(client, db) {
    const dbPath = db.split('/')
    const dbClient = clientForSubDB(client, db, "admin")
    dbClient.query(q.Paginate(Ref("databases"))).then( (res) => {
      var rows = this.resultToNavRows(res, db);
      var topDBNavRows = this.state.navGroup;
      var target = topDBNavRows;
      dbPath.forEach((name)=>{
        target = target.links.find(r => r.name === name)
      })
      target.links = rows;
      this.setState({navGroup : topDBNavRows})
    }).catch(console.error.bind(console, "getSubDatabases", db))
  }
  navLinkClicked(e, link) {
    e.preventDefault();
    browserHistory.push(link.url)
    // todo we could save deep recursion til grandparent is unfolded
  }
  render() {
    return (
      <Flav groups={[this.state.navGroup]} onLinkClick={this.navLinkClicked}/>
    );
  }
}

let NavDBTree = connect()(NavDBTree1)

function _valueTail(string) {
  var parts = string.split("/")
  parts.shift()
  return parts.join("/")
}

import { css } from 'office-ui-fabric-react';
// A tag used for resolving links.
let _urlResolver;
function _isLinkSelected(link, selectedKey) {
    if (selectedKey && link.key === selectedKey) {
      return true;
    }

    // resolve is not supported for ssr
    if (typeof(window) === 'undefined') {
      return false;
    }

    if (!link.url) {
      return false;
    }

    _urlResolver = _urlResolver || document.createElement('a');

    _urlResolver.href = link.url || '';
    const target = _urlResolver.href;

    if (location.protocol + '//' + location.host + location.pathname === target) {
      return true;
    }

    if (location.href === target) {
      return true;
    }

    if (location.hash) {
      // Match the hash to the url.
      if (location.hash === link.url) {
        return true;
      }

      // Match a rebased url. (e.g. #foo becomes http://hostname/foo)
      _urlResolver.href = location.hash.substring(1);

      return _urlResolver.href === target;
    }

    return false;
  }
class Flav extends Nav {
  _renderCompositeLink(link, linkIndex, nestingLevel) {
    const isLinkSelected = _isLinkSelected(link, this.state.selectedKey);
    return (
      <div key={ link.key || linkIndex }
           className={ css('ms-Nav-compositeLink', { ' is-expanded': link.isExpanded, 'is-selected': isLinkSelected }) }>
        { (link.links && link.links.length > 0 ?
          <button
            className='ms-Nav-chevronButton ms-Nav-chevronButton--link'
            onClick={ this._onLinkExpandClicked.bind(this, link) }
            title={ (link.isExpanded ? this.props.expandedStateText : this.props.collapsedStateText) }
            >
            <i className='ms-Nav-chevron ms-Icon ms-Icon--ChevronDown'></i>
          </button> : null
        )}
          { !!link.onClick ? this._renderButtonLink(link, linkIndex) : this._renderAnchorLink(link, linkIndex, nestingLevel) }
      </div>
     );
  }
}
