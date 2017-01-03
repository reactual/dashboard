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
    database: "db-name",
    result: ["index-0", "index-1"]
  }]

  return store.dispatch(getAllIndexes(client, "db-name")).then(() => {
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
    database: "db-name",
    result: ["result"]
  }, {
    type: "UPDATE_SELECTED_INDEX",
    database: "db-name",
    name: "test-index"
  }]

  return store.dispatch(getIndexInfo(client, "db-name", "test-index")).then(() => {
    expect(store.getActions()).toEqual(expectedActions)
    expect(client.query).toBeCalled()
  })
})

it('should not get index info when it already have index info', () => {
  const store = mockStore({
    indexes: {
      "db-name": {
        "test-index": {}
      }
    }
  })

  const client = {
    query: jest.fn()
  }

  const expectedActions = [{
    type: "UPDATE_SELECTED_INDEX",
    database: "db-name",
    name: "test-index"
  }]

  return store.dispatch(getIndexInfo(client, "db-name", "test-index")).then(() => {
    expect(store.getActions()).toEqual(expectedActions)
    expect(client.query).not.toBeCalled()
  })
})

