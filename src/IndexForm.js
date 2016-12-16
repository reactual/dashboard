import React, { Component } from 'react';
import {TextField, Dropdown, Checkbox} from 'office-ui-fabric-react'
import SchemaForm from "./SchemaForm"
import faunadb from 'faunadb';
import clientForSubDB from "./clientForSubDB";
const q = faunadb.query, Ref = q.Ref;

window.q = q;

export class IndexForm extends Component {
  constructor(props) {
    super(props)
    this.state = {form:{}, classes:[]};
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onSelectClass = this.onSelectClass.bind(this);
    this.onUniqueToggled = this.onUniqueToggled.bind(this);
  }
  componentDidMount() {
    this.getClasses(this.props.client, this.props.splat)
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.params.splat !== nextProps.params.splat ||
      this.props.params.name !== nextProps.params.name ||
      this.props.client !==  nextProps.client) {
        this.setState({classes:[]});
        this.getClasses(nextProps.client, nextProps.params.splat)
    }
  }
  getClasses(client, path) {
    if (!client) return;
    clientForSubDB(client, path, "server").query(q.Paginate(Ref("classes"))).then( (res) => {
      this.setState({classes : res.data})
    }).catch(console.error.bind(console, "getClasses"))
  }

  onSubmit() {
    return clientForSubDB(this.props.client, this.props.splat, "server")
      .query(q.Create(Ref("indexes"), this.indexOptions())).then( (res) => {
        this.setState({form:{name:"",terms:"",values:""}})
      })
  }
  indexOptions() {
    var opts = {
      name: this.state.form.name,
      unique : this.state.unique
    };
    if (this.state.selected) {
      opts.source = q.Ref(this.state.selected)
    }
    if (this.state.form.terms) {
      opts.terms = JSON.parse(this.state.form.terms)
    }
    if (this.state.form.values) {
      opts.values = JSON.parse(this.state.form.values)
    }
    return opts;
  }
  onChange(field, value) {
    var form = this.state.form;
    form[field] = value;
    this.setState({form})
  }
  onSelectClass(option) {
    this.setState({selected : option.key})
  }
  onUniqueToggled(isUnique) {
    this.setState({unique: isUnique})
  }
  render() {
    var context = this.props.splat ? " in "+this.props.splat : "";
    var dropdownClasses = this.state.classes.map((ref)=>{
      return {
        key : ref.value,
        text  : ref.value.split("/").pop()
      }
    })
    return (
      <SchemaForm buttonText="Create Index" onSubmit={this.onSubmit} bumpSchema={this.props.bumpSchema}>
        <h3>Create an index{context}</h3>
        <TextField label="Name"
          required={true}
          description="This name is used in queries and API calls."
          value={this.state.form.name}
          onChanged={this.onChange.bind(this, "name")}/>
        <Dropdown label="Source Class" options={dropdownClasses}
          onChanged={this.onSelectClass} selectedKey={this.state.selected}/>
        <Checkbox label="Unique" checked={this.state.unique} onChanged={this.onUniqueToggled} />
        <TextField label="Terms"
          description="JSON list of terms to be indexed."
          placeholder='[{"field": ["data", "name"], "transform": "casefold"}, {"field": ["data", "age"]}]'
          value={this.state.form.terms}
          onChanged={this.onChange.bind(this, "terms")}/>
        <TextField label="Values"
          description="JSON list of values to be included."
          placeholder='[{"field": ["data", "name"], "transform": "casefold"}, {"field": ["data", "age"]}]'
          value={this.state.form.values}
          onChanged={this.onChange.bind(this, "values")}/>
      </SchemaForm>
    )
  }
}
