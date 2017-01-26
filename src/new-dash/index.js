import React from "react"
import ReactDOM from "react-dom"
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
import Immutable from "immutable"
import { createStore, applyMiddleware } from "redux"
import { combineReducers } from "redux-immutable"

import App from "./app"
import { reduceSchemaTree } from "./schema"
import { reduceRouter } from "./router"
import { reduceNotifications } from "./notifications"
import { reduceLock } from "./lock"

const store = (() => {
  const middlewares = [thunk]

  if (process.env.NODE_ENV === 'development') {
    const logAsJS = obj => Immutable.fromJS(obj).toJS()

    middlewares.push(createLogger({
      stateTransformer: logAsJS,
      actionTransformer: logAsJS,
      collapsed: true
    }))
  }

  return createStore(
    combineReducers({
      schema: reduceSchemaTree,
      router: reduceRouter,
      notifications: reduceNotifications,
      lock: reduceLock
    }),
    applyMiddleware(...middlewares)
  )
})()

ReactDOM.render(
  <App store={store} />,
  document.getElementById('root')
)
