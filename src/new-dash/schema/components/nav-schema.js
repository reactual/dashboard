import React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { Nav } from "office-ui-fabric-react"

import { selectedDatabase } from "../"
import { buildUrl } from "../../router"

const onClick = (e, link) => {
  e.preventDefault()

  if (link.url) {
    browserHistory.push(link.url)
  }
}

const asLinks = (items) => {
  return items.map(item => {
    return {
      name: item.get("name"),
      key: item.get("url")
    }
  }).toJS()
}

const NavSchema = ({ selectedDatabase }) => {
  const url = selectedDatabase.get("url")

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
          url: buildUrl(url, "classes")
        }
      ],
      isExpanded: true
    },
    {
      name: "Classes",
      links: asLinks(selectedDatabase.get("classes")),
      isExpanded: true
    },
    {
      name: "Indexes",
      links: asLinks(selectedDatabase.get("indexes")),
      isExpanded: true
    }
  ]

  return <Nav groups={links} onLinkClick={onClick} />
}

export default connect(
  state => ({
    selectedDatabase: selectedDatabase(state)
  })
)(NavSchema)
