import { Map, List } from "immutable"
import { createSelector } from "reselect"

import { nestedDatabaseNodeIn } from "./path"
import { selectedResource, buildUrl, linkForRef } from "../router"

const schema = (state) => state.get("schema")
const database = createSelector([selectedResource], resource => resource.get("database"))
const resource = createSelector([selectedResource], resource => resource.get("resource") || Map())

const extract = (node, db, url) => {
  return db.getIn([node, "byName"], Map()).toList().map(instance => {
    const name = instance.get("name")
    return Map.of(
      "name", name,
      "url", buildUrl(url, node, name)
    )
  })
}

export const selectedDatabase = createSelector([schema, database], (schema, database) => {
  const path = database.get("path")
  const url = database.get("url")
  const db = schema.getIn(nestedDatabaseNodeIn(path), Map())

  return Map.of(
    "path", path,
    "url", url,
    "name", db.getIn(["info", "name"]),
    "classes", extract("classes", db, url),
    "indexes", extract("indexes", db, url)
  )
})

export const selectedClass = createSelector([schema, database, resource], (schema, database, resource) => {
  const clazz = schema.getIn(
    nestedDatabaseNodeIn(
      database.get("path"),
      ["classes", "byName", resource.get("name")]
    ),
    Map()
  )

  const indexes = schema.getIn(
    nestedDatabaseNodeIn(
      database.get("path"),
      ["indexes", "byName"]
    ),
    Map()
  ).toList()

  const coveringIndexes = indexes
    .filter(
      index => index.get("source").equals(clazz.get("ref"))
    )
    .map(
      index => Map.of(
        "name", index.get("name"),
        "url", buildUrl(database.get("url"), "indexes", index.get("name"))
      )
    )

  return Map.of(
    "name", clazz.get("name", ""),
    "ref", clazz.get("ref", null),
    "ttlDays", clazz.get("ttl_days", null),
    "historyDays", clazz.get("history_days", null),
    "indexes", coveringIndexes
  )
})

export const selectedIndex = createSelector([schema, database, resource], (schema, database, resource) => {
  const index = schema.getIn(
    nestedDatabaseNodeIn(
      database.get("path"),
      ["indexes", "byName", resource.get("name")]
    ),
    Map()
  )

  return Map.of(
    "name", index.get("name", ""),
    "active", index.get("active", false),
    "unique", index.get("unique", false),
    "partitions", index.get("partitions", null),
    "source", linkForRef(database.get("url"), index.get("source")),
    "terms", index.get("terms", List()).map(term => term.get("field").join(".")),
    "values", index.get("values", List()).map(term => term.get("field").join("."))
  )
})

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

export const databaseTree = createSelector([schema], schema => {
  return buildTree(schema)
})
