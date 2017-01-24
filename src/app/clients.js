import { clientForSubDB } from '../persistence/FaunaDB'

const Actions = {
  UPDATE: "@@clients/UPDATE"
}

export function updateClients(rootClient, splat) {
  if(Array.isArray(splat))
    splat = splat.join("/")

  return dispatch => {
    dispatch({
      type: Actions.UPDATE,
      rootClient: rootClient,
      scopedServerClient: clientForSubDB(rootClient, splat, "server"),
      scopedAdminClient: clientForSubDB(rootClient, splat, "admin"),
      splat: splat
    })
  }
}

export function reduceClients(state = {}, action) {
  switch(action.type) {
    case Actions.UPDATE:
      return {...state,
        scopedServerClient: action.scopedServerClient,
        scopedAdminClient: action.scopedAdminClient,
        rootClient: action.rootClient
      }

    default:
      return state
  }
}
