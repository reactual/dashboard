import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

import {
  reduceIndexes,
  updateIndexInfo,
  getAllIndexes,
  updateSelectedIndex,
  fetchingIndexes
} from '../../src/indexes'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

describe("Given an indexes store", () => {
  var store, indexes

  beforeEach(() => {
    store = createStore(
      { indexes: reduceIndexes },
      state => indexes = state.indexes)
  })

  it('should get all indexes', () => {
    const client = {
      query: jest.fn()
    }

    const index0 = {name: "index-0"}
    const index1 = {name: "index-1"}

    client.query.mockReturnValue(Promise.resolve({
      data: [index0, index1]
    }))

    return store.dispatch(getAllIndexes(client)).then(() => {
      expect(indexes).toEqual({
        byName: {
          "index-0": { indexInfo: index0 },
          "index-1": { indexInfo: index1 },
        },
        fetchingData: false
      })
    })
  })

  it("should update selected index", () => {
    store.dispatch(updateSelectedIndex("a-index"))

    expect(indexes).toEqual({
      selectedIndex: "a-index"
    })
  })

  it("should update fetching data", () => {
    store.dispatch(fetchingIndexes(true))

    expect(indexes).toEqual({
      fetchingData: true
    })
  })
})

describe("Given an indexes store with indexes", () => {
  var store, indexes

  beforeEach(() => {
    const initialState = {
      indexes: {
        byName: {
          "test-index": {}
        }
      }
    }

    store = createStore(
      { indexes: reduceIndexes },
      state => indexes = state.indexes,
      initialState)
  })

  it('should not get index info', () => {
    const client = {
      query: jest.fn()
    }

    return store.dispatch(getAllIndexes(client)).then(() => {
      expect(client.query).not.toBeCalled()
    })
  })

  it("should update index info", () => {
    const index = {name: "new-index"}

    store.dispatch(updateIndexInfo(index))

    expect(indexes).toEqual({
      byName: {
        "test-index": {},
        "new-index": { indexInfo: index }
      }
    })
  })
})


