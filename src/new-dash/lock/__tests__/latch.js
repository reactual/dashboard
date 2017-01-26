import { reduceLock, withLock } from "../"

describe("Given a lock store", () => {
  let store, isLocked

  beforeEach(() => {
    isLocked = false
    store = createImmutableTestStore({ lock: reduceLock })(
      state => isLocked = state.getIn(["lock", "isLocked"])
    )
  })

  it("should lock during operation", () => {
    return store.dispatch(
      withLock(() => {
        expect(isLocked).toBeTruthy()
        return Promise.resolve(42)
      })
    ).then(result => {
      expect(isLocked).toBeFalsy()
      expect(result).toEqual(42)
    })
  })

  it("should unlock on failure", () => {
    return store.dispatch(
      withLock(() => {
        expect(isLocked).toBeTruthy()
        return Promise.reject(new Error("Fail"))
      })
    ).catch(error => {
      expect(isLocked).toBeFalsy()
      expect(error).toEqual(new Error("Fail"))
    })
  })
})
