import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Link } from 'react-router';
import { queryForIndexes } from "./index"

class ClassIndexes extends Component {
  componentDidMount() {
    this.queryForIndexes(this.props.scopedClient, this.props.info.ref)
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.info.ref !== nextProps.info.ref ||
      this.props.scopedClient !== nextProps.scopedClient) {
      this.queryForIndexes(nextProps.scopedClient, nextProps.info.ref)
    }
  }
  queryForIndexes(client, classRef) {
    classRef && client && this.props.dispatch(queryForIndexes(client, classRef))
  }
  render() {
    return (
      <div className="ClassIndexes">
        <dt>Covering Indexes</dt>
        {this.props.indexes.map((index)=>(
          <dd key={index.ref.value}>
            <Link to={this.props.path ? "/db/"+this.props.path+"/"+index.ref.value : "/db/"+index.ref.value}>{index.name}</Link>
          </dd>
        ))}
      </div>
    )
  }
}

function mapStateToProps(state) {
  const defaultProps = { indexes: [] }

  const classes = state.classes

  if(!classes || !classes.indexes || !classes.selectedClass)
    return defaultProps

  const indexesNames = classes.indexes[classes.selectedClass]

  const indexes = indexesNames
    .map(index => {
      const info = state.indexes.byName[index]
      return info ? info.indexInfo : null
    })
    .filter(index => index)

  return {
    indexes: indexes
  }
}

export default connect(
  mapStateToProps
)(ClassIndexes)

