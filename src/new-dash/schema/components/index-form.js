import React, { Component } from "react"
import { connect } from "react-redux"
import { TextField, Dropdown, Checkbox } from "office-ui-fabric-react"

import SchemaForm from "./schema-form"
import FieldsForm from "./fields-form"
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
      unique: false,
      source: { key: "", ref: null },
      terms: [{ field: [], transform: null }],
      values: [{ field: [], transform: null }],
      nonce: 0
    }
  }

  componentDidMount() {
    this.reset()
  }

  reset() {
    this.setState({
      ...this.initialState(),
      nonce: this.state.nonce + 1
    })
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

  addField(name) {
    return () => {
      this.setState({
        [name]: [
          ...this.state[name],
          { field: [], transform: null }
        ]
      })
    }
  }

  updateField(name) {
    return (index, field, transform) => {
      const fields = [...this.state[name]]
      fields[index] = { field, transform }

      this.setState({
        [name]: fields
      })
    }
  }

  onSubmit() {
    return notify(
      "Index created successfully",
      createIndex(
        this.props.client,
        this.props.path,
        this.indexConfig()
      )
    )
  }

  indexConfig() {
    return {
      name: this.state.name,
      source: this.state.source.ref,
      unique: this.state.unique,
      terms: this.state.terms.filter(term => term.field.length !== 0),
      values: this.state.values.filter(value => value.field.length !== 0)
    }
  }

  render() {
    const allFields = this.state.terms.concat(this.state.values)

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

      <FieldsForm
        title="Terms"
        knownFields={allFields}
        nonce={this.state.nonce}
        fields={this.state.terms}
        addField={this.addField("terms")}
        updateField={this.updateField("terms")} />

      <FieldsForm
        title="Values"
        knownFields={allFields}
        nonce={this.state.nonce}
        fields={this.state.values}
        addField={this.addField("values")}
        updateField={this.updateField("values")} />
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
