import React from "react"
import { connect } from "react-redux"
import { Button, ButtonType } from "office-ui-fabric-react"

import { selectedDatabase } from "../"
import { monitorActivity, isBusy } from "../../activity-monitor"

const SchemaForm = (props) => {
  const onSubmit = (e) => {
    e.preventDefault()
    return props
      .dispatch(monitorActivity(props.onSubmit()))
      .then(props.onFinish)
  }

  return <form>
      <h3>{props.title}{props.context ? " in " + props.context : null}</h3>
      {props.children}
      <Button
        disabled={props.disabled}
        buttonType={ButtonType.primary}
        onClick={onSubmit}>
          {props.buttonText}
      </Button>
    </form>
}

export default connect(
  state => ({
    disabled: isBusy(state),
    context: selectedDatabase(state).get("path").join("/")
  })
)(SchemaForm)
