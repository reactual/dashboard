import React, { Component } from 'react';
import {Button, ButtonType} from 'office-ui-fabric-react'
import SplitPane from "react-split-pane"
import Ace from "./repl/Ace"
import {QueryResult} from "./IndexQuery"
import clientForSubDB from "./clientForSubDB";
import replEval from './repl/repl-eval';
import {query as q} from 'faunadb';

require('brace/mode/javascript');
require('brace/theme/monokai');

export default class FaunaRepl extends Component {
  constructor(props) {
    super(props)
    this.state = {
      opened : false,
      result : null,
      aceCode : "q.Paginate(q.Ref(\"indexes\"))"
    }
    this.handleAceChange = this.handleAceChange.bind(this);
    this.toggleRepl = this.toggleRepl.bind(this);
    this.handleRunQuery = this.handleRunQuery.bind(this);
  }
  handleAceChange(aceCode) {
    this.setState({savedCode:aceCode})
  }
  scopedClient() {
    return clientForSubDB(this.props.client, this.props.splat, "server");
  }
  handleRunQuery() {
    replEval(q, this.scopedClient(), this.state.savedCode).then((result) => {
      this.setState({result})
    })//.catch((result) => {
      // this.setState({result})
    //})
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
            <SplitPane split="vertical" defaultSize="50%" style={{height:"calc(100% - 40px);"}}
              pane2Style={{overflow:"scroll"}}>
              {this.state.opened ?
                (<div className="repl-workspace">
                    <Ace
                      value={this.state.aceCode}
                      onChange={this.handleAceChange}
                      ref="ace"
                      name="aceEditor"
                      mode={'javascript'} />
                  </div>) : (<div></div>)
              }
              <QueryResult client={this.scopedClient()} result={this.state.result}/>
            </SplitPane>
          </div>
          <div className="repl-bar">
            <div className="buttons">
              <Button disabled={!(this.state.opened && this.props.client)}
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
