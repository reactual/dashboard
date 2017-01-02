
export function reduceIndexes(state = {}, action) {
  switch(action.type) {
    case "UPDATE_INDEX_INFO":
      action.result.forEach(index => {
        state = {...state,
          [index.name]: {
            indexInfo: index,
            scopedClient: action.scopedClient
          }
        }
      })

      return state

    case "UPDATE_SELECTED_INDEX":
      return {...state, selectedIndex: action.name}

    default:
      return state
  }
}

