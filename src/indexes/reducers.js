
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
    case "UPDATE_INDEX_INFO": {
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

    case "UPDATE_SELECTED_INDEX":
      return {...state, selectedIndex: action.name}

    case "FETCHING_INDEXES":
      return {...state, fetchingData: action.fetching}

    default:
      return state
  }
}

