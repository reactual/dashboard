import { Map, List } from "immutable"
import { createSelector } from "reselect"

import { buildUrl } from "."

const databasePath = state => state.getIn(["router", "database"], List())
const resource = state => state.getIn(["router", "resource"])

export const selectedResource = createSelector([databasePath, resource], (path, resource) => {
  const url = `/${path.join("/")}`

  return Map.of(
    "database", Map.of(
      "path", path,
      "url", url
    ),
    "resource", resource && Map.of(
      "url", buildUrl(url, resource.get("type"), resource.get("name")),
      "name", resource.get("name"),
      "type", resource.get("type")
    )
  )
})
