import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

import { IndexesActions, getAllIndexes } from '../../src/indexes/actions'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

it('should get all indexes', () => {
  const store = mockStore({
    indexes: {}
  })

  const client = {
    query: jest.fn()
  }

  client.query.mockReturnValue(Promise.resolve({
    data: ["index-0", "index-1"]
  }))

  const expectedActions = [{
    type: IndexesActions.FETCHING_INDEXES,
    fetching: true
  }, {
    type: IndexesActions.UPDATE_INDEX_INFO,
    result: ["index-0", "index-1"]
  }, {
    type: IndexesActions.FETCHING_INDEXES,
    fetching: false
  }]

  return store.dispatch(getAllIndexes(client)).then(() => {
    expect(store.getActions()).toEqual(expectedActions)
    expect(client.query).toBeCalled()
  })
})

it('should not get index info when it already have index info', () => {
  const store = mockStore({
    indexes: {
      byName: {
        "test-index": {}
      }
    }
  })

  const client = {
    query: jest.fn()
  }

  const expectedActions = []

  return store.dispatch(getAllIndexes(client)).then(() => {
    expect(store.getActions()).toEqual(expectedActions)
    expect(client.query).not.toBeCalled()
  })
})

