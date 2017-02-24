import React, { Component } from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"

import CustomNav from "./custom-nav"
import { databaseTree, loadMoreDatabases } from "../"
import { selectedResource } from "../../router"
import { faunaClient } from "../../authentication"
import { watchForError } from "../../notifications"
import { monitorActivity } from "../../activity-monitor"

class NavDBTree extends Component {
  constructor(props) {
    super(props)
     this.state = { links: [] }
  }

  componentDidMount() {
    this.buildLinks(this.props.databaseTree)
  }

  componentWillReceiveProps(next) {
    if (this.props.databaseTree !== next.databaseTree) {
      this.buildLinks(next.databaseTree)
    }
  }

  buildLinks(databaseTree) {
    this.setState({
      links: this.databaseLinks(databaseTree, this.state.links)
    })
  }

  databaseLinks(databaseTree, links) {
    const toLink = (db) => {
      const key = db.get("url")
      const link = links.find(l => l.key === key) || {}

      return {
        key,
        url: key,
        name: db.get("name"),
        links: this.databaseLinks(db, link.links || []),
        isExpanded: (typeof link.isExpanded === "undefined" ? true : link.isExpanded)
      }
    }

    const res = databaseTree.get("databases").map(toLink).toJS()

    if (databaseTree.get("hasMore"))  {
      res.push({
        key: `${databaseTree.get("url")}-load-more`,
        name: "Load more",
        icon: "CirclePlus",
        onClick: this.loadMoreDatabases.bind(this,
          databaseTree.get("path"),
          databaseTree.get("cursor")
        )
      })
    }

    return res
  }

  loadMoreDatabases(dbPath, cursor) {
    this.props.dispatch(
      monitorActivity(
        watchForError(
          "Unexpected error while fetching databases",
          loadMoreDatabases(this.props.client, dbPath, cursor)
        )
      )
    )
  }

  onClick(e, link) {
    e.preventDefault()
    browserHistory.push(link.url)
  }

  render() {
    const links = [{
      name: "Databases",
      links: this.state.links
    }]

    return <CustomNav
      groups={links}
      selectedKey={this.props.databaseUrl}
      onLinkClick={this.onClick.bind(this)} />
  }
}

export default connect(
  state => ({
    databaseTree: databaseTree(state),
    databaseUrl: selectedResource(state).getIn(["database", "url"]),
    client: faunaClient(state)
  })
)(NavDBTree)
