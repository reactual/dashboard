import { appReducer, resetState } from '../../src/app'

it('should reset state', () => {
  const store = createTestStore(appReducer, {
    classes: {class: "class"},
    indexes: {index: "index"},
    currentDatabase: ["datbase-a", "nested-database"],
    currentUser: {},
    clients: {rootClient: {}},
    notifications: ["a notification"]
  })()

  store.dispatch(resetState())

  expect(store.getState()).toEqual({
    classes: {},
    indexes: {},
    currentDatabase: [],
    currentUser: {},
    clients: {rootClient: {}},
    notifications: ["a notification"]
  })
})

