import React, { Component } from "react"
import { connect } from "react-redux"
import { TextField } from "office-ui-fabric-react"

import SchemaForm from "./schema-form"
import { createDatabase } from "../"
import { selectedDatabasePath } from "../../router"
import { notify } from "../../notifications"

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
      this.props.selectedDatabase,
      this.state
    ))
  }

  render() {
    const context = this.props.selectedDatabase.join("/")

    return <SchemaForm
        buttonText="Create Database"
        onSubmit={this.onSubmit.bind(this)}
        onFinish={this.reset.bind(this)}>
          <h3>Create a new database {context ? "in " + context : ""}</h3>
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
    selectedDatabase: selectedDatabasePath(state)
  })
)(DatabaseForm)
