import React from "react"
import { connect } from "react-redux"
import { Nav } from "office-ui-fabric-react"

import { classesInSelectedDatabase, indexesInSelectedDatabase } from "../"

const onClick = (e) => e.preventDefault()

const asLinks = (items) => {
  return items.map(name => {
    return {
      name: name,
      key: name,
      onClick: onClick
    }
  }).toJS()
}

const NavSchema = (props) => {
  const links = [{
    links: [
      {
        name: "Classes",
        links: asLinks(props.classes),
        isExpanded: true
      },
      {
        name: "Indexes",
        links: asLinks(props.indexes),
        isExpanded: true
      }
    ]
  }]

  return <Nav groups={links} />
}

export default connect(
  state => ({
    classes: classesInSelectedDatabase(state),
    indexes: indexesInSelectedDatabase(state)
  })
)(NavSchema)
