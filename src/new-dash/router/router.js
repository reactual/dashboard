import Immutable, { Map } from "immutable"

const Actions = {
  UPDATE_SELECTED: "@@router/UPDATE_SELECTED"
}

export const updateSelected = (databasePath, resourceType, resourceName) => (dispatch) => {
  const resource = Immutable.fromJS({
    database: (databasePath && databasePath.split("/")) || []
  })

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
