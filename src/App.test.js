import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

it('renders without crashing', () => {
  const div = document.createElement('div');

  const store = mockStore({})

  ReactDOM.render(<App store={store} />, div);
});
