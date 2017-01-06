import { reduceClasses, updateClassInfo, updateSelectedClass } from '../../src/classes'

it("should update class info", () => {
  const result = {
    name: "test-class"
  }

  const oldState = {}

  const newState = reduceClasses(
    oldState,
    updateClassInfo(result))

  const expectedState = {
    byName: {
      "test-class": {
        classInfo: result
      }
    }
  }

  expect(newState).toEqual(expectedState)
})

it("should append class info", () => {
  const result = {
    name: "test-class"
  }

  const oldState = {
    selectedClass: "existent-class",
    byName: {
      "existent-class": {
        classInfo: {}
      }
    }
  }

  const newState = reduceClasses(
    oldState,
    updateClassInfo(result))

  const expectedState = {
    selectedClass: "existent-class",
    byName: {
      "existent-class": {
        classInfo: {}
      },
      "test-class": {
        classInfo: result
      }
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

