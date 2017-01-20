import React from 'react';
import { connect } from 'react-redux'
import IndexQuery from '../index-query/IndexQuery'
import IndexCard from './IndexCard'

function IndexInfo({info, scopedClient, splat}) {
  return (
    <div>
      <h3>Index Details</h3>
      <IndexCard path={splat} info={info}/>
      <IndexQuery client={scopedClient} info={info}/>
    </div>
  )
}

function mapStateToProps(state) {
  const defaultProps = { info: {} }

  const indexes = state.indexes

  if(!indexes || !indexes.byName || !indexes.selectedIndex)
    return defaultProps

  const info = indexes.byName[indexes.selectedIndex]

  if(!info)
    return defaultProps

  return {
    info: info.indexInfo
  }
}

export default connect(
  mapStateToProps
)(IndexInfo)

