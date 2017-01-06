import { appReducer } from '../../src/app/reducers'
import { resetState } from '../../src/app/actions'

it("should reset to database", () => {
  const oldState = {
    classes: { "class": {} },
    indexes: { "index": {} }
  }

  const newState = appReducer(
    oldState,
    resetState())

  const expectedState = {
    classes: {},
    indexes: {}
  }

  expect(newState).toEqual(expectedState)
})

