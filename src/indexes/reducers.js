
export function reduceIndexes(state = {}, action) {
  switch(action.type) {
    case "UPDATE_INDEX_INFO": {
      var indexes = state[action.database] || {}

      action.result.forEach(index => {
        indexes = {...indexes,
          [index.name]: {
            indexInfo: index,
            scopedClient: action.scopedClient
          }
        }
      })

      return {...state, [action.database]: indexes}
    }

    case "UPDATE_SELECTED_INDEX": {
      const indexes = {...state[action.database], selectedIndex: action.name}
      return {...state, [action.database]: indexes}
    }

    default:
      return state
  }
}

