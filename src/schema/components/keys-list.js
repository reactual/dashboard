import React, { Component } from "react"
import { connect } from "react-redux"
import { query as q } from "faunadb"
import { browserHistory } from "react-router"

import { selectedDatabase } from "../"
import { watchForError } from "../../notifications"
import { monitorActivity } from "../../activity-monitor"
import { faunaClient } from "../../authentication"
import { buildResourceUrl } from "../../router"
import { Pagination, InstanceInfo } from "../../dataset"
import { KeyType } from "../../persistence/faunadb-wrapper"

export class KeysList extends Component {

  constructor(props) {
    super(props)
    this.state = this.initialState()
    this.listKeys = this.listKeys.bind(this)
    this.onRefSelected = this.onRefSelected.bind(this)
  }

  initialState() {
    return {
      key: null
    }
  }

  componentDidMount() {
    this.setState(this.initialState())
  }

  listKeys(options) {
    const { client, path } = this.props

    return client.query(path, KeyType.ADMIN,
      q.Map(
        q.Paginate(q.Ref("keys"), options),
        ref => q.Let({ key: q.Get(ref) }, key => ({
          "Name": q.Select(["data", "name"], key, null),
          "Role": q.Select("role", key),
          "Database": q.Select("database", key),
          "Ref": ref
        }))
      )
    )
  }

  onRefSelected(ref) {
    if (ref.class.value === "keys") {
      return this.props.dispatch(
        monitorActivity(
          watchForError("Error when fetching key information", () =>
            this.props.client
              .query(this.props.path, KeyType.ADMIN, q.Get(ref))
              .then(key => this.setState({ key }))
          )
        )
      )
    }

    browserHistory.push(
      buildResourceUrl(this.props.url, ref.id, "databases")
    )
  }

  render() {
    return <div>
      <Pagination
        query={this.listKeys}
        onSelectRef={this.onRefSelected} />

      <InstanceInfo
        keyType={KeyType.ADMIN}
        instance={this.state.key} />
    </div>
  }
}

export default connect(
  state => ({
    client: faunaClient(state),
    path: selectedDatabase(state).get("path"),
    url: selectedDatabase(state).get("url")
  })
)(KeysList)
