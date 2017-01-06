import { reduceIndexes, updateIndexInfo, updateSelectedIndex } from '../../src/indexes'

it("should update index info", () => {
  const result = {
    name: "test-index"
  }

  const oldState = {}

  const newState = reduceIndexes(
    oldState,
    updateIndexInfo(result))

  const expectedState = {
    byName: {
      "test-index": {
        indexInfo: result
      }
    }
  }

  expect(newState).toEqual(expectedState)
})

it("should append index info", () => {
  const result = {
    name: "test-index"
 }

  const oldState = {
    selectedIndex: "existent-index",
    byName: {
      "existent-index": {
        indexInfo: {}
      }
    }
  }

  const newState = reduceIndexes(
    oldState,
    updateIndexInfo(result))

  const expectedState = {
    selectedIndex: "existent-index",
    byName: {
      "existent-index": {
        indexInfo: {}
      },
      "test-index": {
        indexInfo: result
      }
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


