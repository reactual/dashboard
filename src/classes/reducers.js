
export function reduceClasses(state = {}, action) {
  switch(action.type) {
    case "UPDATE_CLASS_INFO": {
      var classes = state[action.database] || {}

      action.result.forEach(clazz => {
        classes = {...classes,
          [clazz.name]: {
            classInfo: clazz,
            scopedClient: action.scopedClient
          }
        }
      })

      return {...state, [action.database]: classes}
    }

    case "UPDATE_SELECTED_CLASS": {
      const classes = {...state[action.database], selectedClass: action.name}
      return {...state, [action.database]: classes}
    }

    case "UPDATE_INDEX_OF_CLASS": {
      const indexes = [...action.indexes]
      const clazz = {...state[action.database][action.clazz], indexes: indexes}
      const classes = {...state[action.database], [action.clazz]: clazz}
      return {...state, [action.database]: classes}
    }

    default:
      return state
  }
}

