import React from 'react'
import { Nav } from 'office-ui-fabric-react'
import { browserHistory } from 'react-router';

import { connect } from 'react-redux'

function navLinkClicked(e, link) {
  e.preventDefault();
  browserHistory.push(link.url)
}

function NavSchema({splat, classes, indexes}) {
  const dbpath = splat ? `${splat}/` : ""

  const options = {
    name : "Options",
    links : [
      {
        name : "Create Database",
        key : `${dbpath}databases`,
        url : `/db/${dbpath}databases`
      },
      {
        name : "Create Class",
        key : `${dbpath}classes`,
        url : `/db/${dbpath}classes`
      },
      {
        name : "Create Index",
        key : `${dbpath}indexes`,
        url : `/db/${dbpath}indexes`
      }
    ]
  }

  return <Nav groups={[options, classes, indexes]} onLinkClick={navLinkClicked} />
}

function mapStateToProp(state, ownProps) {
  const dbpath = ownProps.splat;

  const indexesLinks = !state.indexes.byName ? [] :
    Object.keys(state.indexes.byName)
      .map(key => {
        const slug = dbpath ? dbpath+"/indexes" : "indexes"
        const index = state.indexes.byName[key].indexInfo
        const name = index.ref.id

        return {
          name : name,
          url : "/db/"+slug+"/"+name,
          key : slug+"/"+name
        }
      })

  const classesLinks = !state.classes.byName ? [] :
    Object.keys(state.classes.byName)
      .map(key => {
        const slug = dbpath ? dbpath+"/classes" : "classes"
        const clazz = state.classes.byName[key].classInfo
        const name = clazz.ref.id

        return {
          name : name,
          url : "/db/"+slug+"/"+name,
          key : slug+"/"+name
        }
      })

  return {
    classes: {
      name: "classes",
      links: classesLinks
    },
    indexes: {
      name: "indexes",
      links: indexesLinks
    }
  }
}

export default connect(
  mapStateToProp
)(NavSchema)
