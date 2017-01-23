import React, { Component } from 'react'
import { Nav } from 'office-ui-fabric-react'
import { browserHistory } from 'react-router';
import { getAllIndexes } from '../indexes'
import { getAllClasses } from '../classes'

import { connect } from 'react-redux'

class NavSchema extends Component {
  constructor(props) {
    super(props);
    this.navLinkClicked = this.navLinkClicked.bind(this)
  }
  getInfos(props) {
    this.getIndexes(props.serverClient)
    this.getClasses(props.serverClient)
  }
  getIndexes(client) {
    client && this.props.dispatch(getAllIndexes(client))
  }
  getClasses(client) {
    client && this.props.dispatch(getAllClasses(client))
  }
  componentDidMount() {
    this.getInfos(this.props)
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.splat)
      this.getInfos(nextProps)
  }
  navLinkClicked(e, link) {
    e.preventDefault();
    browserHistory.push(link.url)
  }
  render() {
    const dbpath = this.props.splat;
    var options = {
      name : "Options",
      links : [
        {
          name : "Create Database",
          key : (dbpath+"/"||"")+"databases",
          url : "/db/"+(dbpath?dbpath+"/":"")+"databases"
        },
        {
          name : "Create Class",
          key : (dbpath+"/"||"")+"classes",
          url : "/db/"+(dbpath?dbpath+"/":"")+"classes"
        },
        {
          name : "Create Index",
          key : (dbpath+"/"||"")+"indexes",
          url : "/db/"+(dbpath?dbpath+"/":"")+"indexes"
        }
      ]
    };
    return (
      <Nav groups={[options, this.props.classes, this.props.indexes]}
        onLinkClick={this.navLinkClicked}/>
    );
  }
}

let mapStateToProp = (state, ownProps) => {
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
