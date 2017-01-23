import { clientForSubDB } from '../persistence/FaunaDB'
import discoverKeyType from "../discoverKeyType";

const Actions = {
  UPDATE: "@@clients/UPDATE",
  UPDATE_TYPE: "@@clients/UPDATE_TYPE"
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

    return discoverKeyType(rootClient).then(({adminClient, serverClient}) => {
      dispatch({
        type: Actions.UPDATE_TYPE,
        adminClient: adminClient,
        serverClient: serverClient
      })
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

    case Actions.UPDATE_TYPE:
      return {...state,
        adminClient: action.adminClient,
        serverClient: action.serverClient
      }

    default:
      return state
  }
}
