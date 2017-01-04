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
    updateClassInfo(client, "db-name", result))

  const expectedState = {
    "db-name": {
      "test-class": {
        classInfo: result,
        scopedClient: client
      }
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
    "db-name": {
      selectedClass: "existent-class",
      "existent-class": {
        classInfo: {},
        scopedClient: {}
      }
    }
  }

  const newState = reduceClasses(
    oldState,
    updateClassInfo(client, "db-name", result))

  const expectedState = {
    "db-name": {
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
  }

  expect(newState).toEqual(expectedState)
})

it("should update selected class", () => {
  const oldState = {
    "db-name": {
      selectedClass: "old-class"
    }
  }

  const newState = reduceClasses(
    oldState,
    updateSelectedClass("db-name", "new-class"))

  const expectedState = {
    "db-name": {
      selectedClass: "new-class"
    }
  }

  expect(newState).toEqual(expectedState)
})

