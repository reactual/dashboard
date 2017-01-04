import { appReducer } from '../../src/app/reducers'
import { resetToDatabase } from '../../src/app/actions'

it("should reset to database", () => {
  const oldState = {
    classes: { "class": {} },
    indexes: { "index": {} }
  }

  const newState = appReducer(
    oldState,
    resetToDatabase("db-name"))

  const expectedState = {
    classes: {},
    indexes: {}
  }

  expect(newState).toEqual(expectedState)
})

