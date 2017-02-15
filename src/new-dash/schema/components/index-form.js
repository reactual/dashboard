import React, { Component } from "react"
import { connect } from "react-redux"
import { TextField, Dropdown, Checkbox } from "office-ui-fabric-react"

import SchemaForm from "./schema-form"
import { selectedDatabase, createIndex } from "../"
import { notify } from "../../notifications"
import { faunaClient } from "../../authentication"

class IndexForm extends Component {
  constructor(props) {
    super(props)
    this.state = this.initialState()
  }

  initialState() {
    return {
      name: "",
      source: { key: "", ref: null },
      unique: false,
      terms: "",
      values: ""
    }
  }

  componentDidMount() {
    this.reset()
  }

  reset() {
    this.setState(this.initialState())
  }

  onChange(field) {
    return value => this.setState({
      [field]: value
    })
  }

  onSelect(field) {
    return value => {
      this.setState({
        [field]: {
          key: value.key,
          ref: value.ref
        }
      })
    }
  }

  onToggle(field) {
    return value => this.setState({
      [field]: !this.state[field]
    })
  }

  onSubmit() {
    return notify(
      "Index created successfully",
      dispatch => dispatch(createIndex(
        this.props.client,
        this.props.path,
        this.indexConfig()
      ))
    )
  }

  indexConfig() {
    let config = {
      name: this.state.name,
      source: this.state.source.ref,
      unique: this.state.unique,
    }

    if(this.state.terms.trim()) config.terms = JSON.parse(this.state.terms)
    if(this.state.values.trim()) config.values = JSON.parse(this.state.values)

    return config
  }

  render() {
    return <SchemaForm
      title="Create a new Index"
      buttonText="Create Index"
      onSubmit={this.onSubmit.bind(this)}
      onFinish={this.reset.bind(this)}>

      <TextField
        label="Name"
        required={true}
        description="This name is used in queries and API calls."
        value={this.state.name}
        onBeforeChange={this.onChange("name")}/>

      <Dropdown
        label="Source Class"
        onChanged={this.onSelect("source")}
        selectedKey={this.state.source.key}
        options={this.props.classes.map(clazz => ({
          key: clazz.get("url"),
          text: clazz.get("name"),
          ref: clazz.get("ref")
        })).toJS()} />

      <Checkbox
        label="Unique"
        checked={this.state.unique}
        onChange={this.onToggle("unique")} />

      <TextField
        label="Terms"
        description="JSON list of terms to be indexed."
        placeholder='[{"field": ["data", "name"], "transform": "casefold"}, {"field": ["data", "age"]}]'
        value={this.state.terms}
        onBeforeChange={this.onChange("terms")} />

      <TextField
        label="Values"
        description="JSON list of values to be included."
        placeholder='[{"field": ["data", "name"], "transform": "casefold"}, {"field": ["data", "age"]}]'
        value={this.state.values}
        onBeforeChange={this.onChange("values")} />
    </SchemaForm>
  }
}

export default connect(
  state => {
    const database = selectedDatabase(state)
    return {
      client: faunaClient(state),
      path: database.get("path"),
      classes: database.get("classes")
    }
  }
)(IndexForm)
