import React, { Component } from 'react';
import { Link } from 'react-router';
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
            <NavLevel name="/" path={path} adminClient={this.state.adminClient} expanded/>
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

class NavLevel extends Component {
  constructor(props) {
    super(props);
    this.toggleDB.bind(this);
    this.state = {expanded:{}, databases:[], classes:[], indexes:[]};
  }
  componentDidMount() {
    this.getInfos(this.props)
  }
  componentWillReceiveProps(nextProps) {
    // console.log("NavLevel admin componentWillReceiveProps", (this.props.adminClient ||{})._secret, nextProps.adminClient._secret)
    // console.log("NavLevel server componentWillReceiveProps", (this.props.serverClient ||{})._secret, nextProps.serverClient._secret)
    this.getInfos(nextProps)
  }
  getInfos(props) {
    if (!props.expanded) return;
    this.getDatabases(props.adminClient);
  }
  getDatabases(client) {
    // console.log("getDatabases", client)
    client && client.query(q.Paginate(Ref("databases"))).then( (res) => {
      this.setState({databases : res.data})
    }).catch(console.error.bind(console, "getDatabases"))
  }
  toggleDB(value, event) {
    event.preventDefault();
    var expanded = this.state.expanded
    expanded[value] = !expanded[value]
    this.setState({expanded : expanded})
  }
  render() {
    // console.log("NavLevel",this.props)
    if (!this.props.expanded) {
      return (<div className="NavLevel"></div>)
    }
    var path = this.props.path;
    var cname = "NavLevel";
    if (this.props.highlighted){
      cname += " highlighted"
    }
    return (
      <div className={cname}>
        <dl>
          {this.state.databases.map((db) => {
            // render db name at this level
            const db_name = _valueTail(db.value);
            var db_path = [], highlighted=false;
            if (db_name === path[0]) {
              db_path = path.slice(1);
              highlighted=true;
            }
            return (
              <dd key={db.value}>
                <a href="#" onClick={this.toggleDB.bind(this, db.value)}>{!!this.state.expanded[db.value] ? "V" : ">"}</a>
                &nbsp;<Link className={highlighted&&"highlighted"} to={"/db"+this.props.name+db_name+"/info"}>{db_name}</Link>
                <NavLevel
                  name={this.props.name+db_name+"/"}
                  path={db_path}
                  highlighted={highlighted}
                  adminClient={clientForSubDB(this.props.adminClient, db_name, "admin")}
                  expanded={!!this.state.expanded[db.value]}/>
              </dd>
            );
          })}
        </dl>
      </div>
    );
  }
}

function _valueTail(string) {
  var parts = string.split("/")
  parts.shift()
  return parts.join("/")
}
