import React, { Component } from 'react';
import {TextField, Checkbox} from 'office-ui-fabric-react'
import SchemaForm from "../schema-form/SchemaForm"
import faunadb from 'faunadb';
import clientForSubDB from "../clientForSubDB";
const q = faunadb.query, Ref = q.Ref;

export class ClassForm extends Component {
  constructor(props) {
    super(props)
    this.state = this.initialState();
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.classIndexToggled = this.classIndexToggled.bind(this);
  }
  initialState() {
    return {form:{name:"",ttl:"", history:""}, classIndex : false}
  }
  onSubmit() {
    const client = clientForSubDB(this.props.client, this.props.splat, "server");
    return client
      .query(q.Create(Ref("classes"), { name: this.state.form.name }))
      .then( (res) => {
        var promise = this.state.classIndex ?
          client.query(q.Create(Ref("indexes"), {
            name : "all_"+this.state.form.name,
            source : res.ref
          })) :
          Promise.resolve();
        return promise.then(() => {
          this.setState(this.initialState());
        })
    })
  }
  classIndexToggled() {
    this.setState({classIndex : !this.state.classIndex})
  }
  onChange(field, value) {
    var form = this.state.form;
    form[field] = value;
    this.setState({form})
  }
  render() {
    var context = this.props.splat ? " in "+this.props.splat : "";
    return (
      <SchemaForm buttonText="Create Class" onSubmit={this.onSubmit} bumpSchema={this.props.bumpSchema}>
        <h3>Create a class{context}</h3>
        <TextField label="Name"
          required={true}
          description="This name is used in queries and API calls."
          value={this.state.form.name}
          onChanged={this.onChange.bind(this, "name")}/>
        <TextField label="History (days)"
          placeholder={30}
          description="Instance history for this class will be retained for this many days."
          value={this.state.form.history}
          onChanged={this.onChange.bind(this, "history")}/>
        <TextField label="TTL (days)"
          description="Instances of the class will be removed if they have not been updated within the configured TTL."
          value={this.state.form.ttl}
          onChanged={this.onChange.bind(this, "ttl")}/>
        <h4>Indexing Options</h4>
        <Checkbox label="Create Class Index" checked={this.state.classIndex} onChange={this.classIndexToggled} />
        <p className="ms-TextField-description">Without a class index instances can only be loaded by
          Ref. A class index indexes all members of the class under a single key. For large
          datasets this can increase storage and processing overhead, so use class
          indexes sparingly in production.</p>
      </SchemaForm>
    )
  }
}
