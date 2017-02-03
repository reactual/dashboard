import React, { Component } from "react"
import { Provider, connect } from "react-redux"
import { Router, Route, IndexRoute, Link, browserHistory } from "react-router"

import "./app.css"
import logo from "./logo.svg"
import { updateSelected } from "./router"
import { ActivityMonitor, monitorActivity } from "./activity-monitor"
import { NotificationBar, watchForError } from "./notifications"
import { NavTree, DatabaseForm, loadSchemaTree } from "./schema"
import { LoginForm, UserAccount, faunaClient } from "./authentication"
import { IntercomWidget } from "./external/intercom"

class Container extends Component {

  componentDidMount() {
    this.updateSelectedResource(
      this.props.faunaClient,
      this.props.params.splat
    )
  }

  componentWillReceiveProps(next) {
    if (this.props.faunaClient !== next.faunaClient ||
      this.props.params.splat !== next.params.splat) {

      this.updateSelectedResource(
        next.faunaClient,
        next.params.splat
      )
    }
  }

  updateSelectedResource(client, splat) {
    if (!client) return

    this.props.dispatch(
      monitorActivity(
        watchForError(
          "Unexpected error while loading database. It may not exist or your key can't access it",
          (dispatch) => {
            const selected = dispatch(updateSelected(splat))
            return dispatch(loadSchemaTree(client, selected.get("database")))
          }
        )
      )
    )
  }

  render() {
    return <div className="ms-Grid ms-Fabric ms-font-m">
        <div className="ms-Grid-row header">
          <div className="ms-Grid-col ms-u-sm5 ms-u-md6 ms-u-lg3 ms-u-xl2 padding-05">
            <Link to="/"><img src={logo} alt="logo" /></Link>
          </div>
          <div className="ms-Grid-col ms-u-sm12 ms-u-md6 ms-u-lg9 ms-u-xl10 padding-05">
            <ul>
              <li><ActivityMonitor /></li>
              <li><a href="http://fauna.com/tutorials" target="_blank">Tutorials</a></li>
              <li><a href="http://fauna.com/documentation" target="_blank">Documentation</a></li>
              <li><UserAccount /></li>
            </ul>
          </div>
        </div>
        <div className="ms-Grid-row">
          <div className="ms-Grid-col ms-u-sm12 ms-u-md6 ms-u-lg4">
            <NavTree />
          </div>
          <div className="ms-Grid-col ms-u-sm12 ms-u-md6 ms-u-lg8">
            <NotificationBar />
            {this.props.children}
          </div>
        </div>
        <LoginForm />
        <IntercomWidget />
      </div>
  }
}

export default class App extends Component {

  static Container = connect(
    state => ({
      faunaClient: faunaClient(state)
    })
  )(Container)

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
