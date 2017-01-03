import { reduceIndexes } from '../../src/indexes/reducers'
import { updateIndexInfo, updateSelectedIndex } from '../../src/indexes/actions'

it("should update index info", () => {
  const client = {}

  const result = {
    name: "test-index"
  }

  const oldState = {}

  const newState = reduceIndexes(
    oldState,
    updateIndexInfo(client, "db-name", result))

  const expectedState = {
    "db-name": {
      "test-index": {
        indexInfo: result,
        scopedClient: client
      }
    }
  }

  expect(newState).toEqual(expectedState)
})

it("should append index info", () => {
  const client = {}

  const result = {
    name: "test-index"
 }

  const oldState = {
    "db-name": {
      selectedIndex: "existent-index",
      "existent-index": {
        indexInfo: {},
        scopedClient: {}
      }
    }
  }

  const newState = reduceIndexes(
    oldState,
    updateIndexInfo(client, "db-name", result))

  const expectedState = {
    "db-name": {
      selectedIndex: "existent-index",
      "existent-index": {
        indexInfo: {},
        scopedClient: client
      },
      "test-index": {
        indexInfo: result,
        scopedClient: client
      }
    }
  }

  expect(newState).toEqual(expectedState)
})

it("should update selected index", () => {
  const oldState = {
    "db-name": {
      selectedIndex: "old-index"
    }
  }

  const newState = reduceIndexes(
    oldState,
    updateSelectedIndex("db-name", "new-index"))

  const expectedState = {
    "db-name": {
      selectedIndex: "new-index"
    }
  }

  expect(newState).toEqual(expectedState)
})


