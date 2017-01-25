import { invalidateUserSession, saveUserSession } from "./session"
import { createClient } from "../persistence/FaunaDB"
import { updateClients } from "../app/clients"
import discoverKeyType from "../discoverKeyType";

class User {
  constructor({client, adminClient, serverClient}, settings = {}) {
    this.client = client
    this.adminClient = adminClient
    this.serverClient = serverClient
    this.settings = settings
  }
}

export class UnknownUser extends User {}

export class CloudUser extends User {
  constructor(clients, email, userId, settings = {}) {
    super(clients, settings)
    this.email = email
    this.userId = userId
  }
}

const Actions = {
  LOGIN: "@@authentication/LOGIN",
  LOGOUT: "@@authentication/LOGOUT",
  RESTORING: "@@authentication/RESTORING"
}

const login = (endpoint, secret) => createUser => (dispatch, getState) => {
  const client = createClient(
    endpoint,
    secret,
    dispatch
  )

  // determine what kind of key permissions the secret has
  return discoverKeyType(client).then(({adminClient, serverClient}) => {
    dispatch({
      type: Actions.LOGIN,
      user: createUser({client, adminClient, serverClient})
    })

    // smell #96 this shouldn't need to know about currentDatabase
    dispatch(updateClients(client, getState().currentDatabase))
  })
}

export const loginWithUnknownUser = (endpoint, secret, settings) => {
  return login(endpoint, secret)(
    clients => new UnknownUser(clients, settings)
  )
}

export const loginWithCloudUser = (endpoint, secret, email, userId, settings) => {
  return login(endpoint, secret)(
    clients => new CloudUser(clients, email, userId, settings)
  )
}

export function logout() {
  return {
    type: Actions.LOGOUT
  }
}

export function restoringSession(doingRequest) {
  return {
    type : Actions.RESTORING,
    restoring : doingRequest
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
