import React from 'react';
import ReactDOM from 'react-dom'
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'
import App from './App';
import { reduceClasses } from './classes/reducers'
import { reduceIndexes } from './indexes/reducers'
import './index.css';

const appReducer = combineReducers({
  classes: reduceClasses,
  indexes: reduceIndexes
})

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
