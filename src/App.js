import React, { Component } from 'react';
import {Router, Route, Redirect, IndexRoute, browserHistory} from 'react-router';
import { Provider } from 'react-redux'
import Container from './container/Container'
import IndexInfo from './indexes/Indexes'
import {IndexForm} from './index-form/IndexForm'
import ClassInfo from './classes/Classes'
import {ClassForm} from './class-form/ClassForm'
import {DatabaseInfo} from './databases/Databases'
import {DatabaseForm} from './database-form/DatabaseForm'
import './App.css';

const Home = () =>(
  <p>
    Welcome to FaunaDB. Browse and create databases, inspect and define schemas
     and instances, and explore your data with the interactive query console.
  </p>
);

const NotFound = () => (<h1>404.. This page is not found!</h1>);

class App extends Component {
  render() {
    return (
      <Provider store={this.props.store}>
      <Router history={browserHistory}>
        <Route path='/db' component={Container}>
          <IndexRoute component={Home} />
          <Route path='/databases' component={DatabaseForm} />
          <Route path='/**/databases' component={DatabaseForm} />
          <Route path='/**/info' component={DatabaseInfo} />

          <Route path='/classes' component={ClassForm}/>
          <Route path='/classes/:name' component={ClassInfo}/>
          <Route path='/**/classes' component={ClassForm}/>
          <Route path='/**/classes/:name' component={ClassInfo}/>

          <Route path='/indexes' component={IndexForm}/>
          <Route path='/indexes/:name' component={IndexInfo}/>
          <Route path='/**/indexes' component={IndexForm}/>
          <Route path='/**/indexes/:name' component={IndexInfo}/>

        </Route>
        <Redirect from="/" to="/db" />
        <Route path='*' component={NotFound} />
      </Router>
      </Provider>
    );
  }
}

export default App;
