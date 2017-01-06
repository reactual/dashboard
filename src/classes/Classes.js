import React, { Component } from 'react';
import { Link } from 'react-router';
import {TextField, Button, ButtonType} from 'office-ui-fabric-react'
import faunadb from 'faunadb';
import { updateSelectedClass, queryForIndexes } from "./actions"
const q = faunadb.query;

class ClassInfo extends Component {
  componentDidMount() {
    this.getClassInfo(this.props.scopedClient, this.props.splat, this.props.params.name)
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.params.name !== nextProps.params.name) {
      this.getClassInfo(nextProps.scopedClient, nextProps.splat, nextProps.params.name)
    }
  }
  getClassInfo(scopedClient, path, name) {
    if (!scopedClient) return;
    this.props.dispatch(updateSelectedClass(name))
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
            <ClassIndexes path={this.props.splat} scopedClient={scopedClient} info={info}/>
          </dl>
          <InstanceForm path={this.props.splat} scopedClient={scopedClient} info={info}/>
        </div>
      );
  }
}

import { connect } from 'react-redux'

const mapStateToProps = (state, props) => {
  const classes = state.classes

  if(!classes || !classes.byName || !classes.selectedClass)
    return { info: {} }

  const info = classes.byName[classes.selectedClass]

  if(!info)
    return { info: {} }

  return {
    info: info.classInfo
  }
}

export default connect(
  mapStateToProps
)(ClassInfo)

class ClassIndexes1 extends Component {
  componentDidMount() {
    this.queryForIndexes(this.props.scopedClient, this.props.path, this.props.info.ref)
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.info.ref !== nextProps.info.ref ||
      this.props.scopedClient !==  nextProps.scopedClient) {
      this.queryForIndexes(nextProps.scopedClient, nextProps.path, nextProps.info.ref)
    }
  }
  queryForIndexes(client, database, classRef) {
    classRef && client && this.props.dispatch(queryForIndexes(client, classRef))
  }
  render() {
    return (
      <div className="ClassIndexes">
        <dt>Covering Indexes</dt>
        {this.props.indexes.map((index)=>(
          <dd key={index.ref.value}><Link to={this.props.path ? "/db/"+this.props.path+"/"+index.ref.value : "/db/"+index.ref.value}>{index.name}</Link></dd>
        ))}
      </div>
    )
  }
}

const mapStateToProps1 = (state, props) => {
  const defaultProps = { indexes: [] }

  const classes = state.classes

  if(!classes || !classes.indexes || !classes.selectedClass)
    return defaultProps

  const indexesNames = classes.indexes[classes.selectedClass]

  const indexes = indexesNames
    .map(index => state.indexes.byName[index])
    .filter(index => index)
    .map(index => index.indexInfo)

  return {
    indexes: indexes
  }
}

let ClassIndexes = connect(
  mapStateToProps1
)(ClassIndexes1)

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
    this.props.scopedClient && this.props.scopedClient.query(createQuery)
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
