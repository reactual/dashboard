import React from 'react';
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
import { App, appReducer } from './app'
import './index.css';

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
);
