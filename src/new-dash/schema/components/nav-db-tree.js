import React from "react"
import Immutable from "immutable"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { Nav } from 'office-ui-fabric-react';

const onClick = (url) => (e) => {
  e.preventDefault()
  browserHistory.push(url)
}

const databaseLinks = (schema, dbUrl = "") => {
  const databaseTree = (db) => {
    const name = db.getIn(["info", "name"])
    const url = `${dbUrl}/${name}`

    return {
      name,
      url,
      key: url,
      isExpanded: true,
      onClick: onClick(url),
      links: databaseLinks(db, url)
    }
  }

  return schema
    .getIn(["databases", "byName"], Immutable.Map())
    .map(nested => databaseTree(nested))
    .toList()
    .toJS()
}

const NavDBTree = (props) => {
  const links = [{
    links: [{
      name: "Databases",
      isExpanded: true,
      onClick: onClick("/"),
      links: databaseLinks(props.schema)
    }]
  }]

  return <Nav groups={links} />
}

export default connect(
  state => ({
    schema: state.get("schema")
  })
)(NavDBTree)
