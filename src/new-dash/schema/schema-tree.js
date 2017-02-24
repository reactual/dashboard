import Immutable, { Map, List } from "immutable"
import { query as q } from "faunadb"

import { KeyType } from "../persistence/faunadb-wrapper"
import { nestedDatabaseNodeIn } from "./path"

const Actions = {
  LOAD: "@@schema/LOAD",
  UPDATE: "@@schema/UPDATE",
  DELETE: "@@schema/DELETE"
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

const getInstancesOf = (resource, cursor) => q.Map(
  // If cursor is null, remove it from the query
  q.Paginate(q.Ref(resource), { after: cursor || undefined }),
  ref => q.Get(ref)
)

const queryForSubDatabases = (client, dbPath, dbCursor = null) => {
  return client.queryWithPrivilegesOrElse(dbPath, KeyType.ADMIN, {}, {
    databases: getInstancesOf("databases", dbCursor)
  })
}

const queryForDatabaseResources = (client, dbPath) => {
  const buildQueryForCursors = cursors => {
    const query = {}

    for (let key in cursors)
      if (cursors[key] !== undefined)
        query[key] = getInstancesOf(key, cursors[key])

    return query
  }

  const queryWithCursors = (cursors, callback) => {
    const query = buildQueryForCursors(cursors)
    if (Object.keys(query).length === 0) return null

    return client
      .queryWithPrivilegesOrElse(dbPath, KeyType.SERVER, {}, query)
      .then(callback)
  }

  const paginateResponse = (results = {}) => response => {
    const cursors = {}

    for (let key in response) {
      if (!response.hasOwnProperty(key)) continue
      const data = (results[key] && results[key].data) || []
      results[key] = { data: data.concat(response[key].data) }
      cursors[key] = response[key].after
    }

    return queryWithCursors(cursors, paginateResponse(results)) || results
  }

  return queryWithCursors({
    classes: null,
    indexes: null
  }, paginateResponse())
}

const queryForSchema = (client, dbPath) => {
  return Promise.all([
    queryForSubDatabases(client, dbPath),
    queryForDatabaseResources(client, dbPath)
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
      type: Actions.LOAD,
      database: toDatabase(info, true, result),
      dbPath: List(dbPath),
      nodePath
    })
  )
}

export const loadMoreDatabases = (client, dbPath, cursor) => (dispatch, getState) => {
  const nodePath = nestedDatabaseNodeIn(dbPath)
  const dbNode = getState().get("schema").getIn(nodePath)

  return queryForSubDatabases(client, dbPath, cursor).then(
    result => dispatch({
      type: Actions.LOAD,
      database: toDatabase(dbNode.get("info"), dbNode.get("loaded"), result),
      dbPath: List(dbPath),
      nodePath
    })
  )
}

const create = (nodeToUpdate, keyType, createQuery, mapper = x => x) => (client, dbPath, config) => (dispatch) => {
  return client.query(dbPath, keyType, createQuery(config)).then(
    instance => {
      dispatch({
        type: Actions.UPDATE,
        path: nestedDatabaseNodeIn(dbPath, [nodeToUpdate, "byName", instance.name]),
        data: mapper(instance)
      })
      return instance
    }
  )
}

export const createDatabase = create("databases", KeyType.ADMIN, q.CreateDatabase, toDatabase)
export const createClass = create("classes", KeyType.SERVER, q.CreateClass)
export const createIndex = create("indexes", KeyType.SERVER, q.CreateIndex)

const remove = (nodeToUpdate, keyType, refConstructor) => (client, path, name) => (dispatch) => {
  return client.query(path, keyType, q.Delete(refConstructor(name))).then(
    () => dispatch({
      type: Actions.DELETE,
      nodePath: nestedDatabaseNodeIn(path, [nodeToUpdate, "byName", name])
    })
  )
}

export const deleteDatabase = remove("databases", KeyType.ADMIN, q.Database)
export const deleteClass = remove("classes", KeyType.SERVER, q.Class)
export const deleteIndex = remove("indexes", KeyType.SERVER, q.Index)

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

export const reduceSchemaTree = (state = Map.of("info", Map.of("name", "/")), action) => {
  switch (action.type) {
    case Actions.LOAD:
      return ensureTreeInfo(state, action.dbPath)
        .mergeDeepIn(action.nodePath, action.database)

    case Actions.UPDATE:
      return state.mergeDeepIn(action.path, action.data)

    case Actions.DELETE:
      return state.deleteIn(action.nodePath)

    default:
      return state
  }
}
