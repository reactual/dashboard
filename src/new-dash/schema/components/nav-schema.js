import React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { Nav } from "office-ui-fabric-react"

import { classesInSelectedDatabase, indexesInSelectedDatabase } from "../"
import { selectedDatabaseUrl } from "../../router"

const onClick = (e, link) => {
  e.preventDefault()
  browserHistory.push(link.url)
}

const asLinks = (items) => {
  return items.map(name => {
    return {
      name: name,
      key: name
    }
  }).toJS()
}

const NavSchema = ({ url, classes, indexes }) => {
  const links = [
    {
      name: "Options",
      links: [
        {
          name: "Create Database",
          key: "create-database",
          url
        },
        {
          name: "Create Class",
          key: "create-class",
          url: `${url}/classes`
        }
      ],
      isExpanded: true
    },
    {
      name: "Classes",
      links: asLinks(classes),
      isExpanded: true
    },
    {
      name: "Indexes",
      links: asLinks(indexes),
      isExpanded: true
    }
  ]

  return <Nav groups={links} onLinkClick={onClick} />
}

export default connect(
  state => ({
    url: selectedDatabaseUrl(state),
    classes: classesInSelectedDatabase(state),
    indexes: indexesInSelectedDatabase(state)
  })
)(NavSchema)
