import { combineReducers } from 'redux'
import { reduceClasses } from '../classes'
import { reduceIndexes } from '../indexes'
import { reduceAuthentication } from '../authentication'
import { reduceNotifications } from '../notification'
import { reduceDatabases } from '../databases'
import { reduceClients } from './clients'
import { reduceLifecycle } from './lifecycle'

// Actions

const Actions = {
  RESET_STATE: "@@app/RESET_STATE"
}

export function resetState() {
  return {
    type: Actions.RESET_STATE
  }
}

// Reducers

/*

  Shape of data

  {
    classes: {},
    indexes: {},
    currentUser: {},
    notifications: {}
    currentDatabase: [],
    lifecycle : {
      restoring : true/false
    }
  }

*/

const appReducer0 = combineReducers({
  classes: reduceClasses,
  indexes: reduceIndexes,
  currentUser: reduceAuthentication,
  notifications: reduceNotifications,
  currentDatabase: reduceDatabases,
  clients: reduceClients,
  lifecycle : reduceLifecycle
})

export function appReducer(state = {}, action) {
  switch(action.type) {
    case Actions.RESET_STATE:
      return {...state, classes: {}, indexes: {}, currentDatabase: []}

    default:
      break
  }

  return appReducer0(state, action)
}
