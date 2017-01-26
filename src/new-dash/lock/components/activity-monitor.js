import React from "react"
import { connect } from "react-redux"
import { Spinner } from "office-ui-fabric-react"

import { isLocked } from "../"

const ActivityMonitor = (props) => {
  if (!props.isLocked) return null
  return <Spinner label="Processing request..." />
}

export default connect(
  state => ({
    isLocked: isLocked(state)
  })
)(ActivityMonitor)
