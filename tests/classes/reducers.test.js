import { reduceClasses } from '../../src/classes/reducers'
import { updateClassInfo, updateSelectedClass, updateIndexInfo } from '../../src/classes/actions'

it("should update class info", () => {
  const client = {}

  const result = {
    name: "test-class"
  }

  const oldState = {}

  const newState = reduceClasses(
    oldState,
    updateClassInfo(client, result))

  const expectedState = {
    selectedClass: "test-class",
    "test-class": {
      classInfo: result,
      scopedClient: client
    }
  }

  expect(newState).toEqual(expectedState)
})

it("should append class info", () => {
  const client = {}

  const result = {
    name: "test-class"
 }

  const oldState = {
    selectedClass: "existent-class",
    "existent-class": {
      classInfo: {},
      scopedClient: {}
    }
  }

  const newState = reduceClasses(
    oldState,
    updateClassInfo(client, result))

  const expectedState = {
    selectedClass: "test-class",
    "existent-class": {
      classInfo: {},
      scopedClient: client
    },
    "test-class": {
      classInfo: result,
      scopedClient: client
    }
  }

  expect(newState).toEqual(expectedState)
})

it("should update selected class", () => {
  const oldState = {
    selectedClass: "old-class"
  }

  const newState = reduceClasses(
    oldState,
    updateSelectedClass("new-class"))

  const expectedState = {
    selectedClass: "new-class"
  }

  expect(newState).toEqual(expectedState)
})

it("should update index info", () => {
  const oldState = {}

  const newState = reduceClasses(
    oldState,
    updateIndexInfo("test-class", ["index-0", "index-1"]))

  const expectedState = {
    "test-class": {
      indexes: ["index-0", "index-1"]
    }
  }

  expect(newState).toEqual(expectedState)
})

it("should append index info", () => {
  const oldState = {
    "existent-class": {
      indexes: ["index"]
    }
  }

  const newState = reduceClasses(
    oldState,
    updateIndexInfo("new-class", ["index-0", "index-1"]))

  const expectedState = {
    "existent-class": {
      indexes: ["index"]
    },
    "new-class": {
      indexes: ["index-0", "index-1"]
    }
  }

  expect(newState).toEqual(expectedState)
})

