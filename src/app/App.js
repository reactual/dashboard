import React from 'react';
import { Router, Route, Redirect, IndexRoute, browserHistory } from 'react-router';
import { Provider } from 'react-redux'
import Container from '../container/Container'
import IndexInfo from '../indexes/IndexInfo'
import IndexForm from '../indexes/IndexForm'
import ClassInfo from '../classes/ClassInfo'
import ClassForm from '../classes/ClassForm'
import { DatabaseInfo } from '../databases/Databases'

import { resetState } from '../app'
import { updateSelectedClass } from '../classes'
import { updateSelectedIndex } from '../indexes'
import { updateCurrentDatabase } from '../databases'

import './App.css';

const Home = () =>(
  <p>
    Welcome to FaunaDB. Browse and create databases, inspect and define schemas
     and instances, and explore your data with the interactive query console.
  </p>
);

const NotFound = () => (<h1>404.. This page is not found!</h1>);

const onChangeSelection = (dispatch, action) => (nextState, replace, callback) => {
  if(action && nextState.params.name) {
    dispatch(action(nextState.params.name))
  }

  callback()
}

const onChangeDatabase = (dispatch) => (nextState, replace, callback) => {
  dispatch(resetState())
  dispatch(updateCurrentDatabase(nextState.params.splat))
  callback()
}

export default function App({store}) {
  const dispatch = store.dispatch

  return (
    <Provider store={store}>
      <Router history={browserHistory}>
        <Route path='/db' component={Container} onEnter={onChangeDatabase(dispatch)}>
          <IndexRoute component={Home} />
          <Route path='/databases' component={DatabaseInfo} />
          <Route path='/**/databases' component={DatabaseInfo} onEnter={onChangeDatabase(dispatch)} />

          <Route path='/classes' component={ClassForm}/>
          <Route path='/classes/:name' component={ClassInfo}/>
          <Route path='/**/classes' component={ClassForm}/>
          <Route path='/**/classes/:name' component={ClassInfo} onEnter={onChangeSelection(dispatch, updateSelectedClass)} />

          <Route path='/indexes' component={IndexForm}/>
          <Route path='/indexes/:name' component={IndexInfo}/>
          <Route path='/**/indexes' component={IndexForm}/>
          <Route path='/**/indexes/:name' component={IndexInfo} onEnter={onChangeSelection(dispatch, updateSelectedIndex)} />

        </Route>
        <Redirect from="/" to="/db" />
        <Route path='*' component={NotFound} />
      </Router>
    </Provider>
  );
}

