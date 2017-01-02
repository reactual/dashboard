import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

import { getAllIndexes, getIndexInfo } from '../../src/indexes/actions'

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
    type: "UPDATE_INDEX_INFO",
    scopedClient: client,
    result: ["index-0", "index-1"]
  }]

  return store.dispatch(getAllIndexes(client)).then(() => {
    expect(store.getActions()).toEqual(expectedActions)
    expect(client.query).toBeCalled()
  })
})

it('should get index info', () => {
  const store = mockStore({
    indexes: {}
  })

  const client = {
    query: jest.fn()
  }

  client.query.mockReturnValue(Promise.resolve("result"))

  const expectedActions = [{
    type: "UPDATE_INDEX_INFO",
    scopedClient: client,
    result: ["result"]
  }, {
    type: "UPDATE_SELECTED_INDEX",
    name: "test-index"
  }]

  return store.dispatch(getIndexInfo(client, "test-index")).then(() => {
    expect(store.getActions()).toEqual(expectedActions)
    expect(client.query).toBeCalled()
  })
})

it('should not get index info when it already have index info', () => {
  const store = mockStore({
    indexes: {
      "test-index": {}
    }
  })

  const client = {
    query: jest.fn()
  }

  const expectedActions = [{
    type: "UPDATE_SELECTED_INDEX",
    name: "test-index"
  }]

  return store.dispatch(getIndexInfo(client, "test-index")).then(() => {
    expect(store.getActions()).toEqual(expectedActions)
    expect(client.query).not.toBeCalled()
  })
})

