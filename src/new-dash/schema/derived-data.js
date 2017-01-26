import { Map } from "immutable"
import { createSelector } from "reselect"

import { nestedDatabaseNodeIn } from "./path"
import { selectedDatabasePath } from "../router"

const schema = (state) => state.get("schema")
const getAll = (node) => (tree) => tree.getIn([node, "byName"], Map()).keySeq()

export const selectedDatabase = createSelector(
  [schema, selectedDatabasePath],
  (schema, path) => schema.getIn(nestedDatabaseNodeIn(path), Map())
)

export const subDatabasesInSelectedDatabase = createSelector([selectedDatabase], getAll("databases"))
export const classesInSelectedDatabase = createSelector([selectedDatabase], getAll("classes"))
export const indexesInSelectedDatabase = createSelector([selectedDatabase], getAll("indexes"))
