import Immutable, { Map } from "immutable"
import request from "superagent"
import Cookies from "js-cookie"

import FaunaClient from "../persistence/faunadb-wrapper"
import SessionStorage from "../persistence/session-storage"

const WEBSITE = process.env.NODE_ENV === "production" ? "https://fauna.com" : "http://localhost:3000"
const LOGGED_IN_USER = "loggedInUser"
const CLOUD_COOKIE = "dashboard"
const AUTH_API_TIMEOUT = 5000
const AUTH_API = `${WEBSITE}/dashboard/user_info`

const Actions = {
  LOGIN: "@@authentication/LOGIN",
  LOGOUT: "@@authentication/LOGOUT"
}

export const login = (endpoint, secret, settings = Map()) => dispatch => {
  return FaunaClient.discoverKeyType(endpoint, secret).then(client => {
    SessionStorage.set(LOGGED_IN_USER, {
      endpoint,
      secret
    })

    dispatch({
      type: Actions.LOGIN,
      user: Map({
        endpoint,
        secret,
        settings,
        client
      })
    })
  })
}

export const restoreUserSession = () => (dispatch) => {
  const user = SessionStorage.get(LOGGED_IN_USER)
  if (user) return dispatch(login(user.endpoint, user.secret))
  return Promise.resolve(false)
}

export const loginWithCloud = () => (dispatch) => {
  if (!Cookies.get(CLOUD_COOKIE))
    return Promise.resolve(false)

  return new Promise((resolve, reject) => {
    request.get(AUTH_API)
      .timeout(AUTH_API_TIMEOUT)
      .withCredentials()
      .end((error, res) => {
        if (error || !res.ok || !res.body) {
          reject("Cloud authentication request has failed.")
          return
        }

        const user = Immutable.fromJS(res.body)

        resolve(
          dispatch(
            login(
              user.get("endpoint"),
              user.get("secret"),
              Map.of(
                "intercom", Map({
                  app_id: user.getIn(["settings", "intercom", "appId"]),
                  user_hash: user.getIn(["settings", "intercom", "userHash"]),
                  user_id: user.get("userId"),
                  email: user.get("email")
                }),
                "logoutUrl", `${WEBSITE}/logout`
              )
            )
          ).then(() => true)
        )
      })
  })
}

export const logout = () => (dispatch, getState) => {
  const logoutUrl = getState().getIn(["currentUser", "settings", "logoutUrl"], "/")

  Cookies.remove(CLOUD_COOKIE)
  SessionStorage.clear()
  dispatch({ type: Actions.LOGOUT })

  return logoutUrl
}

export const reduceUserSession = (state = null, action) => {
  switch (action.type) {
    case Actions.LOGIN:  return action.user
    case Actions.LOGOUT: return null
    default:             return state
  }
}
