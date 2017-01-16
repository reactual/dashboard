import { loginWithUnknownUser, loginWithCloudUser } from "../../src/authentication"
import { restoreUserSession } from "../../src/authentication/session"

jest.mock("../../src/authentication", () => ({
  loginWithUnknownUser: jest.fn(),
  loginWithCloudUser: jest.fn()
}))

const unknownUser = JSON.stringify({
  secret: "abracadabra",
  endpoint: "localhost",
  settings: { any: 41 }
})

const cloudUser = JSON.stringify({
  secret: "abracadabra",
  endpoint: "localhost",
  email: "user@example.com",
  userId: "abc123",
  settings: { any: 42 }
})

describe("Given that the session storage api is present", () => {
  describe("when no user data is present", () => {
    it("should NOT restore the user session", () => {
      expect(restoreUserSession()).toBeNull()
    })
  })

  describe("when user data is saved at session storage", () => {
    it("should recognize as an unknown user", () => {
      window.sessionStorage.getItem.mockReturnValue(unknownUser)
      loginWithUnknownUser.mockReturnValue("Perfom login with UnknownUser")

      expect(restoreUserSession()).toEqual("Perfom login with UnknownUser")
      expect(loginWithUnknownUser).toHaveBeenLastCalledWith(
        "localhost",
        "abracadabra",
        { any: 41 }
      )
    })

    it("should recognize a cloud user", () => {
      window.sessionStorage.getItem.mockReturnValue(cloudUser)
      loginWithCloudUser.mockReturnValue("Perform login with CloudUser")

      expect(restoreUserSession()).toEqual("Perform login with CloudUser")
      expect(loginWithCloudUser).toHaveBeenLastCalledWith(
        "localhost",
        "abracadabra",
        "user@example.com",
        "abc123",
        { any: 42 }
      )
    })
  })
})
