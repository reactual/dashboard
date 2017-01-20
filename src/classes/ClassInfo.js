import React from 'react';
import { connect } from 'react-redux'
import ClassIndexes from './ClassIndexes'
import InstanceForm from './InstanceForm'

function ClassInfo({info, scopedClient, splat}) {
  return (
    <div className="ClassInfo">
      <h3>Class Details</h3>
      <dl>
        <dt>Name</dt><dd>{info.name}</dd>
        <dt>History</dt><dd>{info.history_days} days</dd>
        <ClassIndexes path={splat} scopedClient={scopedClient} info={info}/>
      </dl>
      <InstanceForm path={splat} scopedClient={scopedClient} info={info}/>
    </div>
  );
}

function mapStateToProps(state) {
  const defaultProps = { info: {} }

  const classes = state.classes

  if(!classes || !classes.byName || !classes.selectedClass)
    return defaultProps

  const info = classes.byName[classes.selectedClass]

  if(!info)
    return defaultProps

  return {
    info: info.classInfo
  }
}

export default connect(
  mapStateToProps
)(ClassInfo)

