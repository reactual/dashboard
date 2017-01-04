import React from 'react';
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'
import App from './app/App';
import { appReducer } from './app/reducers'
import './index.css';

const store = createStore(
  appReducer,
  applyMiddleware(thunk)
)

store.subscribe(() => {
  console.log(store.getState())
});

ReactDOM.render(
  <App store={store}/>,
  document.getElementById('root')
);
