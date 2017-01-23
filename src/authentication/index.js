import { invalidateUserSession, saveUserSession } from "./session"
import { createClient } from "../persistence/FaunaDB"
import { updateClients } from "../app/clients"

class User {
  constructor(client, settings = {}) {
    this.client = client
    this.settings = settings
  }
}

export class UnknownUser extends User {}

export class CloudUser extends User {
  constructor(client, email, userId, settings = {}) {
    super(client, settings)
    this.email = email
    this.userId = userId
  }
}

const Actions = {
  LOGIN: "@@authentication/LOGIN",
  LOGOUT: "@@authentication/LOGOUT"
}

const login = (endpoint, secret) => createUser => (dispatch, getState) => {
  const client = createClient(
    endpoint,
    secret,
    dispatch
  )

  // Only dispatch LOGIN if endpoint and secret are correct
  return client.query({}).then(() => {
    dispatch({
      type: Actions.LOGIN,
      user: createUser(client)
    })

    dispatch(updateClients(client, getState().currentDatabase))
  })
}

export const loginWithUnknownUser = (endpoint, secret, settings) => {
  return login(endpoint, secret)(
    client => new UnknownUser(client, settings)
  )
}

export const loginWithCloudUser = (endpoint, secret, email, userId, settings) => {
  return login(endpoint, secret)(
    client => new CloudUser(client, email, userId, settings)
  )
}

export function logout() {
  return {
    type: Actions.LOGOUT
  }
}

export function reduceAuthentication(state = null, action) {
  switch (action.type) {
    case Actions.LOGIN:
      saveUserSession(action.user)
      return action.user

    case Actions.LOGOUT:
      invalidateUserSession()
      return null

    default:
      return state
  }
}
