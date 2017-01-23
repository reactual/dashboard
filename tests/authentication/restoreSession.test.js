import { loginWithUnknownUser, loginWithCloudUser } from "../../src/authentication"
import { restoreUserSession } from "../../src/authentication/session"
import Cookies from "js-cookie"
import request from "superagent"

jest.mock("../../src/authentication", () => ({
  loginWithUnknownUser: jest.fn(),
  loginWithCloudUser: jest.fn()
}))

jest.mock("js-cookie", () => ({
  remove: jest.fn(),
  get: jest.fn()
}))

jest.mock("superagent", () => {
  const requestMock = {
    get: jest.fn(() => requestMock),
    end: jest.fn(() => requestMock),
    timeout: jest.fn(() => requestMock),
    withCredentials: jest.fn(() => requestMock)
  }

  return requestMock
})

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
  beforeEach(() => {
    loginWithCloudUser.mockReturnValue("loginWithCloudUser")
    loginWithUnknownUser.mockReturnValue("loginWithUnknownUser")
  })

  describe("when no user data is present", () => {
    it("should NOT restore the user session", () => {
      return restoreUserSession().then(
        (action) => fail(`Should not have triggered ${action}`),
        () => null
      )
    })
  })

  describe("when user data is saved at session storage", () => {
    it("should recognize as an unknown user", () => {
      window.sessionStorage.getItem.mockReturnValue(unknownUser)

      return restoreUserSession().then(action => {
        expect(action).toEqual("loginWithUnknownUser")
        expect(loginWithUnknownUser).toHaveBeenLastCalledWith(
          "localhost",
          "abracadabra",
          { any: 41 }
        )
      })
    })

    it("should recognize a cloud user", () => {
      window.sessionStorage.getItem.mockReturnValue(cloudUser)

      return restoreUserSession().then(action => {
        expect(action).toEqual("loginWithCloudUser")
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

  describe("when website cookie is present", () => {
    beforeEach(() => {
      Cookies.get.mockReturnValue("abc123")
    })

    it("should not recognize user if authentication request fails", () => {
      request.end.mockImplementation(callback => callback(new Error("Some error"), null))
      return restoreUserSession().then(
        (action) => fail(`Should not have triggered ${action}`),
        () => null
      )
    })

    it("should not recognize user if authentication request does not return 200", () => {
      request.end.mockImplementation(callback => callback(null, { ok: false }))
      return restoreUserSession().then(
        (action) => fail(`Should not have triggered ${action}`),
        () => null
      )
    })

    it("should recognize an unknown user", () => {
      request.end.mockImplementation(callback => callback(null, {
        ok: true,
        body: {
          endpoint: "localhost",
          secret: "secret",
          settings: {}
        }
      }))

      return restoreUserSession().then(action => {
        expect(action).toEqual("loginWithUnknownUser")
        expect(loginWithUnknownUser).toHaveBeenLastCalledWith("localhost", "secret", {})
      })
    })

    it("should recognize a cloud user", () => {
      request.end.mockImplementation(callback => callback(null, {
        ok: true,
        body: {
          endpoint: "localhost",
          secret: "secret",
          userId: "123",
          email: "user@example.com",
          settings: {}
        }
      }))

      return restoreUserSession().then(action => {
        expect(action).toEqual("loginWithCloudUser")
        expect(loginWithCloudUser).toHaveBeenLastCalledWith("localhost", "secret", "user@example.com", "123", {})
      })
    })
  })
})
