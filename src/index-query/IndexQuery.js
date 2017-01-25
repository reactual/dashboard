import React, { Component } from 'react';

import {
  DetailsList,
  DetailsListLayoutMode,
  DetailsRow,
  CheckboxVisibility,
  Button,
  ButtonType
} from 'office-ui-fabric-react'

import {query as q} from 'faunadb';
const Ref = q.Ref;
import {inspect} from 'util';

const DEFAULT_ITEMS_PER_PAGE = 16

export default class IndexQuery extends Component {
  constructor(props) {
    super(props);
    this.gotTerm = this.gotTerm.bind(this);
    this.beforeClick = this.beforeClick.bind(this);
    this.afterClick = this.afterClick.bind(this);
    this.changeItemsPerPage = this.changeItemsPerPage.bind(this);
    this.doQuery = this.doQuery.bind(this);
    this.state = {
      itemsPerPage: DEFAULT_ITEMS_PER_PAGE.toString()
    };
  }
  componentDidMount() {
    this.getIndexRows(this.props.client, this.props.info.name, this.props.term);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.info.name !== nextProps.info.name ||
      this.props.term !== nextProps.term) {
      this.getIndexRows(nextProps.client, nextProps.info.name, nextProps.term)
    }
  }
  gotTerm(term) {
    this.getIndexRows(this.props.client, this.props.info.name, term);
  }
  beforeClick() {
    this.getIndexRows(
      this.props.client,
      this.props.info.name,
      this.props.term,
      this.state.result.before,
      undefined);
  }
  afterClick() {
    this.getIndexRows(
      this.props.client,
      this.props.info.name,
      this.props.term,
      undefined,
      this.state.result.after);
  }
  changeItemsPerPage(event) {
    var value = parseInt(event.target.value, 10)
    if(isNaN(value) || value <= 0)
      value = ""
    this.setState({itemsPerPage: value.toString()})
  }
  doQuery(event) {
    if(event.key === "Enter") {
      this.getIndexRows(
        this.props.client,
        this.props.info.name,
        this.props.term)
      }
  }
  getIndexRows(client, name, term, before, after) {
    this.setState({instanceRef:null});
    if (!name) return;

    const size = parseInt(this.state.itemsPerPage, 10)
    var params = {
      size: !isNaN(size) ? size : DEFAULT_ITEMS_PER_PAGE,
      before: before,
      after: after
    }

    var query = q.Paginate(q.Match(q.Index(name), term), params)

    client && client.query(query).then((result) => {
      this.setState({result})
    }).catch(console.error.bind(console, name))
  }
  createPaginator() {
    if(!this.state.result || !this.state.result.data || !this.state.result.data.length)
      return undefined

    const beforeButton =
      (<Button
        disabled={!this.state.result.before}
        onClick={this.beforeClick}
        buttonType={ButtonType.icon}
        icon="ChevronLeft" />)

    const afterButton =
      (<Button
        disabled={!this.state.result.after}
        onClick={this.afterClick}
        buttonType={ButtonType.icon}
        icon="ChevronRight" />)

    const itemsPerPageField =
      (<div className="ms-TextField">
        <input
          className="ms-TextField-field"
          type="text"
          value={this.state.itemsPerPage}
          onChange={this.changeItemsPerPage}
          onKeyPress={this.doQuery} />
       </div>)

  return (
    <div className="ms-Grid">
      <div className="ms-Grid-row">
        <div className="ms-Grid-col ms-u-sm9 ms-u-md9 ms-u-lg9"></div>
        <div className="ms-Grid-col ms-u-sm1 ms-u-md1 ms-u-lg1 ms-u-textAlignCenter">{beforeButton}</div>
        <div className="ms-Grid-col ms-u-sm1 ms-u-md1 ms-u-lg1">{itemsPerPageField}</div>
        <div className="ms-Grid-col ms-u-sm1 ms-u-md1 ms-u-lg1 ms-u-textAlignCenter">{afterButton}</div>
      </div>
    </div>)
  }
  render() {
    return (<div>
      {this.props.info.terms && <TermForm onSubmit={this.gotTerm}/>}
      {this.createPaginator()}
      <QueryResult client={this.props.client} result={this.state.result} info={this.props.info} />
    </div>);
  }
}
export class QueryResult extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.clickedRef = this.clickedRef.bind(this);
    this._onRenderRow = this._onRenderRow.bind(this);
    this._renderItemColumn = this._renderItemColumn.bind(this);
  }
  componentDidMount() {
    this.setState({ instanceRef: null })
  }
  componentWillReceiveProps() {
    this.setState({ instanceRef: null })
  }
  makeResultIntoTableData(result) {
    if (!(result && result.data)) return null;
    if (!Array.isArray(result.data)) return null

    var firstResult = result.data[0];
    if (!firstResult) return [{message:"Empty result set, no matching data."}];
    var keynames, multiColumn;
    if (this.props.info && this.props.info.values) {
      keynames = this.props.info.values.map((v) => v.field.join("."));
      if (keynames.length > 1) {
        multiColumn = true
      }
    } else {
      if (Array.isArray(firstResult)) {
         keynames = firstResult.map((v, i) => i.toString());
         multiColumn = true;
      } else {
        keynames = ["value"]
      }
    }
    // return the result structured as rows with column names
    // alternatively we could provide a column map to the table view
    return result.data.map((resItem) => {
      var item = {};
      if (!multiColumn) { // special case for single column
        item[keynames[0]] = resItem;
      } else {
        for (var i = 0; i < keynames.length; i++) {
          item[keynames[i]] = resItem[i];
        }
      }
      return item;
    });

  }
  clickedRef(item, event) {
    event.preventDefault()
    if (item.constructor === q.Ref("").constructor) {
      this.setState({instanceRef:item});
    }
  }
  _onRenderRow (props) {
    return <DetailsRow { ...props } onRenderCheck={ this._onRenderCheck } />;
  }
  _onRenderCheck(props) {
    return null;
  }
  _renderItemColumn(item, index, column) {
    let fieldContent = item[column.fieldName];
    if (fieldContent.constructor === q.Ref("").constructor) {
      return <a href="#" onClick={this.clickedRef.bind(null, fieldContent)}>{inspect(fieldContent, {depth:null})}</a>
    } else {
      return <span>{ fieldContent }</span>;
    }
  }
  render() {
    var tableData = this.makeResultIntoTableData(this.props.result);
    var content;
    if (tableData) {
      content = (<div className="QueryResult">
            {this.props.result && <DetailsList
              onRenderItemColumn={this._renderItemColumn}
              onRenderRow={ this._onRenderRow }
              selectionMode="none"
              layoutMode={DetailsListLayoutMode.fixedColumns}
              viewport={{height:"100%"}}
           items={ tableData }/>}
           <InstancePreview client={this.props.client} instanceRef={this.state.instanceRef}/>
        </div>);
    } else {
      content =  (<div className="QueryResult">
        {this.props.result && <pre>{inspect(this.props.result, {depth:null})}</pre>}
      </div>);
    }
    return content;
  }
}

class InstancePreview extends Component {
  constructor(props) {
    super(props);
    this.state = { instance: false, events: [] }
  }
  componentDidMount() {
    this.getInstanceData(this.props.instanceRef);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.instanceRef !== nextProps.instanceRef) {
      this.getInstanceData(nextProps.instanceRef)
    }
  }
  getInstanceData(instanceRef) {
    this.setState({instance: false})
    if (!instanceRef || !this.props.client) return

    const ref = Ref(instanceRef)

    this.props.client.query({
      instance: q.Get(ref),
      events: q.Map(
        q.Paginate(ref, { events: true, size: 100 }), // FIXME: need a better pagination strategy
        event => ({
          action: q.Select("action", event),
          ts: q.Select("ts", event),
          data: q.Select("data", q.Get(ref, q.Select("ts", event)), null)
        })
      )
    }).then(res => {
      this.setState({
        instance: res.instance,
        events: res.events.data
      })
    })
  }
  render() {
    const { instance, events } = this.state
    if (!instance) return null

    const eventRows = events.map(
      event => ({
        ...event,
        data: inspect(event.data, { depth: null })
      })
    )

    const eventColumns = [
      { key: "action", name: "Action", fieldName: "action", minWidth: 40, maxWidth: 40 },
      { key: "ts", name: "TS", fieldName: "ts", minWidth: 110, maxWidth: 110 },
      { key: "data", name: "Data", fieldName: "data", isMultiline: true },
    ]

    return (
      <div>
        <Button
          buttonType={ButtonType.icon}
          onClick={this.getInstanceData.bind(this, this.props.instanceRef)}
          icon="Refresh">
            Refresh
        </Button>
        <h3>Instance Preview</h3>
        <dl>
          <dt>Class</dt><dd>{instance.class.toString()}</dd>
          <dt>Ref</dt><dd>{instance.ref.toString()}</dd>
          <dt>TS</dt><dd>{instance.ts}</dd>
          <dt>Data</dt>
          <dd><pre>{inspect(instance.data, { depth: null })}</pre></dd>
        </dl>
        <h3>Instance History</h3>
        <DetailsList
          checkboxVisibility={CheckboxVisibility.hidden}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode="none"
          items={eventRows}
          columns={eventColumns} />
      </div>
    )
  }
}

class TermForm extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {value:props.value||""};
  }
  handleChange(event) {
    this.setState({value: event.target.value});
  }
  handleSubmit(event) {
    event.preventDefault();
    var value = this.state.value;
    var match = value.match(/Ref\("(.*)"\)/);
    if (match) {
      value = q.Ref(match[1]);
    }
    this.props.onSubmit(value);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.setState({value: nextProps.value});
    }
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        Lookup term: <input type="text" value={this.state.value} onChange={this.handleChange}/>
      </form>
    )
  }
}
