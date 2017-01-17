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
  query: jest.fn()
}

beforeEach(() => {
  faunaClient.query.mockReturnValue(Promise.resolve())
})

jest.mock("./persistence/FaunaDB", () => ({
  createClient: jest.fn(() => faunaClient)
}))

global.faunaClient = faunaClient

// Util for creating redux stores
global.createStore = (reducers, subscription) => {
  const store = createStore(
    combineReducers(reducers),
    applyMiddleware(thunk)
  )

  if (typeof subscription === "function") {
    store.subscribe(() => subscription(store.getState()))
  }

  return store
}
