import { reduceClasses } from '../../src/classes/reducers'
import { updateClassInfo, updateSelectedClass } from '../../src/classes/actions'

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
    selectedClass: "existent-class",
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

