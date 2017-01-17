import React, { Component } from 'react';
import { connect } from 'react-redux'
import ClassIndexes from './ClassIndexes'
import InstanceForm from './InstanceForm'
import { updateSelectedClass } from "./index"

class ClassInfo extends Component {
  componentDidMount() {
    const name = this.props.params.name
    this.props.dispatch(updateSelectedClass(name))
  }
  render() {
    const info = this.props.info
    const scopedClient = this.props.scopedClient
    return (
        <div className="ClassInfo">
          <h3>Class Details</h3>
          <dl>
            <dt>Name</dt><dd>{info.name}</dd>
            <dt>History</dt><dd>{info.history_days} days</dd>
            <ClassIndexes path={this.props.splat} scopedClient={scopedClient} info={info}/>
          </dl>
          <InstanceForm path={this.props.splat} scopedClient={scopedClient} info={info}/>
        </div>
      );
  }
}

function mapStateToProps(state) {
  const classes = state.classes

  if(!classes || !classes.byName || !classes.selectedClass)
    return { info: {} }

  const info = classes.byName[classes.selectedClass]

  if(!info)
    return { info: {} }

  return {
    info: info.classInfo
  }
}

export default connect(
  mapStateToProps
)(ClassInfo)

