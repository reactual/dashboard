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
    updateIndexInfo(client, result))

  const expectedState = {
    "test-index": {
      indexInfo: result,
      scopedClient: client
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
    selectedIndex: "existent-index",
    "existent-index": {
      indexInfo: {},
      scopedClient: {}
    }
  }

  const newState = reduceIndexes(
    oldState,
    updateIndexInfo(client, result))

  const expectedState = {
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

  expect(newState).toEqual(expectedState)
})

it("should update selected index", () => {
  const oldState = {
    selectedIndex: "old-index"
  }

  const newState = reduceIndexes(
    oldState,
    updateSelectedIndex("new-index"))

  const expectedState = {
    selectedIndex: "new-index"
  }

  expect(newState).toEqual(expectedState)
})


