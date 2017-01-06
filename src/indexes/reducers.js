import { IndexesActions } from './actions'

/*
  Shape of data

  indexes: {
    byName: {
      "index-0": {},
      "index-1": {}
    },
    selectedIndex: "index-0",
    fecthingData: true
  }
  
*/

export function reduceIndexes(state = {}, action) {
  switch(action.type) {
    case IndexesActions.UPDATE_INDEX_INFO: {
      var byName = state.byName

      action.result.forEach(index => {
        byName = {...byName,
          [index.name]: {
            indexInfo: index,
            scopedClient: action.scopedClient
          }
        }
      })

      return {...state, byName: byName}
    }

    case IndexesActions.UPDATE_SELECTED_INDEX:
      return {...state, selectedIndex: action.name}

    case IndexesActions.FETCHING_INDEXES:
      return {...state, fetchingData: action.fetching}

    default:
      return state
  }
}

