import { clientForSubDB } from '../persistence/FaunaDB'
import discoverKeyType from "../discoverKeyType";
import { getAllClasses } from '../classes'
import { getAllIndexes } from '../indexes'

const Actions = {
  UPDATE: "@@clients/UPDATE"
}

export function updateClients(rootClient, splat) {
  if(Array.isArray(splat))
    splat = splat.join("/")

  return dispatch => {
    const scopedServerClient = clientForSubDB(rootClient, splat, "server")
    const scopedAdminClient = clientForSubDB(rootClient, splat, "admin")

    dispatch({
      type: Actions.UPDATE,
      rootClient: rootClient,
      scopedServerClient: scopedServerClient,
      scopedAdminClient: scopedAdminClient,
      splat: splat
    })

    return Promise.all([
      dispatch(getAllClasses(scopedServerClient)),
      dispatch(getAllIndexes(scopedServerClient))
    ])
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
