import { combineReducers } from 'redux';
import { reduceClasses } from '../classes/reducers'
import { reduceIndexes } from '../indexes/reducers'
import { AppActions } from './actions'

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

