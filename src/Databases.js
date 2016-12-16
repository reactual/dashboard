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
    var scopedClient;
    if (path) {
      scopedClient = clientForSubDB(client, path, "server");
    } else {
      // we are in a server key context
      // so we don't know our path and can't change our client
      scopedClient = client;
    }
    this.setState({scopedClient})
  }
  render() {
    return (
      <div>DB info {this.props.params.splat}</div>
    )
  }
}
