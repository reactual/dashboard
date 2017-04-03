import React from "react"
import ReactDOM from "react-dom"
import thunk from "redux-thunk"
import createLogger from "redux-logger"
import Immutable from "immutable"
import { createStore, applyMiddleware, compose } from "redux"
import { combineReducers } from "redux-immutable"

import App from "./app"
import { reduceSchemaTree } from "./schema"
import { reduceRouter } from "./router"
import { reduceNotifications } from "./notifications"
import { reduceActivityMonitor } from "./activity-monitor"
import { reduceUserSession } from "./authentication"

require("./lang/polyfill.js")

const store = (() => {
  const middlewares = [thunk]

  if (process.env.NODE_ENV === "development") {
    const logAsJS = obj => Immutable.fromJS(obj).toJS()

    middlewares.push(createLogger({
      stateTransformer: logAsJS,
      actionTransformer: logAsJS,
      collapsed: true
    }))
  }

  // Add support for https://github.com/zalmoxisus/redux-devtools-extension
  // eslint-disable-next-line
  const composeEnhancers = process.env.NODE_ENV === "development" &&
    typeof window === "object" &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ :
    compose

  return createStore(
    combineReducers({
      schema: reduceSchemaTree,
      router: reduceRouter,
      notifications: reduceNotifications,
      activityMonitor: reduceActivityMonitor,
      currentUser: reduceUserSession
    }),
    composeEnhancers(
      applyMiddleware(...middlewares)
    )
  )
})()

ReactDOM.render(
  <App store={store} />,
  document.getElementById("root")
)
