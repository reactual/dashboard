import { Map, List } from "immutable"

const Actions = {
  UPDATE_SELECTED: "@@router/UPDATE_SELECTED"
}

export const updateSelected = (databasePath) => (dispatch) => {
  const path = List((databasePath && databasePath.split("/")) || [])
  const resource = Map({ database: path.filter(elem => elem.trim()) })

  dispatch({
    type: Actions.UPDATE_SELECTED,
    resource
  })

  return resource
}

export const reduceRouter = (state = Map(), action) => {
  switch (action.type) {
    case Actions.UPDATE_SELECTED:
      return state.set("selectedResource", action.resource)

    default:
      return state
  }
}
