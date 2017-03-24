import React, { Component } from "react"
import { connect } from "react-redux"
import { Link } from "react-router"
import { query as q } from "faunadb"

import SchemaForm from "./schema-form"
import { selectedDatabase, selectedClass } from "../"
import { notify } from "../../notifications"
import { faunaClient } from "../../authentication"
import { KeyType } from "../../persistence/faunadb-wrapper"
import { ReplEditor, evalQuery } from "../../repl"
import { InstanceInfo } from "../../dataset"

class ClassInfo extends Component {

  constructor(props) {
    super(props)
    this.state = this.initialState()
  }

  initialState() {
    return {
      data: "{}",
      instance: null
    }
  }

  componentDidMount() {
    this.reset()
  }

  reset() {
    this.setState(this.initialState())
  }

  onSubmit() {
    const { client, path, clazz } = this.props

    return notify("Instance created successfully", () =>
      evalQuery(data =>
        client.query(
          path,
          KeyType.SERVER,
          q.Create(clazz.get("ref"), { data })
        )
      )(this.state.data).then(
        instance => this.setState({ instance })
      )
    )
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
            onSubmit={this.onSubmit.bind(this)}>
              <ReplEditor
                mode={ReplEditor.Mode.TEXT_AREA}
                name="class-data-editor"
                value={this.state.data}
                onChange={this.onChange.bind(this)} />

              <p className="ms-TextField-description">
                The contents of this field will be evaluated with the context of a repl and placed in
                the "data" field of the new instance.
              </p>
          </SchemaForm>
        </dl>

        <InstanceInfo instance={this.state.instance} />
      </div>
  }
}

export default connect(
  state => ({
    path: selectedDatabase(state).get("path"),
    clazz: selectedClass(state),
    client: faunaClient(state)
  })
)(ClassInfo)
