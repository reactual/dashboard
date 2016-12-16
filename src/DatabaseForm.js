import React, { Component } from 'react';
// import { Link } from 'react-router';
import {TextField, Button, ButtonType} from 'office-ui-fabric-react'
import clientForSubDB from "./clientForSubDB";
import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

class SchemaForm extends Component {
  constructor(props) {
    super(props)
    this.state = {disabled:false}
    this.onSubmit = this.onSubmit.bind(this);
  }
  onSubmit(event) {
    event.preventDefault()
    this.setState({disabled:true});
    this.props.onSubmit().then(() => {
      this.setState({disabled:false});
      this.props.bumpSchema();
    }, () => {
      this.setState({disabled:false});
    })
  }
  render() {
    return (
      <div className="SchemaForm">
        <form>
          {this.props.children}
          <Button disabled={!!this.state.disabled}
            buttonType={ ButtonType.primary } onClick={this.onSubmit}>{this.props.buttonText}</Button>
        </form>
      </div>
    )
  }
}

function clientForPath(client, path, type) {
  if (!client) return;
  if (path) {
    return clientForSubDB(client, path, type);
  } else {
    // we are in a server key context so we don't know our path and can't change our client
    return client;
  }
}

export class DatabaseForm extends Component {
  constructor(props) {
    super(props)
    this.state = {form:{}};
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }
  onSubmit() {
    return clientForPath(this.props.client, this.props.params.splat, "admin")
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
