import React, { Component } from 'react';
import {Button, ButtonType, CommandBar} from 'office-ui-fabric-react'
// import clientForSubDB from "./clientForSubDB";
import Ace from "./repl/Ace"
import Repl from "./repl"

require('brace/mode/javascript');
require('brace/theme/monokai');

export default class FaunaRepl extends Component {
  constructor(props) {
    super(props)
    this.state = {
      opened : false
    }
    this.handleAceChange = this.handleAceChange.bind(this);
    this.toggleRepl = this.toggleRepl.bind(this);
  }
  handleAceChange(it) {
    console.log("ace", it)
  }
  toggleRepl() {
    this.setState({opened : !this.state.opened})
  }
  // <Ace
  //   value={"console.log('hello')"}
  //   onChange={this.handleAceChange}
  //   ref="ace"
  //   name="aceEditor"
  //   mode={'javascript'} />
  render() {
    const ace = (<div style={{height:"40%"}}>
      <h4>Query Editor for {this.props.splat}</h4>
        <Repl
          mode="javascript"
          theme=""
          splitDraggerSize={20}
          initialOrientation="vertical"
          initialCode={"console.log('hello')"} />
    </div>);
    return (
      <div className="FaunaRepl" style={FaunaRepl.style}>
        {this.state.opened ?
          ace :
          ""
        }

        <CommandBar
          elipisisAriaLabel='More options'
          items={ [{
            name:"Toggle Query Editor",
            key : "toggle",
            onClick : this.toggleRepl,
            icon : (this.state.opened ? "ChevronDown" : "ChevronUp")
          }] }
          farItems={ [{
            name:"Run Query",
            key : "run",
            icon : "ShowResults"
          }] }
          />

      </div>
    )
  }
}

FaunaRepl.style = {
  position : "fixed",
  bottom: 0,
  left : 0,
  right: 0
}
