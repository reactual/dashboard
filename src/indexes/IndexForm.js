import React, { Component } from "react"
import { connect } from "react-redux"
import { TextField, Dropdown, Checkbox } from "office-ui-fabric-react"
import SchemaForm from "../schema-form/SchemaForm"
import { query as q } from "faunadb"
import { createIndex } from "."

class IndexForm extends Component {
  constructor(props) {
    super(props)
    this.state = this.initialState()
    this.onSubmit = this.onSubmit.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onSelectClass = this.onSelectClass.bind(this)
    this.onUniqueToggled = this.onUniqueToggled.bind(this)
  }

  initialState() {
    return {
      form: {
        name: "",
        unique: false,
        source: "",
        terms: "",
        values: ""
      }
    }
  }

  indexConfig() {
    const { name, unique, source, terms, values } = this.state.form

    let config = {
      name,
      unique,
      source: q.Ref(source)
    }

    if (terms) config.terms = JSON.parse(this.state.form.terms)
    if (values) config.values = JSON.parse(this.state.form.values)

    return config
  }

  onSubmit() {
    return this.props
      .dispatch(createIndex(this.props.scopedClient, this.indexConfig()))
      .then(() => this.setState(this.initialState()))
  }

  onChange(field, value) {
    this.setState({
      form: {
        ...this.state.form,
        [field]: value
      }
    })
  }

  onSelectClass(option) {
    this.onChange("source", option.key)
  }

  onUniqueToggled(isUnique) {
    this.onChange("unique", isUnique)
  }

  render() {
    const context = this.props.splat ? " in "+ this.props.splat : ""

    const dropdownClasses = this.props.classes.map(ref => {
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
          onBeforeChange={this.onChange.bind(this, "name")}/>
        <Dropdown label="Source Class" options={dropdownClasses}
          onChanged={this.onSelectClass} selectedKey={this.state.form.source}/>
        <Checkbox label="Unique" checked={this.state.form.unique} onChanged={this.onUniqueToggled} />
        <TextField label="Terms"
          description="JSON list of terms to be indexed."
          placeholder='[{"field": ["data", "name"], "transform": "casefold"}, {"field": ["data", "age"]}]'
          value={this.state.form.terms}
          onBeforeChange={this.onChange.bind(this, "terms")}/>
        <TextField label="Values"
          description="JSON list of values to be included."
          placeholder='[{"field": ["data", "name"], "transform": "casefold"}, {"field": ["data", "age"]}]'
          value={this.state.form.values}
          onBeforeChange={this.onChange.bind(this, "values")}/>
      </SchemaForm>
    )
  }
}

export default connect(state => {
  const classes = Object.values((state.classes || {}).byName || {})

  return {
    classes: classes.map(elem => elem.classInfo.ref)
  }
})(IndexForm)
