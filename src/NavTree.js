import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import {Nav} from 'office-ui-fabric-react'

import clientForSubDB from "./clientForSubDB";
import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

export class NavTree extends Component {
  constructor(props) {
    super(props);
    this.scopedClient.bind(this);
    this.state = {adminClient:null, serverClient:null};
  }
  discoverKeyType(client) {
    if (!client) return;
    this.setState({adminClient:null, serverClient:null});
    client.query(q.Create(Ref("databases"), { name: "console_key_type_discovery_db_created_and_deleted_automatically_always_safe_to_delete" }))
      .then(()=>{
        // we are an admin key, lets fix our mess
        console.log("admin key", client)
        return client.query(q.Delete(Ref("databases/console_key_type_discovery_db_created_and_deleted_automatically_always_safe_to_delete"))).then(()=>{
          console.log("admun key", client)
          this.setState({adminClient : client});
        })
      }, (error) => {
        // console.log("admin error", error)
        if (error.name === "PermissionDenied") {
          return client.query(q.Create(Ref("classes"), {
            name: "console_key_type_discovery_class_created_and_deleted_automatically_always_safe_to_delete"
          })).then(()=>{
            // we are a server key, lets fix our mess
            // console.log("server key", client)
            return client.query(q.Delete(Ref("classes/console_key_type_discovery_class_created_and_deleted_automatically_always_safe_to_delete"))).then(()=>{
              this.setState({serverClient : client});
            })
          }, (error) => {
            // console.log("server error", error)
            return client.query(q.Delete(Ref("classes/console_key_type_discovery_class_created_and_deleted_automatically_always_safe_to_delete")))

          })
        } else {
          // delete the test db in case we are out of sync
          return client.query(q.Delete(Ref("databases/console_key_type_discovery_db_created_and_deleted_automatically_always_safe_to_delete")))
        }
        // we might be a server key lets see if we can do stuff
      }).catch((err)=>{
        console.error(err)
      })
  }
  componentDidMount() {
    this.discoverKeyType(this.props.client)
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.client !== nextProps.client) {
      this.discoverKeyType(nextProps.client)
    }
  }
  scopedClient() {
    if (this.state.adminClient) {
      // return a client for the current page url path
      return clientForSubDB(this.state.adminClient, this.props.splat, "server")
    } else if (this.state.serverClient) {
      // todo in the future server clients should be able to access nested scopes
      return this.state.serverClient;
    }
  }
  render() {
    var path = this.props.path ? this.props.path.split('/') : [];
    const context = this.props.splat ? " for "+this.props.splat : "";
    if (this.state.serverClient || this.state.adminClient) {
      return (
        <div className="NavTree ms-Grid-row">
          {/* nav databases */}
          <div className="ms-Grid-col ms-u-sm12 ms-u-md3 ms-u-lg3 sidebar">
            <h3>Databases</h3>
            <NavDBTree path={path} adminClient={this.state.adminClient}/>
          </div>
          <div className="ms-Grid-col ms-u-sm12 ms-u-md3 ms-u-lg3">
            <h3>Schema{context}</h3>
            <NavSchema name={"/"+this.props.splat+"/"} path={path.slice(-2)} serverClient={this.scopedClient()} expanded/>
          </div>
          <div className="ms-Grid-col ms-u-sm12 ms-u-md6 ms-u-lg6">
            {this.props.children}
          </div>
        </div>
      );
    }
    return null;
  }
}

class NavSchema extends Component {
  constructor(props) {
    super(props);
    this.state = {classes:[], indexes:[]};
  }
  getInfos(props) {
    this.getClasses(props.serverClient);
    this.getIndexes(props.serverClient);
  }
  getClasses(client) {
    client && client.query(q.Paginate(Ref("classes"))).then( (res) => {
      this.setState({classes : res.data})
    }).catch(console.error.bind(console, "getClasses"))
  }
  getIndexes(client) {
    client && client.query(q.Paginate(Ref("indexes"))).then( (res) => {
      this.setState({indexes : res.data})
    }).catch(console.error.bind(console, "getIndexes"))
  }
  componentDidMount() {
    this.getInfos(this.props)
  }
  componentWillReceiveProps(nextProps) {
    this.getInfos(nextProps)
  }
  render() {
    var path = this.props.path;
    return (
      <dl>
        <dt key="_databases" >Create a <Link to={"/db"+this.props.name+"databases"}>database</Link></dt>
        <dt key="_classes" >Classes [<Link to={"/db"+this.props.name+"classes"}>+</Link>]</dt>
        {this.state.classes.map((classRow) => {
          const name = _valueTail(classRow.value);
          var highlighted=false;
          if (path[0] === "classes" && path[1] === name) {
            highlighted=true
          }
          return (
            <dd key={classRow.value}>
              <Link className={highlighted&&"highlighted"} to={"/db"+this.props.name+classRow.value}>{name}</Link>
            </dd>
          );
        })}
        <dt key="_indexes" >Indexes [<Link to={"/db"+this.props.name+"indexes"}>+</Link>]</dt>
        {this.state.indexes.map((indexRow) => {
          const name = _valueTail(indexRow.value);
          var highlighted=false;
          if (path[0] === "indexes" && path[1] === name) {
            highlighted=true
          }
          return (
            <dd key={indexRow.value}>
              <Link className={highlighted&&"highlighted"} to={"/db"+this.props.name+indexRow.value}>{name}</Link>
            </dd>
          );
        })}
      </dl>
    );
  }
}


class NavDBTree extends Component {
  constructor(props) {
    super(props);
    this.navLinkClicked = this.navLinkClicked.bind(this)
    this.state = {navGroup:{
      links:[]}
    };
  }
  componentDidMount() {
    this.getInfos(this.props)
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.client === nextProps.client) return;
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
        url : "/db/"+slug+name+"/info",
        key : slug+name
      }
    })
  }
  getDatabases(client) {
    client && client.query(q.Paginate(Ref("databases"))).then( (res) => {
      var rows = this.resultToNavRows(res);
      this.getDBsForRows(client, rows).then((decoratedRows)=>{
        this.setState({navGroup : {links : decoratedRows}})
      })
    }).catch(console.error.bind(console, "getDatabases"))
  }
  getDBsForRows(client, rows) {
    return Promise.all(rows.map((r, i) => {
      const dbClient = clientForSubDB(client, r.key, "admin")
      return dbClient.query(q.Paginate(Ref("databases"))).then( (res) => {
        return this.getDBsForRows(client, this.resultToNavRows(res, r.key)).then((rowLinks) => {
          rows[i].isExpanded = false;
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
