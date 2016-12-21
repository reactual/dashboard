import React, { Component } from 'react';
import {Button, ButtonType} from 'office-ui-fabric-react'
// import clientForSubDB from "./clientForSubDB";
import Ace from "./repl/Ace"
// import Repl from "./repl"

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

  render() {
    const ace = (<div>
      <h4>Query Editor for {this.props.splat}</h4>
        <Ace
          value={"console.log('hello')"}
          onChange={this.handleAceChange}
          ref="ace"
          name="aceEditor"
          mode={'javascript'} />
    </div>);
    return (
      <div className="FaunaRepl">
        {this.state.opened ?
          ace :
          ""
        }

        <Button disabled={!this.state.opened}
          buttonType={ ButtonType.primary } onClick={this.runCode}>Run</Button>
        <Button disabled={false}
          icon={(this.state.opened ? "ChevronDown" : "ChevronUp")}
          buttonType={ ButtonType.command } onClick={this.toggleRepl}>Toggle Query Console</Button>
      </div>
    )
  }
}
//
// <CommandBar
//   elipisisAriaLabel='More options'
//   items={ [this.props.crumb] }
//   farItems={ [{
//     name:"Run",
//     key : "run",
//     icon : "ShowResults"
//   }, {
//     name:"Toggle Query Console",
//     key : "toggle",
//     onClick : this.toggleRepl,
//     icon : (this.state.opened ? "ChevronDown" : "ChevronUp")
//   }] } />

// FaunaRepl.style = {
//   position : "fixed",
//   bottom: 0,
//   left : 0,
//   right: 0
// }
