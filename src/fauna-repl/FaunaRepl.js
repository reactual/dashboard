import React, { Component } from 'react';
import {Button, ButtonType} from 'office-ui-fabric-react'
import SplitPane from "react-split-pane"
import Ace from "./repl/Ace"
import {QueryResult} from "../index-query/IndexQuery"
import replEval from './repl/repl-eval';
import { query as q } from "faunadb"
import queryFunctions from "./queryFunctions"

require('brace/mode/javascript');
require('brace/theme/monokai');
require('brace/ext/language_tools');

export default class FaunaRepl extends Component {
  constructor(props) {
    super(props)
    this.state = {
      opened : false,
      expandedSize : 200,
      result : null,
      savedCode : "q.Paginate(q.Ref(\"indexes\"))"
    }
    this.handleAceChange = this.handleAceChange.bind(this);
    this.toggleRepl = this.toggleRepl.bind(this);
    this.handleRunQuery = this.handleRunQuery.bind(this);
    this.configureEditor = this.configureEditor.bind(this);
  }
  handleAceChange(aceCode) {
    this.setState({savedCode:aceCode})
  }
  scopedClient() {
    return this.props.scopedClient;
  }
  handleRunQuery() {
    this.setState({running:true})
    replEval(q, this.scopedClient(), this.state.savedCode).then((result) => {
      this.setState({running:false,result})
    }).catch((result) => {
      var outData = (result && result.requestResult && result.requestResult.responseContent) ? result.requestResult.responseContent : result;
      this.setState({running:false, result : outData})
    })
  }
  toggleRepl() {
    this.setState({opened: !this.state.opened, focus: !this.state.focus})
  }

  configureEditor(editor, ace) {
    if (editor.getOption("enableBasicAutocompletion")) return
    editor.setOption("enableBasicAutocompletion", true)
    editor.setOption("enableLiveAutocompletion", true)

    const faunaCompleter = {
      getCompletions(editor, session, pos, prefix, callback) {
        const previousToken = session.getTokenAt(pos.row, pos.column - prefix.length - 1) || {}
        if (previousToken.value !== "q") {
          callback(null, [])
          return
        }

        callback(null,
          queryFunctions
            .filter(fun => fun.includes(prefix))
            .map(fun => ({ name: fun, value: fun, score: 0, meta: "query function" }))
        )
      }
    }

    const langTools = ace.acequire("ace/ext/language_tools")

    editor.completers = [
      langTools.textCompleter,
      faunaCompleter
    ]

    editor.commands.addCommand({
      name: "execute",
      bindKey: { win: "Ctrl-Enter", mac: "Command-Enter" },
      exec: this.handleRunQuery
    })
  }

  render() {
    var expandedSize = this.state.expandedSize;
    return (
      <SplitPane split="horizontal"
        minSize={42}
        maxSize={"75%"}
        defaultSize={this.state.opened ? expandedSize : 42}
        size={this.state.opened ? expandedSize : 42}
        onChange={ size => this.setState({expandedSize : size}) }
        primary="second" paneStyle={{overflow:"scroll"}}>

        {this.props.children}

        <div className="FaunaRepl">
          <div className="expandedArea">
            <SplitPane split="vertical" defaultSize="50%" style={{height:"calc(100% - 40px);"}}
              pane2Style={{overflow:"scroll"}}>
              {this.state.opened ?
                (<div className="repl-workspace">
                    <Ace
                      value={this.state.savedCode}
                      onChange={this.handleAceChange}
                      onLoad={this.configureEditor}
                      focus={this.state.focus}
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
              <Button disabled={!(this.state.opened && this.props.scopedClient && !this.state.running)}
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
