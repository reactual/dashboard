import { Map } from "immutable"

const Actions = {
  LOCK: "@@lock/LOCK",
  UNLOCK: "@@lock/UNLOCK"
}

const isLocked = (getState) => getState().getIn(["lock", "isLocked"])

const acquireLock = (dispatch, getState) => {
  if (!isLocked(getState)) {
    dispatch({
      type: Actions.LOCK
    })
  }
}

const releaseLock = (dispatch, getState) => {
  if (isLocked(getState)) {
    dispatch({
      type: Actions.UNLOCK
    })
  }
}

export const withLock = (action) => (dispatch, getState) => {
  acquireLock(dispatch, getState)

  return dispatch(action).then(result => {
    releaseLock(dispatch, getState)
    return result
  }).catch(error => {
    releaseLock(dispatch, getState)
    throw error
  })
}

export const reduceLock = (state = Map.of("isLocked", false), action) => {
  switch (action.type) {
    case Actions.LOCK:   return state.set("isLocked", true)
    case Actions.UNLOCK: return state.set("isLocked", false)
    default:             return state
  }
}
