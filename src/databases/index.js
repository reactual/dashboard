
const Actions = {
  UPDATE: "@@databases/UPDATE"
}

export function updateCurrentDatabase(currentDatabase) {
  return {
    type: Actions.UPDATE,
    currentDatabase: currentDatabase.replace(/^db\//, "").split("/")
  }
}

export function reduceDatabases(state = [], action) {
  switch(action.type) {
    case Actions.UPDATE:
      return action.currentDatabase

    default:
      return state
  }
}

