import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

import {
  reduceClasses,
  ClassesActions,
  getAllClasses,
  queryForIndexes,
  updateClassInfo,
  updateIndexOfClass,
  updateSelectedClass,
  fetchingClasses
} from '../../src/classes'

import { createStore, combineReducers, applyMiddleware } from "redux"
import thunk from "redux-thunk"

function _createStore(initialState) {
  return createStore(
    combineReducers({classes: reduceClasses}),
    initialState,
    applyMiddleware(thunk)
  )
}

describe("Given a classes store", () => {
  var store

  beforeEach(() => {
    store = _createStore()
  })

  it('should get all classes', () => {
    const client = {
      query: jest.fn()
    }

    const class0 = {name: "class-0"}
    const class1 = {name: "class-1"}

    client.query.mockReturnValue(Promise.resolve({
      data: [class0, class1]
    }))

    return store.dispatch(getAllClasses(client)).then(() => {
      const classes = store.getState().classes

      expect(classes).toEqual({
        "byName": {
          "class-0": { classInfo: class0 },
          "class-1": { classInfo: class1 },
        },
        fetchingData: false
      })
    })
  })

  it('should query indexes of class', () => {
    const client = {
      query: jest.fn()
    }

    client.query.mockReturnValue(Promise.resolve({
      data: ["index-0", "index-1"]
    }))

    const classRef = Ref("classes/test-class")
    return store.dispatch(queryForIndexes(client, classRef)).then(() => {
      const classes = store.getState().classes

      expect(client.query).toBeCalled()

      expect(classes).toEqual({
        indexes: {
          "test-class": ["index-0", "index-1"]
        },
        fetchingIndexes: false
      })
    })
  })

  it("should update class info", () => {
    const clazz = {name: "a-class"}

    store.dispatch(updateClassInfo(clazz))

    const classes = store.getState().classes

    expect(classes).toEqual({
      byName: {
        "a-class": { classInfo: clazz }
      }
    })
  })

  it("should update index of class", () => {
    store.dispatch(updateIndexOfClass("a-class", ["index-0", "index-1"]))

    const classes = store.getState().classes

    expect(classes).toEqual({
      indexes: {
        "a-class": ["index-0", "index-1"]
      }
    })
  })

  it("should update selected class", () => {
    store.dispatch(updateSelectedClass("a-class"))

    const classes = store.getState().classes

    expect(classes).toEqual({
      selectedClass: "a-class"
    })
  })

  it("should update fetching data", () => {
    store.dispatch(fetchingClasses(true))

    const classes = store.getState().classes

    expect(classes).toEqual({
      fetchingData: true
    })
  })
})

describe("Given a classes store with classes information", () => {
  var store

  beforeEach(() => {
    const initialState = {
      classes: { byName: {} }
    }

    store = _createStore(initialState)
  })

  it('should not get class info', () => {
    const client = {
      query: jest.fn()
    }

    return store.dispatch(getAllClasses(client)).then(() => {
      expect(client.query).not.toBeCalled()
    })
  })
})

describe("Given a classes store with indexes information", () => {
  var store

  beforeEach(() => {
    const initialState = {
      classes: { indexes: { "test-class": [] } }
    }

    store = _createStore(initialState)
  })

  it('should not query for indexes', () => {
    const client = {
      query: jest.fn()
    }

    const classRef = Ref("classes/test-class")
    return store.dispatch(queryForIndexes(client, classRef)).then(() => {
      expect(client.query).not.toBeCalled()
    })
  })
})

