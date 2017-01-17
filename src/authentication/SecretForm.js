import React, { Component } from "react"
import { connect } from "react-redux"
import { parse as parseURL } from 'url'
import { loginWithUnknownUser } from "."
import { restoreUserSession } from "./session"

import {
  TextField,
  Button, ButtonType,
  Dialog, DialogType, DialogFooter
} from "office-ui-fabric-react"

class SecretForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      show: false,
      endpoint: "",
      secret: "",
      errors: {}
    }
  }

  componentDidMount() {
    this.verifySession(this.props.currentUser)
  }

  componentWillReceiveProps(props) {
    this.verifySession(props.currentUser)
  }

  verifySession(user) {
    if (!user) {
      this.login(restoreUserSession())
    }
  }

  login(action) {
    if (!action) {
      this.setState({ show: true })
      return
    }

    this.props.dispatch(action)
      .then(() => this.setState({ show: false }))
      .catch(error => this.setState({
        show: true,
        errors: { secret: this.formatError(error) }
      }))
  }

  formatError(error) {
    if (error.name === "Unauthorized") return "Unauthorized: Please, verify your key's secret and try again."
    if (error.message) return error.message
    return `Unexpected error: ${error}`
  }

  handleChange(key, value) {
    this.setState({
      [key]: value,
      errors: { [key]: null }
    })
  }

  handleSubmit(event) {
    event.preventDefault()
    if (!this.validate()) return
    this.login(loginWithUnknownUser(this.state.endpoint, this.state.secret))
  }

  validate() {
    let errors = {}

    const url = parseURL(this.state.endpoint)
    if (!url.hostname || !url.protocol) errors.endpoint = "Invalid URL."
    if (!this.state.secret.trim()) errors.secret = "Please, inform the key's secret for your FaunaDB key."

    this.setState({ errors })
    return Object.keys(errors).length === 0
  }

  reset() {
    this.setState({
      secret: "",
      error: "",
      errors: {}
    })
  }

  render() {
    return (
      <Dialog
        isOpen={this.state.show}
        type={DialogType.largeHeader}
        title="Connect to FaunaDB"
        subText="Visit https://fauna.com/account/keys or talk to your administrator to provision keys."
        isBlocking={true}
        onLayerMounted={this.reset.bind(this)}
      >
        <form>
          <TextField label="FaunaDB Endpoint URL"
            description="Leave this empty for Fauna Cloud."
            placeholder="https://db.fauna.com/"
            value={this.state.endpoint} onBeforeChange={this.handleChange.bind(this, "endpoint")}
            errorMessage={this.state.errors.endpoint} />

          <TextField required={true} type="password" label="Key Secret"
            description="The secret associated with your FaunaDB key."
            value={this.state.secret} onBeforeChange={this.handleChange.bind(this, "secret")}
            errorMessage={this.state.errors.secret} />

          <DialogFooter>
            <Button buttonType={ButtonType.primary} onClick={this.handleSubmit.bind(this)}>
              Use Secret
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    )
  }
}

const stateToProps = state => ({
  currentUser: state.currentUser
})

// Dialog component is not consired pure by react-redux
// https://github.com/reactjs/react-redux/blob/master/docs/troubleshooting.md#my-views-arent-updating-when-something-changes-outside-of-redux
export default connect(stateToProps, null, null, { pure: false })(SecretForm)
