import React, { Component } from "react"
import { connect } from "react-redux"

class IndexInfo extends Component {
  render() {
    return <h1>OI</h1>
  }
}

export default connect()(IndexInfo)
