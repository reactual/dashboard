import { Map, List } from "immutable"

const Actions = {
  UPDATE_SELECTED: "@@router/UPDATE_SELECTED"
}

export const updateSelectedResource = ({ splat }) => (dispatch) => {
  const path = List((splat && splat.split("/")) || [])
  const resource = Map({ database: path.filter(elem => elem.trim()) })

  dispatch({
    type: Actions.UPDATE_SELECTED,
    resource
  })

  return resource
}

export const reduceRouter = (state = Map(), action) => {
  switch (action.type) {
    case Actions.UPDATE_SELECTED: return action.resource
    default:                      return state
  }
}
