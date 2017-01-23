import { createStore, combineReducers, applyMiddleware } from "redux"
import thunk from "redux-thunk"

// Mock session storage API
global.sessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
}

// Mock connections to FaunaDB
const faunaClient = {
  _baseUrl: "localhost",
  _secret: "secret",
  query: null
}

beforeEach(() => {
  faunaClient.query = jest.fn(() => Promise.resolve())
})

jest.mock("./persistence/FaunaDB", () => ({
  createClient: jest.fn(() => faunaClient),
  clientForSubDB: jest.fn((client, splat, type) => ({
    ...client,
    _secret: client._secret + ":" + splat + ":" + type
  }))
}))

global.faunaClient = faunaClient

// Util for creating redux stores
const createTestStore = (reducers, initialState) => (onStateChanged) => {
  const store = createStore(
    combineReducers(reducers),
    initialState,
    applyMiddleware(thunk)
  )

  const unsubscribe = store.subscribe(() => onStateChanged && onStateChanged(store.getState()))

  // Helper to create a copy of this store with a different initial state
  store.withInitialState = (initialState) => {
    unsubscribe()
    return createTestStore(reducers, initialState)(onStateChanged)
  }

  return store
}

global.createTestStore = createTestStore
