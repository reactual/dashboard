import React, { Component } from "react"
import { connect } from "react-redux"
import { TextField } from "office-ui-fabric-react"

import SchemaForm from "./schema-form"
import { createDatabase, selectedDatabase } from "../"
import { notify } from "../../notifications"
import { faunaClient } from "../../authentication"

class DatabaseForm extends Component {
  constructor(props) {
    super(props)
    this.state = this.initialState()
  }

  initialState() {
    return {
      name: ""
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

  onSubmit() {
    return notify("Database created successfully", createDatabase(
      this.props.faunaClient,
      this.props.selectedPath,
      this.state
    ))
  }

  render() {
    return <SchemaForm
        title="Create a new database"
        buttonText="Create Database"
        onSubmit={this.onSubmit.bind(this)}
        onFinish={this.reset.bind(this)}>
          <TextField label="Name"
            required={true}
            value={this.state.name}
            onBeforeChange={this.onChange("name")}
            description="This name is used in queries and API calls." />
      </SchemaForm>
  }
}

export default connect(
  state => ({
    selectedPath: selectedDatabase(state).get("path"),
    faunaClient: faunaClient(state)
  })
)(DatabaseForm)
