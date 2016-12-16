import React, { Component } from 'react';
import clientForSubDB from "./clientForSubDB";

export class DatabaseInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {info:{}};
  }
  componentDidMount() {
    this.getDatabaseInfo(this.props.client, this.props.params.splat, this.props.params.name)
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.params.splat !== nextProps.params.splat ||
      this.props.client !==  nextProps.client) {
      this.getDatabaseInfo(nextProps.client, nextProps.params.splat)
    }
  }
  getDatabaseInfo(client, path) {
    if (!client) return;
    this.setState({scopedClient : clientForSubDB(client, path, "server")})
  }
  render() {
    return (
      <div>DB info {this.props.params.splat}</div>
    )
  }
}
