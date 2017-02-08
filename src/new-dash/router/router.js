import { Map, List } from "immutable"

const Actions = {
  UPDATE_SELECTED: "@@router/UPDATE_SELECTED"
}

const resourceFor = (className) => {
  if (className) return Map.of("type", "classes", "name", className)
  return null
}

export const updateSelectedResource = ({ splat, className } = {}) => (dispatch) => {
  const path = List((splat && splat.split("/")) || []).filter(elem => elem.trim())

  const resource = Map.of(
    "database", path,
    "resource", resourceFor(className)
  )

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
