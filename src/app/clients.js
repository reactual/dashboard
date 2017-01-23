import { clientForSubDB } from '../persistence/FaunaDB'

const Actions = {
  UPDATE: "@@clients/UPDATE"
}

export function updateClients(rootClient, splat) {
  return {
    type: Actions.UPDATE,
    rootClient: rootClient,
    splat: splat
  }
}

export function reduceClients(state = {}, action) {
  switch(action.type) {
    case Actions.UPDATE:
      return {
        scopedServerClient: clientForSubDB(action.rootClient, action.splat, "server"),
        scopedAdminClient: clientForSubDB(action.rootClient, action.splat, "admin"),
        rootClient: action.rootClient
      }

    default:
      return state
  }
}
