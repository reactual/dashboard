import React, { Component } from 'react';
import { Link } from 'react-router';
import IndexQuery from '../index-query/IndexQuery'
import { updateSelectedIndex } from './actions'

class IndexInfo extends Component {
  componentDidMount() {
    this.getIndexInfo(this.props.scopedClient, this.props.splat, this.props.params.name)
  }
  getIndexInfo(client, path, name) {
    this.props.dispatch(updateSelectedIndex(name))
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.params.name !== nextProps.params.name) {
      this.getIndexInfo(nextProps.scopedClient, nextProps.splat, nextProps.params.name)
    }
  }
  render() {
    return (<div>
        <h3>Index Details</h3>
        <IndexCard path={this.props.splat} client={this.props.scopedClient} info={this.props.info}/>
        <IndexQuery client={this.props.scopedClient} info={this.props.info}/>
      </div>)
  }
}

import { connect } from 'react-redux'

const mapStateToProps = (state, props) => {
  const indexes = state.indexes

  if(!indexes || !indexes.byName || !indexes.selectedIndex)
    return { info: {} }

  const info = indexes.byName[indexes.selectedIndex]

  return {
    info: info.indexInfo
  }
}

export default connect(
  mapStateToProps
)(IndexInfo)

class IndexCard extends Component {
  render() {
    var info = this.props.info;
    var active = info.active;
    var unique = info.unique;
    var source = info.source && info.source.value;
    return (
      <div className="IndexInfo">

        <div className="ms-Grid">
          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-u-sm6">
              Index: {info.name}
            </div>
            <div className="ms-Grid-col ms-u-sm6">
              Source: {source ?
                <Link to={this.props.path ?
                  "/db/"+this.props.path+"/"+source :
                  "/db/"+source}>{source}</Link> :
                " none"}
            </div>
          </div>

          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-u-sm4">
              Active: {active ? "true" : "false"}
            </div>
            <div className="ms-Grid-col ms-u-sm4">
              Unique: {unique ? "true" : "false"}
            </div>
            <div className="ms-Grid-col ms-u-sm4">
              Partitions: {info.partitions}
            </div>
          </div>

          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-u-sm6">
              <h3>Terms</h3>
              <IndexTermsList terms={info.terms}/>
            </div>
            <div className="ms-Grid-col ms-u-sm6">
              <h3>Values</h3>
              <IndexTermsList terms={info.values}/>
            </div>
          </div>
        </div>

      </div>
    );
  }
}

class IndexTermsList extends Component {
  render() {
    var terms = this.props.terms;
    if (!terms) return null; //<p>Class index for {this.props.info.source.value}</p>
    return (
      <div>
        {terms.map((t, i) => {
          return (
            <dl key={i}>
              <dt>{JSON.stringify(t.field)}</dt>
              {t.transform && <dd>Transform: {t.transform}</dd>}
              {t.reverse && <dd>Reverse: {JSON.stringify(t.reverse)}</dd>}
            </dl>
          );
        })}
      </div>
    );
  }
}
