import React, { Component } from 'react';
// import { Link } from 'react-router';
import {TextField} from 'office-ui-fabric-react'
import clientForSubDB from "./clientForSubDB";
import SchemaForm from "./SchemaForm"
import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

export class DatabaseForm extends Component {
  constructor(props) {
    super(props)
    this.state = {form:{}};
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }
  onSubmit() {
    return clientForSubDB(this.props.client, this.props.params.splat, "admin")
      .query(q.Create(Ref("databases"), { name: this.state.form.name }))
      .then((res)=>{
        this.setState({form:{name:""}});
      })
  }
  onChange(field, value) {
    var form = this.state.form;
    form[field] = value;
    this.setState({form})
  }
  render() {
    var context = this.props.params.splat ? " in "+this.props.params.splat : "";
    const form = this.state.form;
    return (
      <SchemaForm buttonText="Create Databases" onSubmit={this.onSubmit} bumpSchema={this.props.bumpSchema}>
        <h3>Create a database{context}</h3>
        <TextField label="Name"
          required={true}
          description="This name is used in queries and API calls."
          value={form.name}
          onChanged={this.onChange.bind(this, "name")}/>
      </SchemaForm>
    )
  }
}

DatabaseForm.propTypes = {
  client : React.PropTypes.instanceOf(faunadb.Client)
}
