
export function reduceClasses(state = {}, action) {
  switch(action.type) {
    case "UPDATE_CLASS_INFO":
      action.result.forEach(clazz => {
        state = {...state,
          [clazz.name]: {
            classInfo: clazz,
            scopedClient: action.scopedClient
          }
        }
      })

      return state

    case "UPDATE_SELECTED_CLASS":
      return {...state, selectedClass: action.name}

    case "UPDATE_INDEX_OF_CLASS":
      const indexes = [...action.indexes]
      const clazz = {...state[action.clazz], indexes: indexes}

      return {...state, [action.clazz]: clazz}

    default:
      return state
  }
}

