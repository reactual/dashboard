import React, { Component } from "react"
import { connect } from "react-redux"
import { query as q } from "faunadb"
import { Link, browserHistory } from "react-router"
import { Button, ButtonType } from "office-ui-fabric-react"

import DeleteForm from "./delete-form"
import { deleteIndex, selectedIndex, selectedDatabase } from "../"
import { faunaClient } from "../../authentication"
import { watchForError, notify } from "../../notifications"
import { monitorActivity, isBusy } from "../../activity-monitor"
import { buildResourceUrl } from "../../router"
import { KeyType } from "../../persistence/faunadb-wrapper"
import { Pagination, InstanceInfo } from "../../dataset"
import { ReplEditor, evalQuery } from "../../repl"

class IndexInfo extends Component {
  constructor(props) {
    super(props)
    this.state = this.initialState(props)
  }

  initialState(props) {
    return {
      terms: '""',
      queryFn: this.buildQuery(props),
      selectedInstance: null
    }
  }

  componentDidMount() {
    this.reset(this.props)
  }

  componentWillReceiveProps(next) {
    if (!this.props.index.equals(next.index)) {
      this.reset(next)
    }
  }

  reset(props) {
    this.setState(this.initialState(props))
  }

  buildQuery({ client, index, path }, terms = null) {
    if (!index.get("ref")) return

    if (index.get("terms").size !== 0) {
      if (!terms) return

      return options =>
        evalQuery(parsedTerms =>
          client.query(path, KeyType.SERVER, q.Paginate(
            q.Match(index.get("ref"), parsedTerms),
            options
          ))
        )(terms)
    }

    return (options) =>
      client.query(path, KeyType.SERVER, q.Paginate(
        q.Match(index.get("ref")),
        options
      ))
  }

  onChange(terms) {
    this.setState({ terms })
  }

  onSubmit() {
    this.setState({
      queryFn: this.buildQuery(
        this.props,
        this.state.terms
      )
    })
  }

  onSelectRef(ref) {
    const { client, path } = this.props

    this.props.dispatch(
      monitorActivity(
        watchForError(
          "Can't fetch selected instance",
          () => client.query(path, KeyType.SERVER, q.Get(ref))
        )
      )
    ).then(
      selectedInstance => this.setState({ selectedInstance })
    )
  }

  onDelete() {
    const { client, path, currentUrl, index } = this.props

    return notify("Index deleted successfully", dispatch =>
      dispatch(deleteIndex(client, path, index.get("name"))).then(() =>
        browserHistory.push(buildResourceUrl(currentUrl, "indexes"))
      )
    )
  }

  renderField(prefix) {
    return field => {
      return <li key={`prefix-${field.get("field")}`}>
        {field.get("field")}
        {field.get("transform") ?  " => " + field.get("transform") : ""}
      </li>
    }
  }

  render() {
    const { index, isBusy } = this.props
    const { terms, queryFn, selectedInstance } = this.state

    return <div>
      <h3>Index Details</h3>

      <div className="ms-Grid-row">
        <div className="ms-Grid-col ms-u-sm12 ms-u-md6">
          <dl>
            <dt>Name</dt><dd>{index.get("name")}</dd>
            <dt>Source</dt>
            <dd>
              <Link to={index.getIn(["source", "url"])}>
                {index.getIn(["source", "name"])}
              </Link>
            </dd>
          </dl>
        </div>
        <div className="ms-Grid-col ms-u-sm12 ms-u-md6">
          <dl>
            <dt>Active</dt><dd>{index.get("active").toString()}</dd>
            <dt>Unique</dt><dd>{index.get("unique").toString()}</dd>
            <dt>Partitions</dt><dd>{index.get("partitions")}</dd>
          </dl>
        </div>
      </div>

      <div className="ms-Grid-row">
        <div className="ms-Grid-col ms-u-sm12 ms-u-md6">
          <h3>Terms</h3>
          <ul>
            {index.get("terms").map(this.renderField("term"))}
          </ul>
        </div>
        <div className="ms-Grid-col ms-u-sm12 ms-u-md6">
          <h3>Values</h3>
          <ul>
            {index.get("values").map(this.renderField("value"))}
          </ul>
        </div>
      </div>

      <DeleteForm
        buttonText="Delete Index"
        title={`Delete ${index.get("name")}`}
        validateName={index.get("name")}
        onDelete={this.onDelete.bind(this)} />

      {index.get("terms").size !== 0 ?
        <div className="ms-Grid-row">
          <div className="ms-Grid-col ms-u-sm12">
            <h3>Lookup</h3>
            <ReplEditor
              mode={ReplEditor.Mode.TEXT_FIELD}
              name="index-lookup-editor"
              value={terms}
              onChange={this.onChange.bind(this)}
              shortcuts={[{
                name: "search",
                bindKey: { win: "Enter", mac: "Enter" },
                exec: this.onSubmit.bind(this)
              }]} />

            <p className="ms-TextField-description">
              The contents of this field will be evaluated with the context of a repl and placed in
              the "terms" field of the index look up query.
            </p>

            <Button
              disabled={isBusy}
              buttonType={ButtonType.primary}
              onClick={this.onSubmit.bind(this)}>
              Search
            </Button>
          </div>
        </div> : null}

      <div className="ms-Grid-row">
        <div className="ms-Grid-col ms-u-sm12">
          <Pagination query={queryFn} onSelectRef={this.onSelectRef.bind(this)} />
        </div>
      </div>

      <div className="ms-Grid-row">
        <div className="ms-Grid-col ms-u-sm12">
          <InstanceInfo instance={selectedInstance} />
        </div>
      </div>
    </div>
  }
}

export default connect(
  state => ({
    client: faunaClient(state),
    index: selectedIndex(state),
    path: selectedDatabase(state).get("path"),
    currentUrl: selectedDatabase(state).get("url"),
    isBusy: isBusy(state)
  })
)(IndexInfo)
