import { Map, List } from "immutable"
import { createSelector } from "reselect"

export const selectedDatabasePath = (state) =>
  state.getIn(["router", "database"], List())

export const selectedDatabaseUrl = createSelector(
  [selectedDatabasePath],
  path => {
    const url = path.join("/")
    return url ? `/${url}` : ""
  }
)

const databasePath = state => state.getIn(["router", "database"], List())

export const selectedResource = createSelector([databasePath], path => {
  return Map.of(
    "database", Map.of(
      "path", path,
      "url", `/${path.join("/")}`
    )
  )
})

export const buildUrl = (parentUrl, ...parts) => {
  const url = parts.join("/")
  if (url === "/") return parentUrl
  if (parentUrl === "/") return `/${url}`

  return `${parentUrl}/${url}`
}
