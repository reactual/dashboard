import { Map } from "immutable"
import { createSelector } from "reselect"

import { nestedDatabaseNodeIn } from "./path"
import { selectedDatabasePath, selectedResource, buildUrl } from "../router"

const schema = (state) => state.get("schema")
const getAll = (node) => (tree) => tree.getIn([node, "byName"], Map()).keySeq()

const database = createSelector(
  [schema, selectedDatabasePath],
  (schema, path) => schema.getIn(nestedDatabaseNodeIn(path), Map())
)

export const subDatabasesInSelectedDatabase = createSelector([database], getAll("databases"))
export const classesInSelectedDatabase = createSelector([database], getAll("classes"))
export const indexesInSelectedDatabase = createSelector([database], getAll("indexes"))

const database0 = createSelector(
  [selectedResource],
  resource => resource.get("database")
)

const extract = (node, db, url) => {
  return db.getIn([node, "byName"], Map()).toList().map(instance => {
    const name = instance.get("name", "")
    return Map.of(
      "name", name,
      "url", buildUrl(url, node, name)
    )
  })
}

export const selectedDatabase = createSelector([schema, database0], (schema, selected) => {
  const path = selected.get("path")
  const url = selected.get("url")
  const db = schema.getIn(nestedDatabaseNodeIn(path), Map())

  return Map.of(
    "path", path,
    "url", url,
    "name", db.getIn(["info", "name"]),
    "classes", extract("classes", db, url),
    "indexes", extract("indexes", db, url)
  )
})

export const databaseTree = createSelector([schema], schema => {
  const buildTree = (node, parentUrl = "/") => {
    const name = node.getIn(["info", "name"])
    const url = buildUrl(parentUrl, name)

    return Map.of(
      "url", url,
      "name", name,
      "databases", node.getIn(["databases", "byName"], Map()).toList().map(
        db => buildTree(db, url)
      )
    )
  }

  return buildTree(schema)
})
