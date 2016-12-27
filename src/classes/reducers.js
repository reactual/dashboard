
export function reduceClasses(state = {}, action) {
  switch(action.type) {
    case "UPDATE_CLASS_INFO":
      return {...state,
        selectedClass: action.result.name,
        [action.result.name]: {
          classInfo: action.result,
          scopedClient: action.scopedClient
        }
      }

    case "UPDATE_SELECTED_CLASS":
      return {...state, selectedClass: action.name}

    case "UPDATE_INDEX_INFO":
      let indexes = [...action.indexes]
      let clazz = {...state[action.clazz], indexes: indexes}

      return {...state, [action.clazz]: clazz}

    default:
      return state
  }
}

