import { List } from "immutable"

export const NotificationType = {
  SUCCESS: "success",
  ERROR: "error"
}

const DEFAULT_NOTIFICATION_TIMEOUT = 5000

const Actions = {
  PUSH: "@@notifications/PUSH",
  REMOVE: "@@notifications/REMOVE"
}

const push = (dispatch, type, message) => {
  const notification = { type, message }

  dispatch({
    type: Actions.PUSH,
    notification
  })

  setTimeout(
    () => dispatch({
      type: Actions.REMOVE,
      notification
    }),
    DEFAULT_NOTIFICATION_TIMEOUT
  )
}

export const watchForError = (message, action) => (dispatch) => {
  let res

  try {
    res = dispatch(action)
  } catch (error) {
    res = Promise.reject(error)
  }

  return res.catch(error => {
    push(dispatch, NotificationType.ERROR, `${message ? message + ". " : ""}${error}`)
    throw error
  })
}

export const notify = (message, action) => (dispatch) => {
  return watchForError(null, action)(dispatch).then(result => {
    push(dispatch, NotificationType.SUCCESS, message)
    return result
  })
}

export const reduceNotifications = (state = List(), action) => {
  switch (action.type) {
    case Actions.PUSH:
      return state.push(action.notification)

    case Actions.REMOVE:
      return state.filterNot(
        notification => notification === action.notification
      )

    default:
      return state
  }
}
