import {
  reduceIndexes,
  updateIndexInfo,
  getAllIndexes,
  updateSelectedIndex,
  fetchingIndexes,
  createIndex
} from '../../src/indexes'

describe("Given an indexes store", () => {
  var store, indexes

  beforeEach(() => {
    store = createTestStore({ indexes: reduceIndexes })(
      state => indexes = state.indexes
    )
  })

  it('should get all indexes', () => {
    const index0 = {name: "index-0"}
    const index1 = {name: "index-1"}

    faunaClient.query.mockReturnValue(Promise.resolve({
      data: [index0, index1]
    }))

    return store.dispatch(getAllIndexes(faunaClient)).then(() => {
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

  it("should be able to create a new index", () => {
    faunaClient.query.mockReturnValue(Promise.resolve({
      name: "new-index"
    }))

    return store.dispatch(createIndex(faunaClient, { name: "new-index" })).then(() => {
      expect(indexes).toEqual({
        byName: {
          "new-index": {
            indexInfo: { name: "new-index" }
          }
        },
        fetchingData: false
      })
    })
  })

  describe("Given an indexes store with indexes", () => {
    beforeEach(() => {
      store = store.withInitialState({
        indexes: {
          byName: {
            "test-index": {}
          }
        }
      })
    })

    it('should not get index info', () => {
      return store.dispatch(getAllIndexes(faunaClient)).then(() => {
        expect(faunaClient.query).not.toBeCalled()
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
})
