import React, { Component } from 'react';
import { connect } from 'react-redux'
import IndexQuery from '../index-query/IndexQuery'
import IndexCard from './IndexCard'
import { updateSelectedIndex } from './index'

class IndexInfo extends Component {
  componentDidMount() {
    const name = this.props.params.name
    this.props.dispatch(updateSelectedIndex(name))
  }
  render() {
    return (
      <div>
        <h3>Index Details</h3>
        <IndexCard path={this.props.splat} info={this.props.info}/>
        <IndexQuery client={this.props.scopedClient} info={this.props.info}/>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const indexes = state.indexes

  if(!indexes || !indexes.byName || !indexes.selectedIndex)
    return { info: {} }

  const info = indexes.byName[indexes.selectedIndex]

  return {
    info: info.indexInfo
  }
}

export default connect(
  mapStateToProps
)(IndexInfo)

