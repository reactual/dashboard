import React, { Component } from 'react';
import { connect } from 'react-redux'
import {TextField, Button, ButtonType} from 'office-ui-fabric-react'
import { createInstance } from "./index"

class InstanceForm extends Component {
  constructor(props) {
    super(props)
    this.state = {data:"{}"}
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }
  onChange(value) {
    this.setState({data: value})
  }
  onSubmit(event) {
    event.preventDefault();

    this.props.dispatch(createInstance(
      this.props.scopedClient,
      this.props.info.ref,
      JSON.parse(this.state.data)
    )).catch(error => console.error(error))
  }
  render() {
    var context = this.props.path ? " in "+this.props.path : "";
    return (
      <div className="InstanceForm">
        <form>
          <h4>Create an instance of {this.props.info.name}{context}</h4>
            <TextField label="Data"
              disabled={this.props.disabled}
              multiline
              description="The contents of this field will be evaluated with the Ref() constructor in scope."
              value={this.state.data}
              onChanged={this.onChange}/>
            <Button
              disabled={this.props.disabled}
              buttonType={ ButtonType.primary }
              onClick={this.onSubmit}>Create Instance</Button>
        </form>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    disabled: state.classes.fetchingData
  }
}

export default connect(
  mapStateToProps
)(InstanceForm)

