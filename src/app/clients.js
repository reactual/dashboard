import { clientForSubDB } from '../persistence/FaunaDB'
import discoverKeyType from "../discoverKeyType";

const Actions = {
  UPDATE: "@@clients/UPDATE",
  UPDATE_TYPE: "@@clients/UPDATE_TYPE"
}

export function updateClients(rootClient, splat) {
  return dispatch => {
    dispatch({
      type: Actions.UPDATE,
      rootClient: rootClient,
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
        scopedServerClient: clientForSubDB(action.rootClient, action.splat, "server"),
        scopedAdminClient: clientForSubDB(action.rootClient, action.splat, "admin"),
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
