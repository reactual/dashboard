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
import { updateClients } from '../app/clients'
import { updateSelectedClass } from '../classes'
import { updateSelectedIndex } from '../indexes'
import { updateCurrentDatabase } from '../databases'
import { restoreUserSession } from "../authentication/session"

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

const onChangeDatabase = (dispatch, getState) => (nextState, replace, callback) => {
  const splat = nextState.params.splat ?
                nextState.params.splat.replace(/^db\/?/, "") : ""

  dispatch(resetState())
  dispatch(updateCurrentDatabase(splat))

  if(getState().currentUser) {
    const rootClient = getState().currentUser.client
    dispatch(updateClients(rootClient, splat))
    return callback()
  }

  restoreUserSession()
    .then(action => {
      dispatch(action).then(() => {
        const rootClient = getState().currentUser.client
        dispatch(updateClients(rootClient, splat))
        callback()
      })
    })
    .catch(() => callback())
}

export default function App({store}) {
  const dispatch = store.dispatch
  const getState = store.getState

  return (
    <Provider store={store}>
      <Router history={browserHistory}>
        <Route path='/db' component={Container} onEnter={onChangeDatabase(dispatch, getState)}>
          <IndexRoute component={Home} />
          <Route path='/databases' component={DatabaseInfo} />
          <Route path='/**/databases' component={DatabaseInfo} onEnter={onChangeDatabase(dispatch, getState)} />

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

