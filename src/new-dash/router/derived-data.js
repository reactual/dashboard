import { Seq } from "immutable"
import { createSelector } from "reselect"

export const selectedDatabasePath = (state) =>
  state.getIn(["router", "database"], Seq())

export const selectedDatabaseUrl = createSelector(
  [selectedDatabasePath],
  path => {
    const url = path.join("/")
    return url ? `/${url}` : ""
  }
)
