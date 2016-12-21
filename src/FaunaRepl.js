import React, { Component } from 'react';
import {Button, ButtonType} from 'office-ui-fabric-react'
import SplitPane from "react-split-pane"
import Ace from "./repl/Ace"

import clientForSubDB from "./clientForSubDB";
import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

require('brace/mode/javascript');
require('brace/theme/monokai');

function runQuery(client, __query) {
  console.log("evalQuery", client, __query)
  const Ref = q.Ref;
  const Paginate = q.Paginate;
  const query = eval(__query);
  console.log("runQuery", query)
  return client.query(query)
}

export default class FaunaRepl extends Component {
  constructor(props) {
    super(props)
    this.state = {
      opened : false,
      aceCode : "Paginate(Ref(\"indexes\"))"
    }
    this.handleAceChange = this.handleAceChange.bind(this);
    this.toggleRepl = this.toggleRepl.bind(this);
    this.handleRunQuery = this.handleRunQuery.bind(this);
  }
  handleAceChange(aceCode) {
    this.setState({aceCode})
  }
  handleRunQuery() {
    var scopedClient = clientForSubDB(this.props.client, this.props.splat, "server")
    runQuery(scopedClient, this.state.aceCode).then((result) => {
      this.setState({result})
    })
  }
  toggleRepl() {
    this.setState({opened : !this.state.opened})
  }

  render() {
    var expandedSize = 200;
    return (
      <SplitPane split="horizontal"
        minSize={40}
        maxSize={"75%"}
        defaultSize={this.state.opened ? expandedSize : 40}
        size={this.state.opened ? expandedSize : 40}
        primary="second" paneStyle={{overflow:"scroll"}}>

        {this.props.children}

        <div className="FaunaRepl">
          <div className="expandedArea">
            <SplitPane split="vertical" defaultSize="50%" style={{height:"calc(100% - 40px);"}}>
              {this.state.opened ?
                (<div className="repl-workspace">
                    <Ace
                      value={"Paginate(Ref(\"indexes\"))"}
                      onChange={this.handleAceChange}
                      ref="ace"
                      name="aceEditor"
                      mode={'javascript'} />
                  </div>) : (<div></div>)
              }
              <QueryResults/>
            </SplitPane>
          </div>
          <div className="repl-bar">
            <div className="buttons">
              <Button disabled={!this.state.opened}
                buttonType={ ButtonType.primary } onClick={this.handleRunQuery}>Run</Button>
              <Button disabled={false}
                icon={(this.state.opened ? "ChevronDown" : "ChevronUp")}
                buttonType={ ButtonType.command } onClick={this.toggleRepl}>Toggle Query Console</Button>
            </div>
            {this.props.crumb}
          </div>
        </div>
      </SplitPane>
    )
  }
}

class QueryResults extends Component {
  render() {
    return (<div>
      <h3>Query Results</h3>
    </div>);
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
