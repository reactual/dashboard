import Lead from '../../../src/external/intercom/Lead'
import { UnknownUser, CloudUser } from '../../../src/authentication/User'

const intercomSettings = {
  intercom: {
    appId: 1001,
    userHash: "abc"
  }
}

it("should NOT consider unknow user as a lead", () => {
  const user = new UnknownUser("localhost", "secret")
  expect(Lead.from(user)).toBeNull()
})

it("should NOT consider a cloud user as a lead when no app id", () => {
  const user = new CloudUser("localhost", "secret", "user@example.com", 42, { appId: null })
  expect(Lead.from(user)).toBeNull()
})

it("should NOT consider a cloud user as a lead when no email", () => {
  const user = new CloudUser("localhost", "secret", null, 42, intercomSettings)
  expect(Lead.from(user)).toBeNull()
})

it("should NOT consider a cloud user as a lead when no user id", () => {
  const user = new CloudUser("localhost", "secret", "user@example.com", null, intercomSettings)
  expect(Lead.from(user)).toBeNull()
})

it("should consider a cloud user as a lead when all required settings are present", () => {
  const user = new CloudUser("localhost", "secret", "user@example.com", 42, intercomSettings)
  expect(Lead.from(user)).toEqual(new Lead(42, "user@example.com", 1001, "abc"))
})

it("should return settings", () => {
  const user = new CloudUser("localhost", "secret", "user@example.com", 42, intercomSettings)
  const lead = Lead.from(user)

  expect(lead.settings).toEqual({
    app_id: 1001,
    user_id: 42,
    user_hash: "abc",
    email: "user@example.com"
  })
})
