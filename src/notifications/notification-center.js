import { Map, List } from "immutable"

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
  const notification = Map.of("type", type, "message", message)

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

const buildErrorMessage = (message, error) => {
  let result = `${message ? message + ". " : ""}${error}`

  if (error.errors) {
    error.errors().forEach(err => {
      result += `\n\n> ${err.description}`

      if (err.failures) {
        err.failures.forEach(failure => {
          result += `\n  - (${failure.field.join(".")}): ${failure.description}`
        })
      }
    })
  }

  return result
}


export const watchForError = (message, action) => (dispatch) => {
  let res

  try {
    res = dispatch(action)
  } catch (error) {
    res = Promise.reject(error)
  }

  return res.catch(error => {
    push(dispatch, NotificationType.ERROR, buildErrorMessage(message, error))
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
