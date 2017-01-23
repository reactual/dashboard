import { loginWithCloudUser, loginWithUnknownUser, CloudUser } from "."
import sessionStorage from "../persistence/SessionStorage"
import Cookies from "js-cookie"
import request from "superagent"

const LAST_AUTH = "lastAuthenticatedUser"
const AUTH_COOKIE = "dashboard"
const AUTH_API_TIMEOUT = 5000

// FIXME: we should move this to a configuration layer
const WEBSITE = process.env.NODE_ENV === "development" ?  "http://localhost:3000" : "https://fauna.com"
const AUTH_API = `${WEBSITE}/dashboard/user_info`

const asAuthAction = (user) => {
  if (!user) return Promise.reject()

  if (user.userId) {
    return Promise.resolve(loginWithCloudUser(
      user.endpoint,
      user.secret,
      user.email,
      user.userId,
      user.settings
    ))
  }

  return Promise.resolve(loginWithUnknownUser(
    user.endpoint,
    user.secret,
    user.settings
  ))
}

const callAuthApi = () => new Promise((resolve, reject) => {
  request
    .get(AUTH_API)
    .timeout(AUTH_API_TIMEOUT)
    .withCredentials()
    .end((error, res) => {
      if (!error && res.ok && res.body) {
        resolve(asAuthAction(res.body))
      } else {
        reject()
      }
    })
})

const useExternalSignIn = () => Cookies.get(AUTH_COOKIE) !== undefined

export function restoreUserSession() {
  if (useExternalSignIn()) return callAuthApi()
  return asAuthAction(sessionStorage.get(LAST_AUTH))
}

export function saveUserSession(user) {
  if (!user || useExternalSignIn()) return

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

export function logoutUrl() {
  return useExternalSignIn() ? `${WEBSITE}/logout` : "/"
}

export function invalidateUserSession() {
  sessionStorage.clear()
  Cookies.remove(AUTH_COOKIE)
}
