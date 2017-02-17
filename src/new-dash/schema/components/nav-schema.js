import React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"

import CustomNav from "./custom-nav"
import { selectedDatabase } from "../"
import { selectedResource, buildUrl } from "../../router"

const onClick = (e, link) => {
  e.preventDefault()
  browserHistory.push(link.url)
}

const asLinks = (items) => items.map(item => ({
  name: item.get("name"),
  key: item.get("url"),
  url: item.get("url")
})).toJS()

const NavSchema = ({ selectedDatabase, resourceUrl }) => {
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
        },
        {
          name: "Create Index",
          key: "create-Index",
          url: buildUrl(url, "indexes")
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

  return <CustomNav
    groups={links}
    selectedKey={resourceUrl}
    onLinkClick={onClick} />
}

export default connect(
  state => ({
    selectedDatabase: selectedDatabase(state),
    resourceUrl: selectedResource(state).getIn(["resource", "url"])
  })
)(NavSchema)
