import { AppActions, resetState } from '../../src/app/actions'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

it('should reset selected database', () => {
  const store = mockStore({})

  const expectedActions = [{
    type: AppActions.RESET_STATE
  }]

  store.dispatch(resetState())

  expect(store.getActions()).toEqual(expectedActions)
})

