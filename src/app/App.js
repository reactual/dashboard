import React from 'react';
import { Router, Route, Redirect, IndexRoute, browserHistory } from 'react-router';
import { Provider } from 'react-redux'
import ReactGA from "react-ga"
import Container from '../container/Container'
import IndexInfo from '../indexes/IndexInfo'
import IndexForm from '../indexes/IndexForm'
import ClassInfo from '../classes/ClassInfo'
import ClassForm from '../classes/ClassForm'
import { DatabaseInfo } from '../databases/Databases'

import { resetState } from '../app'
import { updateClients } from '../app/clients'
import { getAllClasses, updateSelectedClass } from '../classes'
import { getAllIndexes, updateSelectedIndex } from '../indexes'
import { updateCurrentDatabase } from '../databases'
import { restoreUserSession } from "../authentication/session"
import { restoringSession } from "./lifecycle"

import './App.css';

const isProduction = process.env.NODE_ENV === "production"

if (isProduction) {
  // FIXME: this should be in a config somewhere
  ReactGA.initialize("UA-51914115-3")
}

const trackPage = () => {
  if (isProduction) {
    ReactGA.set({ page: window.location.pathname })
    ReactGA.pageview(window.location.pathname)
  }
}

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

const onChangeDatabase = (dispatch, getState) => (nextState, replace) => {
  const splat = nextState.params.splat ?
                nextState.params.splat.replace(/^db\/?/, "") : ""

  dispatch(resetState())
  dispatch(updateCurrentDatabase(splat))

  if(getState().currentUser) {
    const rootClient = getState().currentUser.client
    dispatch(updateClients(rootClient, splat))
    return Promise.all([
      dispatch(getAllClasses(getState().clients.scopedServerClient)),
      dispatch(getAllIndexes(getState().clients.scopedServerClient))
    ])
  }

  dispatch(restoringSession(true))
  restoreUserSession()
    .then(action => {
      dispatch(action).then(() => {
        dispatch(restoringSession(false))
        const rootClient = getState().currentUser.client
        dispatch(updateClients(rootClient, splat))
      })
    })
    .catch(() => {
      dispatch(restoringSession(false))
    })
}

export default function App({store}) {
  const dispatch = store.dispatch
  const getState = store.getState

  return (
    <Provider store={store}>
      <Router onUpdate={trackPage} history={browserHistory}>
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
