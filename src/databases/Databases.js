import React, { Component } from 'react';
import {TextField} from 'office-ui-fabric-react'
import SchemaForm from "../schema-form/SchemaForm"
import {DatabaseForm} from '../database-form/DatabaseForm';
import { clientForSubDB } from '../persistence/FaunaDB';

import faunadb from 'faunadb';
const q = faunadb.query;

export class DatabaseInfo extends Component {
  render() {
    const deleteForm = this.props.splat ? <DeleteDatabaseForm {...this.props}/> : undefined;
    return (
      <div>
        <h2>Database: {"/"+this.props.splat}</h2>
        <p>Each database in FaunaDB contains schema information like classes
          and indexes. Access keys are also scoped to a database. You can also set per-database quality-of-service.</p>
        {deleteForm}
        <DatabaseForm {...this.props}/>
      </div>
    )
  }
}
// use this to add delete database functionality alongside create databse functionality
export class DeleteDatabaseForm extends Component {
  constructor(props) {
    super(props)
    this.state = {name:"", correct : false};
    this.onSubmit = this.onSubmit.bind(this);
    this.nameChange = this.nameChange.bind(this);
  }
  onSubmit() {
    var parentSplat = this.props.splat.split('/');
    parentSplat.pop();
    parentSplat = parentSplat.join('/');
    console.log(this.props.rootClient, parentSplat, "admin");
    var parentAdminClient = clientForSubDB(this.props.rootClient, parentSplat, "admin");
    return parentAdminClient
      .query(q.Delete(q.Ref("databases/"+this.state.name)))
      .then((res)=>{
        this.setState({name:"", correct : false});
      })
  }
  nameChange(value) {
    var last = this.props.splat.split('/').pop();
    // console.log("nameChange", last, value, last === value);
    this.setState({
      name: value,
      correct : (last === value)
    })
  }
  render() {
    return (
    <SchemaForm disabled={!this.state.correct} buttonText="Delete Database" onSubmit={this.onSubmit} bumpSchema={this.props.bumpSchema}>
      <h3>Delete /{this.props.splat}</h3>
      <TextField label="Name"
        required={true}
        description="Type the database name (the last path segment) to confirm."
        value={this.state.name}
        onChanged={this.nameChange}/>
    </SchemaForm>
    )
  }
}
