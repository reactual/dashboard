import React from 'react';
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'
import { App, appReducer } from './app'
import './index.css';

const store = createStore(
  appReducer,
  applyMiddleware(thunk)
)

store.subscribe(() => {
  console.log("redux state", store.getState())
});

ReactDOM.render(
  <App store={store}/>,
  document.getElementById('root')
);
