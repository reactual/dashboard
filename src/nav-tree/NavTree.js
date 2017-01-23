import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import {Nav} from 'office-ui-fabric-react'
import { clientForSubDB } from "../persistence/FaunaDB";
import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

import NavSchema from './NavSchema'

import { connect } from 'react-redux'

function NavTree(props) {
  if (props.adminClient || props.scopedServerClient) {
    return (
      <div className="NavTree ms-Grid-row">
        {/* nav databases */}
        <div className="ms-Grid-col ms-u-sm6 ms-u-md3 ms-u-lg2">
          <NavDBTree nonce={props.nonce} adminClient={props.adminClient}/>
        </div>
        <div className="ms-Grid-col ms-u-sm6 ms-u-md3 ms-u-lg2">
          <NavSchema nonce={props.nonce} splat={props.splat} serverClient={props.scopedServerClient} expanded/>
        </div>
        <div className="ms-Grid-col ms-u-sm12 ms-u-md6 ms-u-lg8">
          {props.children}
        </div>
      </div>
    );
  }
  return null;
}

function mapStateToProps(state) {
  return {
    adminClient: state.currentUser && state.currentUser.adminClient,
    serverClient: state.currentUser && state.currentUser.serverClient
  }
}

export default connect(mapStateToProps)(NavTree)

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
