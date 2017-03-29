import React, { Component } from "react"
import { connect } from "react-redux"
import { query as q } from "faunadb"
import { Link } from "react-router"
import { Button, ButtonType } from "office-ui-fabric-react"

import { selectedClass, selectedDatabase, createIndex } from "../"
import { faunaClient } from "../../authentication"
import { isBusy, monitorActivity } from "../../activity-monitor"
import { watchForError } from "../../notifications"
import { linkForRef } from "../../router"
import { InstancesList } from "../../dataset"
import { KeyType } from "../../persistence/faunadb-wrapper"

export class ClassBrowser extends Component {

  constructor(props) {
    super(props)
    this.state = this.initialState(props)
    this.createClassIndex = this.createClassIndex.bind(this)
    this.onSelectRef = this.onSelectRef.bind(this)
  }

  initialState(props) {
    const classIndex = this.findClassIndex(props.clazz)

    return  {
      classIndex,
      queryFn: this.buildQueryFn(props, classIndex)
    }
  }

  findClassIndex(clazz) {
    const res = clazz.get("indexes")
      .filter(idx => idx.get("classIndex"))
      .sortBy(idx => idx.get("name"))

    return res.isEmpty() ? null : res.getIn([0, "ref"])
  }

  componentDidMount() {
    this.setState(this.initialState(this.props))
  }

  componentWillReceiveProps(next) {
    if (this.props.clazz !== next.clazz) {
      this.setState(this.initialState(next))
    }
  }

  buildQueryFn({ client, path }, classIndex) {
    return opts =>
      client.query(path, KeyType.SERVER,
        q.Map(
          q.Paginate(q.Match(classIndex), opts),
          ref => q.Get(ref)
        )
      ).then(res => ({
        ...res,
        data: res.data.map(inst => ({
          ref: inst.ref,
          ...inst.data
        }))
      }))
  }

  createClassIndex(e) {
    e.preventDefault()
    const { client, path, clazz } = this.props

    return this.props.dispatch(
      monitorActivity(
        watchForError(
          "Unexpected error while creating class index",
          createIndex(client, path, {
            name: `all_${clazz.get("name")}`,
            source: clazz.get("ref")
          })
        )
      )
    )
  }

  onSelectRef(ref) {
    const { client, path } = this.props

    return this.props.dispatch(
      monitorActivity(
        watchForError(
          "Unexpected error while fetching instance information", () =>
          client.query(path, KeyType.SERVER, q.Get(ref))
        )
      )
    )
  }

  render() {
    const { databaseUrl } = this.props
    const { classIndex } = this.state
    const indexLink = linkForRef(databaseUrl, classIndex)
    if (!classIndex) return this.renderNoClassIndexPage()

    return <div>
      <InstancesList query={this.state.queryFn} onSelectRef={this.onSelectRef} />
      <p className="ms-TextField-description">
        This view was derived from <Link to={indexLink.get("url")}>{indexLink.get("name")}</Link>.
      </p>
    </div>
  }

  renderNoClassIndexPage() {
    const { isBusy } = this.props

    return <div>
      <p>No eligible class index found.</p>
      <p className="ms-TextField-description">
        Without a class index instances can only be loaded by
        Ref. A class index indexes all members of the class under a single key. For large
        datasets this can increase storage and processing overhead, so use class
        indexes sparingly in production.
      </p>
      <Button
        buttonType={ButtonType.primary}
        disabled={isBusy}
        onClick={this.createClassIndex}>
          Create a class index now
      </Button>
    </div>
  }

}

export default connect(
  state => ({
    path: selectedDatabase(state).get("path"),
    databaseUrl: selectedDatabase(state).get("url"),
    clazz: selectedClass(state),
    client: faunaClient(state),
    isBusy: isBusy(state)
  })
)(ClassBrowser)
