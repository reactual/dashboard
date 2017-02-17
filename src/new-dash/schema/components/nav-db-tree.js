import React, { Component } from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"

import CustomNav from "./custom-nav"
import { databaseTree } from "../"
import { selectedResource } from "../../router"

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
      const name = db.get("name")
      const key = db.get("url")
      const link = links.find(l => l.key === key) || {}

      return {
        name,
        key,
        url: key,
        links: this.databaseLinks(db, link.links || []),
        isExpanded: (typeof link.isExpanded === "undefined" ? true : link.isExpanded)
      }
    }

    return databaseTree
      .get("databases")
      .map(toLink)
      .toJS()
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
    databaseUrl: selectedResource(state).getIn(["database", "url"])
  })
)(NavDBTree)
