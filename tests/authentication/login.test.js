import { reduceAuthentication, loginWithUnknownUser, logout } from "../../src/authentication/login"
import { UnknownUser } from "../../src/authentication/user"

it("should update current user on login", () => {
  const state = reduceAuthentication({}, loginWithUnknownUser("localhost", "secret"))
  expect(state).toEqual(new UnknownUser("localhost", "secret"))
})

it("should remove current user on logout", () => {
  const state = reduceAuthentication(new UnknownUser("localhost", "secret"), logout())
  expect(state).toEqual(null)
})
