import React, { Component } from 'react';
import {TextField, Button, ButtonType} from 'office-ui-fabric-react'
import faunadb from 'faunadb';
import clientForSubDB from "./clientForSubDB";
const q = faunadb.query, Ref = q.Ref;

export class ClassForm extends Component {
  constructor(props) {
    super(props)
    this.state = this.initialState();
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }
  initialState() {
    return {form:{name:"",ttl:"", history:""}, creating: false}
  }
  onSubmit(event) {
    event.preventDefault();
    var path = this.props.params.splat;
    var client = this.props.client;
    if (!client) return;
    var scopedClient;
    if (path) {
      scopedClient = clientForSubDB(client, path, "server");
    } else {
      // we are in a server key context
      // so we don't know our path and can't change our client
      scopedClient = client;
    }
    console.log("make class", scopedClient);
    this.setState({creating:true});
    scopedClient.query(q.Create(Ref("classes"), { name: this.state.form.name })).then( (res) => {
      console.log("created",res);
      this.props.bumpSchema();
      this.setState(this.initialState());
    }).catch(()=>{
      // error is displayed by page listener
      this.setState({creating:false});
    })
  }
  onChange(field, value) {
    var form = this.state.form;
    form[field] = value;
    this.setState({form})
  }
  render() {
    var context = this.props.params.splat ? " in "+this.props.params.splat : "";
    return (
      <div className="ClassForm">
        <form>
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
          <Button disabled={!!this.state.creating} buttonType={ ButtonType.primary } onClick={this.onSubmit}>Create Class</Button>
        </form>
      </div>
    )
  }
}
