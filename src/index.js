import React from 'react';
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'
import { App, appReducer } from './app'
import recognizeUser from "./authentication/recognizeUser"
import localStorage from "./persistence/LocalStorage"
import './index.css';

import {Blah} from './typescript/blah'
import App1, {Blah2} from './typescript/blah2'

console.log("blah", new Blah().blah())
console.log("blah2", new Blah2().blah())
console.log("App", new App())
console.log("App1", new App1())

const store = createStore(
  appReducer,
  { currentUser: recognizeUser(localStorage) },
  applyMiddleware(thunk)
)

store.subscribe(() => {
  console.log("redux state", store.getState())
});

ReactDOM.render(
  <App1 store={store}/>,
  document.getElementById('root')
);
