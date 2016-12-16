import React, { Component } from 'react';
import {Button, ButtonType} from 'office-ui-fabric-react'

export default class SchemaForm extends Component {
  constructor(props) {
    super(props)
    this.state = {disabled:false}
    this.onSubmit = this.onSubmit.bind(this);
  }
  onSubmit(event) {
    event.preventDefault()
    this.setState({disabled:true});
    this.props.onSubmit().then(() => {
      this.setState({disabled:false});
      this.props.bumpSchema();
    }, () => {
      this.setState({disabled:false});
    })
  }
  render() {
    return (
      <div className="SchemaForm">
        <form>
          {this.props.children}
          <Button disabled={!!this.state.disabled}
            buttonType={ ButtonType.primary } onClick={this.onSubmit}>{this.props.buttonText}</Button>
        </form>
      </div>
    )
  }
}

SchemaForm.propTypes = {
  bumpSchema : React.PropTypes.func.isRequired,
  onSubmit : React.PropTypes.func.isRequired
}
