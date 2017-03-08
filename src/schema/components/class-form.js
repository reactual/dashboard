import React, { Component } from "react"
import { connect } from "react-redux"
import { TextField, Checkbox } from "office-ui-fabric-react"

import SchemaForm from "./schema-form"
import { createClass, createIndex, selectedDatabase } from "../"
import { faunaClient } from "../../authentication"
import { notify } from "../../notifications"

class ClassForm extends Component {
  constructor(props) {
    super(props)
    this.state = this.initialState()
  }

  initialState() {
    return {
      name: "",
      history: "",
      ttl: "",
      classIndex: false
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

  onToggle(field) {
    return () => {
      this.setState({
        [field]: !this.state[field]
      })
    }
  }

  onSubmit() {
    return notify("Class created successfully", dispatch => {
      let res = dispatch(createClass(
        this.props.faunaClient,
        this.props.selectedPath,
        this.classConfig()
      ))

      if (this.state.classIndex) {
        res = res.then(clazz => dispatch(createIndex(
          this.props.faunaClient,
          this.props.selectedPath,
          this.indexConfig(clazz)
        )))
      }

      return res
    })
  }

  classConfig() {
    const { name, history, ttl } = this.state

    const config = { name }
    if (ttl) config.ttl_days = this.parseIntOfFail(ttl)
    if (history) config.history_days = this.parseIntOfFail(history)

    return config
  }

  parseIntOfFail(n) {
    const res = parseInt(n, 10)
    if (isNaN(res)) throw Error(`Invalid integer ${n}`)
    return res
  }


  indexConfig(clazz) {
    return {
      name: `all_${clazz.name}`,
      source: clazz.ref
    }
  }

  render() {
    return <SchemaForm
        title="Create a new class"
        buttonText="Create Class"
        onSubmit={this.onSubmit.bind(this)}
        onFinish={this.reset.bind(this)}>

          <TextField label="Name"
            required={true}
            description="This name is used in queries and API calls."
            value={this.state.name}
            onBeforeChange={this.onChange("name")} />

          <TextField label="History (days)"
            placeholder={30}
            description="Instance history for this class will be retained for this many days."
            value={this.state.history}
            onBeforeChange={this.onChange("history")} />

          <TextField label="TTL (days)"
            description="Instances of the class will be removed if they have not been updated within the configured TTL."
            value={this.state.ttl}
            onBeforeChange={this.onChange("ttl")} />

          <h4>Indexing Options</h4>

          <Checkbox label="Create Class Index"
            checked={this.state.classIndex}
            onChange={this.onToggle("classIndex")} />

          <p className="ms-TextField-description">
            Without a class index instances can only be loaded by
            Ref. A class index indexes all members of the class under a single key. For large
            datasets this can increase storage and processing overhead, so use class
            indexes sparingly in production.
          </p>
      </SchemaForm>
  }
}

export default connect(
  state => ({
    selectedPath: selectedDatabase(state).get("path"),
    faunaClient: faunaClient(state)
  })
)(ClassForm)
