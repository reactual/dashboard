import React, { Component } from "react"
import { connect } from "react-redux"
import { TextField, Button } from "office-ui-fabric-react"

import "./delete-form.css"
import { faunaClient } from "../../authentication"
import { monitorActivity, isBusy } from "../../activity-monitor"

class DeleteForm extends Component {
  constructor(props) {
    super(props)
    this.state = this.initialState()
  }

  initialState() {
    return {
      name: ""
    }
  }

  componentDidMount() {
    this.reset()
  }

  componentWillReceiveProps(next) {
    if (this.props.validateName !== next.validateName) {
      this.reset()
    }
  }

  reset() {
    this.setState(this.initialState())
  }

  onChange(name) {
    this.setState({ name })
  }

  remove(e) {
    e.preventDefault()
    return this.props.dispatch(monitorActivity(this.props.onDelete()))
  }

  render() {
    return <div className="delete-form">
      <h3>{this.props.title}</h3>
      <form>
        <TextField
          required={true}
          label="Name"
          description={"Type the "+(this.props.type||"resource")+" name to confirm."}
          value={this.state.name}
          onBeforeChange={this.onChange.bind(this)} />

        <Button
          disabled={(this.props.validateName !== this.state.name) || this.props.isBusy}
          onClick={this.remove.bind(this)}>
          {this.props.buttonText}
        </Button>
      </form>
    </div>
  }
}

export default connect(
  state => ({
    client: faunaClient(state),
    isBusy: isBusy(state)
  })
)(DeleteForm)
