import React, { Component } from "react"
import { connect } from "react-redux"
import { TextField, Button, ButtonType } from "office-ui-fabric-react"

import "./pagination.css"
import { watchForError } from "../../notifications"
import { monitorActivity, isBusy } from "../../activity-monitor"
import { QueryResult } from "../../dataset"

class Pagination extends Component {
  constructor(props) {
    super(props)
    this.state = this.initialState()
  }

  initialState() {
    return {
      size: 16,
      cursor: {},
      result: null
    }
  }

  componentDidMount() {
    this.refresh()
  }

  refresh() {
    this.queryIndex(this.props.query)
  }

  componentWillReceiveProps(next) {
    if (this.props.query !== next.query) {
      this.reset(() => this.queryIndex(next.query))
    }
  }

  reset(callback) {
    this.setState(this.initialState(), callback)
  }

  queryIndex(query) {
    const queryResult = query({
      ...this.state.cursor,
      size: this.state.size,
    })

    if (!queryResult) {
      this.reset()
      return
    }

    this.props.dispatch(
      monitorActivity(
        watchForError(
          "Could not paginate through the dataset",
          () => queryResult
        )
      )
    ).then(
      result => this.setState({ result })
    )
  }

  onChange(pageSize) {
    const n = parseInt(pageSize, 10)

    if (!isNaN(n) && n !== this.state.size) {
      this.setState({
        size: n,
        cursor: {}
      }, () => this.refresh())
    }
  }

  setCursor(name, value) {
    return () => {
      this.setState({
        cursor: {
          [name]: value
        }
      }, () => this.refresh())
    }
  }

  render() {
    const { result } = this.state
    const { isBusy } = this.props
    if (!result) return null

    return <div className="ms-Grid-row">
      <div className="ms-Grid-row">
        <div className="ms-Grid-col ms-u-sm9">
          <Button
            disabled={isBusy}
            buttonType={ButtonType.icon}
            onClick={this.refresh.bind(this)}
            icon="Refresh">Refresh</Button>
        </div>
        <div className="ms-Grid-col ms-u-sm1 ms-u-textAlignCenter">
          <Button
            disabled={!result.before || isBusy}
            buttonType={ButtonType.icon}
            onClick={this.setCursor("before", result.before)}
            icon="ChevronLeft" />
        </div>
        <div className="ms-Grid-col ms-u-sm1 pagination">
          <TextField
            disabled={isBusy}
            value={this.state.size}
            onChanged={this.onChange.bind(this)} />
        </div>
        <div className="ms-Grid-col ms-u-sm1 ms-u-textAlignCenter">
          <Button
            disabled={!result.after || isBusy}
            buttonType={ButtonType.icon}
            onClick={this.setCursor("after", result.after)}
            icon="ChevronRight" />
        </div>
      </div>

      <div className="ms-Grid-row">
        <QueryResult result={result} />
      </div>
    </div>
  }
}

export default connect(
  state => ({
    isBusy: isBusy(state)
  })
)(Pagination)
