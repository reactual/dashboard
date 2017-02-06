import Immutable, { Map, List } from "immutable"
import { query as q } from "faunadb"

import { KeyType } from "../persistence/faunadb-wrapper"
import { nestedDatabaseNodeIn } from "./path"

const Actions = {
  LOAD_DATABASE: "@@schema/LOAD_DATABASE",
  UPDATE: "@@schema/UPDATE"
}

const toPage = (result, mapper = x => Immutable.fromJS(x)) => {
  if (!result || !result.data || result.data.length === 0)
    return Map()

  return Map({
    cursor: result.after || null,
    byName: List(result.data).reduce(
      (acc, elem) => acc.set(elem.name, mapper(elem)),
      Map()
    )
  })
}

const toDatabase = (info, loaded = false, result = {}) => {
  return Map({
    info: Map(info),
    databases: toPage(result.databases, toDatabase),
    classes: toPage(result.classes),
    indexes: toPage(result.indexes),
    loaded
  })
}

const getInstancesOf = (resource) => q.Map(
  q.Paginate(q.Ref(resource)),
  ref => q.Get(ref)
)

const queryForSchema = (client, dbPath) => {
  return Promise.all([
    client.queryWithPrivilegesOrElse(dbPath, KeyType.ADMIN, {}, {
      databases: getInstancesOf("databases")
    }),
    client.queryWithPrivilegesOrElse(dbPath, KeyType.SERVER, {}, {
      classes: getInstancesOf("classes"),
      indexes: getInstancesOf("indexes")
    })
  ]).then(
    results => ({
      ...results[0],
      ...results[1]
    })
  )
}

export const loadSchemaTree = (client, dbPath = []) => (dispatch, getState) => {
  const nodePath = nestedDatabaseNodeIn(dbPath)
  const dbNode = getState().get("schema").getIn(nodePath, Map())
  const info = dbNode.get("info", Map.of("name", nodePath.last() || "/"))

  if (dbNode.get("loaded", false))
    return Promise.resolve()

  return queryForSchema(client, dbPath).then(
    result => dispatch({
      type: Actions.LOAD_DATABASE,
      database: toDatabase(info, true, result),
      dbPath: List(dbPath),
      nodePath
    })
  )
}

const create = (keyType, createQuery, nodeToUpdate, mapper = x => x) => (client, dbPath, config) => (dispatch) => {
  return client.query(dbPath, keyType, createQuery(config)).then(
    instance => dispatch({
      type: Actions.UPDATE,
      path: nestedDatabaseNodeIn(dbPath, [nodeToUpdate, "byName", instance.name]),
      data: mapper(instance)
    })
  )
}

export const createDatabase = create(KeyType.ADMIN, q.CreateDatabase, "databases", toDatabase)
export const createClass = create(KeyType.SERVER, q.CreateClass, "classes")

const ensureTreeInfo = (tree, path) => {
  if (path.isEmpty()) return tree
  const infoPath = nestedDatabaseNodeIn(path, "info")

  if (!tree.hasIn(infoPath)) {
    return ensureTreeInfo(
      tree.setIn(infoPath, Map.of("name", path.last())),
      path.butLast()
    )
  }

  return ensureTreeInfo(tree, path.butLast())
}

const initialSchemaTree = Map.of("info", Map.of("name", "/"))

export const reduceSchemaTree = (state = initialSchemaTree, action) => {
  switch (action.type) {
    case Actions.LOAD_DATABASE:
      return ensureTreeInfo(state, action.dbPath)
        .mergeDeepIn(action.nodePath, action.database)

    case Actions.UPDATE:
      return state.mergeDeepIn(action.path, action.data)

    default:
      return state
  }
}
