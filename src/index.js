import React from 'react';
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux';
import App from './App';
import './index.css';

function appReducer(state, action) {
  return state;
}

let store = createStore(appReducer)

store.subscribe(() => {
  console.log(store.getState())
});

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
