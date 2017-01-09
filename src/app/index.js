import { combineReducers } from 'redux';
import { reduceClasses } from '../classes'
import { reduceIndexes } from '../indexes'

import App from './App'
export { App }

// Actions

export const AppActions = {
  RESET_STATE: "RESET_STATE"
}

export function resetState() {
  return {
    type: AppActions.RESET_STATE
  }
}

// Reducers

/*

  Shape of data

  {
    classes: {},
    indexes: {}
  }

*/

const appReducer0 = combineReducers({
  classes: reduceClasses,
  indexes: reduceIndexes
})

export function appReducer(state = {}, action) {
  switch(action.type) {
    case AppActions.RESET_STATE:
      return {...state, classes: {}, indexes: {}}

    default:
      break
  }

  return appReducer0(state, action)
}

