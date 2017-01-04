
/*
  Shape of data

  classes: {
    byName: {
      "class-0": {},
      "class-1": {}
    },
    indexes: {
      "class-0": ["index-0", "index-1"],
      "class-1": ["index-1"]
    },
    selectedClass: "class-0",
    fecthingData: true
  }
  
*/

export function reduceClasses(state = {}, action) {
  switch(action.type) {
    case "UPDATE_CLASS_INFO": {
      var byName = state.byName

      action.result.forEach(clazz => {
        byName = {...byName,
          [clazz.name]: {
            classInfo: clazz
          }
        }
      })
      return {...state, byName: byName}
    }

    case "UPDATE_SELECTED_CLASS":
      return {...state, selectedClass: action.name}

    case "UPDATE_INDEX_OF_CLASS": {
      const indexes = {...state.indexes, [action.clazz]: [...action.indexes]}
      return {...state, indexes: indexes}
    }

    case "FETCHING_CLASSES":
      return {...state, fetchingData: action.fetching}

    default:
      return state
  }
}

