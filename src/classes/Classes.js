import React, { Component } from 'react';
import { Link } from 'react-router';
import {TextField, Button, ButtonType} from 'office-ui-fabric-react'
import faunadb from 'faunadb';
import clientForSubDB from "../clientForSubDB";
import {getClassInfo} from "./actions"
const q = faunadb.query, Ref = q.Ref;

class ClassInfo extends Component {
  componentDidMount() {
    this.getClassInfo(this.props.client, this.props.splat, this.props.params.name)
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.params.name !== nextProps.params.name ||
      this.props.client !==  nextProps.client) {
      this.getClassInfo(nextProps.client, nextProps.splat, nextProps.params.name)
    }
  }
  getClassInfo(client, path, name) {
    if (!client) return;
    const scopedClient = clientForSubDB(client, path, "server");

    this.props.dispatch(getClassInfo(scopedClient, name))
  }
  render() {
    const info = this.props.info
    const scopedClient = this.props.scopedClient
    return (
        <div className="ClassInfo">
          <h3>Class Details</h3>
          <dl>
            <dt>Name</dt><dd>{info.name}</dd>
            <dt>History</dt><dd>{info.history_days} days</dd>
            <ClassIndexes path={this.props.splat} client={scopedClient} info={info}/>
          </dl>
          <InstanceForm path={this.props.splat} client={scopedClient} info={info}/>
        </div>
      );
  }
}

import { connect } from 'react-redux'

const mapStateToProps = state => {
  if(typeof state.classes.selectedClass === 'undefined')
    return { info: {} }

  const info = state.classes[state.classes.selectedClass]

  return {
    info: info.classInfo,
    scopedClient: info.scopedClient
  }
}

export default connect(
  mapStateToProps
)(ClassInfo)

class ClassIndexes extends Component {
  constructor(props) {
    super(props);
    this.state = {indexes:[]};
  }
  componentDidMount() {
    this.queryForIndexes(this.props.client, this.props.info.ref)
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.info.ref !== nextProps.info.ref ||
      this.props.client !==  nextProps.client) {
      this.queryForIndexes(nextProps.client, nextProps.info.ref)
    }
  }
  queryForIndexes(client, classRef) {
    client && client.query(q.Filter(q.Map(q.Paginate(Ref("indexes")), function (indexRef) {
      return q.Get(indexRef)
    }), function (indexInstance) {
      return q.If(q.Contains("source", indexInstance),
        q.Equals(classRef, q.Select("source", indexInstance)),
        true
      );
    })).then( (response) => {
      this.setState({indexes:response.data})
    })
  }
  render() {
    return (
      <div className="ClassIndexes">
        <dt>Covering Indexes</dt>
        {this.state.indexes.map((index)=>(
          <dd key={index.ref.value}><Link to={this.props.path ? "/db/"+this.props.path+"/"+index.ref.value : "/db/"+index.ref.value}>{index.name}</Link></dd>
        ))}
      </div>
    )
  }
}

class InstanceForm extends Component {
  constructor(props) {
    super(props)
    this.state = {form:{data:"{}"}}
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }
  onChange(field, value) {
    var form = this.state.form;
    form[field] = value;
    this.setState({form})
  }
  onSubmit(event) {
    event.preventDefault();
    var data = JSON.parse(this.state.form.data);
    var createQuery = q.Create(this.props.info.ref, {
      data: data
    });
    this.props.client && this.props.client.query(createQuery)
  }
  render() {
    var context = this.props.path ? " in "+this.props.path : "";
    return (
      <div className="InstanceForm">
        <form>
          <h4>Create an instance of {this.props.info.name}{context}</h4>
            <TextField label="Data"
              multiline
              description="The contents of this field will be evaluated with the Ref() constructor in scope."
              value={this.state.form.data}
              onChanged={this.onChange.bind(this, "data")}/>
            <Button buttonType={ ButtonType.primary } onClick={this.onSubmit}>Create Instance</Button>
        </form>
      </div>
    );
  }
}
