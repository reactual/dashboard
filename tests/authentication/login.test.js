import {
  reduceAuthentication,
  loginWithUnknownUser,
  loginWithCloudUser,
  logout,
  UnknownUser,
  CloudUser
} from "../../src/authentication"

const settings = { any: "thing" }

describe("Given an user store", () => {
  var store, currentUser

  beforeAll(() => {
    store = createStore(
      { currentUser: reduceAuthentication },
      (state) => currentUser = state.currentUser
    )
  })

  beforeEach(() => currentUser = null)

  const login = (action) => store.dispatch(action())
  const unknownUser = () => loginWithUnknownUser("localhost", "secret", settings)
  const cloudUser = () => loginWithCloudUser("localhost", "secret", "user@example.com", "123", settings)

  describe("when there is NO logged in user", () => {
    it("should be able to login with an unknown user", () =>
      login(unknownUser).then(() =>
        expect(currentUser)
          .toEqual(new UnknownUser(faunaClient, settings))
      )
    )

    it("should be able to login with a cloud user", () =>
      login(cloudUser).then(() =>
        expect(currentUser)
          .toEqual(new CloudUser(faunaClient, "user@example.com", "123", settings))
      )
    )

    it("should fail login if user information is incorrect", () => {
      faunaClient
        .query
        .mockReturnValue(Promise.reject("Some error"))

      return login(unknownUser).catch(error => {
        expect(error).toEqual("Some error")
        expect(currentUser).toEqual(null)
      })
    })

    it("should persist an unknown user to the session", () =>
      login(unknownUser).then(() =>
        expect(window.sessionStorage.setItem).toHaveBeenLastCalledWith(
          "lastAuthenticatedUser",
          '{"endpoint":"localhost","secret":"secret","settings":{"any":"thing"}}'
        )
      )
    )

    it("should persist a cloud user to the session", () =>
      login(cloudUser).then(() =>
        expect(window.sessionStorage.setItem).toHaveBeenLastCalledWith(
          "lastAuthenticatedUser",
          '{"endpoint":"localhost","secret":"secret","settings":{"any":"thing"},"email":"user@example.com","userId":"123"}'
        )
      )
    )
  })

  describe("when there is a logged in user", () => {
    beforeEach(() => login(unknownUser))

    it("should remove current user on logout", () => {
      store.dispatch(logout())
      expect(currentUser).toEqual(null)
    })

    it("should invalidate session after logout", () => {
      store.dispatch(logout())
      expect(window.sessionStorage.clear).toBeCalled()
    })
  })
})
