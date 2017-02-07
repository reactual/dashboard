import React, { Component } from "react"
import { connect } from "react-redux"
import { Link } from "react-router"
import { TextField } from "office-ui-fabric-react"
import { query as q } from "faunadb"

import SchemaForm from "./schema-form"
import { selectedDatabase, selectedClass } from "../"
import { notify } from "../../notifications"
import { faunaClient } from "../../authentication"
import { KeyType } from "../../persistence/faunadb-wrapper"

class ClassInfo extends Component {
  constructor(props) {
    super(props)
    this.state = this.initialState()
  }

  initialState() {
    return {
      data: "{}"
    }
  }

  componentDidMount() {
    this.reset()
  }

  reset() {
    this.setState(this.initialState())
  }

  onSubmit() {
    const { faunaClient, path, clazz } = this.props

    return notify("Instance created successfully", () => {
      return faunaClient.query(path, KeyType.SERVER, q.Create(
        clazz.get("ref"), {
          data: JSON.parse(this.state.data)
        }
      ))
    })
  }

  onChange(data) {
    this.setState({ data })
  }

  render() {
    const days = (value) => value !== null ? `${value} days` : ""
    const clazz = this.props.clazz

    return <div>
        <h3>Class Details</h3>
        <dl>
          <dt>Name</dt><dd>{clazz.get("name")}</dd>
          <dt>History</dt><dd>{days(clazz.get("historyDays"))}</dd>
          <dt>TTL</dt><dd>{days(clazz.get("ttlDays"))}</dd>

          <dt>Covering Indexes</dt>
          {clazz.get("indexes").map(index => (
            <dd key={index.get("url")}>
              <Link to={index.get("url")}>{index.get("name")}</Link>
            </dd>
          ))}

          <SchemaForm
            title={`Create an instance of ${clazz.get("name")}`}
            buttonText="Create Instance"
            onSubmit={this.onSubmit.bind(this)}
            onFinish={this.reset.bind(this)}>
              <TextField label="Data"
                multiline
                description="The contents of this field will be evaluated with the context of a repl."
                value={this.state.data}
                onChanged={this.onChange.bind(this)}/>
          </SchemaForm>
        </dl>
      </div>
  }
}

export default connect(
  state => ({
    path: selectedDatabase(state).get("path"),
    clazz: selectedClass(state),
    faunaClient: faunaClient(state)
  })
)(ClassInfo)
