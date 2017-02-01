import React from "react"
import { connect } from "react-redux"
import { Button, ButtonType } from "office-ui-fabric-react"

import { monitorActivity, isBusy } from "../../activity-monitor"

const SchemaForm = (props) => {
  const onSubmit = (e) => {
    e.preventDefault()
    return props
      .dispatch(monitorActivity(props.onSubmit()))
      .then(props.onFinish)
  }

  return <form>
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
    disabled: isBusy(state)
  })
)(SchemaForm)
