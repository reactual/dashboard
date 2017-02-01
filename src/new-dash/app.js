import React, { Component } from "react"
import { Provider, connect } from "react-redux"
import { Router, Route, IndexRoute, Link, browserHistory } from "react-router"

import "./app.css"
import logo from "./logo.svg"
import FaunaClient from "./persistence/FaunaDB"
import { updateSelected } from "./router"
import { ActivityMonitor, withLock } from "./lock"
import { NotificationBar, watchForError } from "./notifications"
import { loadSchemaTree, NavTree, DatabaseForm } from "./schema"

class Container extends Component {
  constructor(props) {
    super(props)
    this.rootClient = new FaunaClient("http://localhost:8443", "secret", "admin")
  }

  componentDidMount() {
    this.updateSelectedResource(this.props.params.splat)
  }

  componentWillReceiveProps(next) {
    if (this.props.params.splat !== next.params.splat) {
      this.updateSelectedResource(next.params.splat)
    }
  }

  updateSelectedResource(splat) {
    this.props.dispatch(
      withLock(
        watchForError(
          "Unexpected error while loading database. It may not exist or your key can't access it",
          (dispatch) => {
            const selected = dispatch(updateSelected(splat))
            return dispatch(loadSchemaTree(this.rootClient, selected.get("database")))
          }
        )
      )
    )
  }

  render() {
    return <div className="ms-Grid">
        <div className="ms-Grid-row ms-bgColor-black">
          <div className="ms-Grid-col ms-u-sm7 ms-u-md5 ms-u-lg2 padding-05">
            <Link to="/"><img src={logo} alt="logo" /></Link>
          </div>
        </div>
        <div className="ms-Grid-row">
          <div className="ms-Grid-col ms-u-sm12 ms-u-md6 ms-u-lg4">
            <NavTree />
          </div>
          <div className="ms-Grid-col ms-u-sm12 ms-u-md6 ms-u-lg8">
            <ActivityMonitor />
            <NotificationBar />
            {React.Children.map(this.props.children,
              child => React.cloneElement(child, { faunaClient: this.rootClient })
            )}
          </div>
        </div>
      </div>
  }
}

export default class App extends Component {
  static Container = connect()(Container)

  render() {
    return <Provider store={this.props.store}>
        <Router history={browserHistory}>
          <Route path="/" component={App.Container}>
            <IndexRoute component={DatabaseForm} />
            <Route path="**" component={DatabaseForm} />
          </Route>
        </Router>
      </Provider>
  }
}
