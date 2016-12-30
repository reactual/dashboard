import React, { Component } from 'react';
// import { Link } from 'react-router';
import {
  TextField,
  Button, ButtonType,
  Dialog, DialogType, DialogFooter
} from 'office-ui-fabric-react'

export class SecretForm extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {secret:""};
  }
  handleChange(key, value) {
    var setter = {};
    setter[key] = value;
    this.setState(setter);
  }
  handleSubmit() {
    this.props.onSubmit(this.state)
  }
  render() {
    return (
      <div className="SecretForm">

        <Dialog
          isOpen={ this.props.showDialog }
          type={ DialogType.largeHeader }
          title='Connect to FaunaDB'
          subText='Visit https://fauna.com/account/keys or talk to your administrator to provision keys.'
          isBlocking={ true }
        >
        <TextField label="FaunaDB Endpoint URL"
          description="Leave this empty for Fauna Cloud."
          placeholder="https://db.fauna.com/"
          value={this.state.endpoint} onChanged={this.handleChange.bind(this,"endpoint")}/>
        <TextField required type="password" label="Key Secret"
          description="The secret associated with your FaunaDB key."
          value={this.state.secret} onChanged={this.handleChange.bind(this,"secret")}/>

          <DialogFooter>
            <Button buttonType={ ButtonType.primary } onClick={this.handleSubmit}>Use Secret</Button>
          </DialogFooter>
        </Dialog>


      </div>
    )
  }
}
