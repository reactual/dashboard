import { loginWithCloudUser, loginWithUnknownUser, CloudUser } from "."
import sessionStorage from "../persistence/SessionStorage"

const LAST_AUTH = "lastAuthenticatedUser"

export function restoreUserSession() {
  const savedUser = sessionStorage.get(LAST_AUTH)
  if (!savedUser) return null

  if (savedUser.userId) {
    return loginWithCloudUser(
      savedUser.endpoint,
      savedUser.secret,
      savedUser.email,
      savedUser.userId,
      savedUser.settings
    )
  }

  return loginWithUnknownUser(
    savedUser.endpoint,
    savedUser.secret,
    savedUser.settings
  )
}

export function saveUserSession(user) {
  if (!user) return

  var authData = {
    endpoint: user.client._baseUrl,
    secret: user.client._secret,
    settings: user.settings
  }

  if (user instanceof CloudUser) {
    authData.email = user.email
    authData.userId = user.userId
  }

  sessionStorage.set(LAST_AUTH, authData)
}

export function invalidateUserSession() {
  sessionStorage.clear()
}
