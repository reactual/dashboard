import recognizeUser from "../../src/authentication/recognizeUser"
import { UnknownUser, CloudUser } from  "../../src/authentication/User"

function localStorageWith(userToReturn) {
  return {
    get: jest.fn(() => userToReturn),
    set: jest.fn()
  }
}

const unknownUser = {
  secret: "abracadabra",
  endpoint: "localhost"
}

const cloudUser = {
  secret: "abracadabra",
  endpoint: "localhost",
  email: "user@example.com",
  userId: "abc123"
}

describe("When no user user data is present", () => {
  it("should NOT recognize a user", () => {
    expect(recognizeUser(localStorageWith(null))).toBeNull()
  })
})

describe("When user data is saved at local storage", () => {
  it("should recognize as an unnamed user", () => {
    expect(recognizeUser(localStorageWith(unknownUser)))
      .toEqual(new UnknownUser("localhost", "abracadabra"))
  })

  it("should recognize a cloud user", () => {
    expect(recognizeUser(localStorageWith(cloudUser)))
      .toEqual(new CloudUser(
        "localhost",
        "abracadabra",
        "user@example.com",
        "abc123"
      ))
  })
})
