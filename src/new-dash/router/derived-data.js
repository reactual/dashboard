import { Map, List } from "immutable"
import { createSelector } from "reselect"

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
