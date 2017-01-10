import { UnknownUser, CloudUser } from "./User"

export const LAST_AUTH = "lastAuthenticatedUser"

export default function recognizeUser(localStorage) {
  const savedUser = localStorage.get(LAST_AUTH)
  if (!savedUser) return null

  if (savedUser.userId) {
    return new CloudUser(
      savedUser.endpoint,
      savedUser.secret,
      savedUser.email,
      savedUser.userId,
      savedUser.settings
    )
  }

  return new UnknownUser(
    savedUser.endpoint,
    savedUser.secret,
    savedUser.settings
  )
}
