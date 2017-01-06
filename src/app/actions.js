
export const AppActions = {
  RESET_TO_DATABASE: "RESET_TO_DATABASE"
}

export function resetToDatabase(database) {
  return {
    type: AppActions.RESET_TO_DATABASE,
    database: database
  }
}

