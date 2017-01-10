import { UnknownUser } from "./User"
import { LAST_AUTH } from "./recognizeUser"
import localStorage from "../persistence/LocalStorage"

const Actions = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT"
}

export function loginWithUnknownUser(endpoint, secret) {
  return {
    type: Actions.LOGIN,
    user: new UnknownUser(endpoint, secret)
  }
}

export function logout() {
  return {
    type: Actions.LOGOUT
  }
}

const DEV_MODE = process.env.NODE_ENV === "development"

export function reduceAuthentication(state = null, action) {
  switch (action.type) {
    case Actions.LOGIN:
      if (DEV_MODE) localStorage.set(LAST_AUTH, action.user)
      return action.user

    case Actions.LOGOUT:
      if (DEV_MODE) localStorage.set(LAST_AUTH, null)
      return null

    default:
      return state
  }
}
