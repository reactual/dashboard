import React from 'react';
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
import { appReducer } from './app'
import App from './app/App'
import './index.css';

import Cookies from "js-cookie"

if (Cookies.get("USE_NEW_SCHEMA_TREE")) {
  require("./new-dash/index.js")
} else {
  var middlewares = [thunk]

  if(process.env.NODE_ENV === 'development') {
    middlewares = [...middlewares, createLogger({collapsed: true})]
  }

  const store = createStore(
    appReducer,
    applyMiddleware(...middlewares)
  )

  ReactDOM.render(
    <App store={store}/>,
    document.getElementById('root')
  )
}
