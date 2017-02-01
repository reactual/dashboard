import React from "react"
import { connect } from "react-redux"
import { Spinner } from "office-ui-fabric-react"

import { isBusy } from "../"

const ActivityMonitor = (props) => {
  if (!props.isBusy) return null
  return <Spinner label="Processing request..." />
}

export default connect(
  state => ({
    isBusy: isBusy(state)
  })
)(ActivityMonitor)
