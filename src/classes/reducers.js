
export function reduceClasses(state = {}, action) {
  switch(action.type) {
    case "UPDATE_CLASS_INFO":
      return Object.assign({}, state, {
        selectedClass: action.result.name,
        [action.result.name]: {
          classInfo: action.result,
          scopedClient: action.scopedClient
        }
      })

    default:
      return state
  }
}

