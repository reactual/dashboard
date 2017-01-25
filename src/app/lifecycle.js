const Actions = {
  RESTORE: "@@lifecycle/RESTORE"
}

export function restoringSession(restoring) {
  return {
    type: Actions.RESTORE,
    restoring
  }
}

export function reduceLifecycle(state = null, action) {
  switch (action.type) {
    case Actions.RESTORE:
      return {restoring : action.restoring}

    default:
      return state
  }
}
