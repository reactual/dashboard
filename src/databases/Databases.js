import React, { Component } from 'react';

export class DatabaseInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {info:{}};
  }
  componentDidMount() {
    this.getDatabaseInfo(this.props.scopedClient, this.props.splat, this.props.params.name)
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.splat !== nextProps.splat ||
      this.props.scopedClient !==  nextProps.scopedClient) {
      this.getDatabaseInfo(nextProps.scopedClient, nextProps.splat)
    }
  }
  getDatabaseInfo(client, path) {
    if (!client) return;
  }
  render() {
    return (
      <div><h2>DB info for {this.props.splat}</h2></div>
    )
  }
}
