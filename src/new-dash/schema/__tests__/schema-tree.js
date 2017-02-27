import Immutable, { Map } from "immutable"
import { query as q } from "faunadb"

import {
  loadSchemaTree,
  loadDatabases,
  createDatabase,
  deleteDatabase,
  createClass,
  deleteClass,
  createIndex,
  deleteIndex,
  reduceSchemaTree
} from "../"

import { KeyType } from "../../persistence/faunadb-wrapper"

const rootDatabase = {
  adminKeyResponse: {
    databases: {
      data: [{
        name: "my-app",
        ref: q.Ref("databases/my-app"),
        ts: 123
      }],
      after: "database-cursor"
    }
  },
  serverKeyResponse: {
    classes: {
      data: [{
        name: "people",
        ref: q.Ref("classes/people"),
        ts: 11
      }],
      cursor: "class-cursor"
    },
    indexes: {
      data: [{
        name: "all_people",
        ref: q.Ref("indexes/all_people"),
        ts: 22
      }],
      cursor: "index-cursor"
    }
  },
  schemaTree: Immutable.fromJS({
    info: {
      name: "/",
      schemaLoaded: true,
      databasesLoaded: true
    },
    databases: {
      byName: {
        "my-app": {
          info: {
            name: "my-app",
            ref: q.Ref("databases/my-app"),
            ts: 123
          },
          databases: {},
          classes: {},
          indexes: {}
        }
      },
      cursor: "database-cursor"
    },
    classes: {
      byName: {
        "people": {
          name: "people",
          ref: q.Ref("classes/people"),
          ts: 11
        }
      },
      cursor: null
    },
    indexes: {
      byName: {
        "all_people": {
          name: "all_people",
          ref: q.Ref("indexes/all_people"),
          ts: 22
        }
      },
      cursor: null
    }
  })
}

const subDatabase = {
  serverKeyResponse: {
    classes: {
      data: [{
        name: "users",
        ref: q.Ref("classes/users"),
        ts: 11
      }]
    },
    indexes: {
      data: [{
        name: "all_users",
        ref: q.Ref("indexes/all_users"),
        source: q.Ref("classes/users"),
        ts: 12
      }]
    }
  },
  schemaTree: Immutable.fromJS({
    info: {
      name: "my-app",
      ref: q.Ref("databases/my-app"),
      ts: 123,
      schemaLoaded: true,
      databasesLoaded: true
    },
    databases: {},
    classes: {
      byName: {
        "users": {
          name: "users",
          ref: q.Ref("classes/users"),
          ts: 11
        },
      },
      cursor: null
    },
    indexes: {
      byName: {
        "all_users": {
          name: "all_users",
          source: q.Ref("classes/users"),
          ref: q.Ref("indexes/all_users"),
          ts: 12
        },
      },
      cursor: null
    }
  })
}

describe("Given a schema tree store", () => {
  let store, schema, faunaClient

  beforeEach(() => {
    store = createImmutableTestStore({
      schema: reduceSchemaTree
    })(state => schema = state.get("schema").toJS())

    faunaClient = {
      query: jest.fn(),
      queryWithPrivilegesOrElse: jest.fn(),
      hasPrivileges: jest.fn(() => true)
    }
  })

  it("should load schema tree at root", () => {
    faunaClient.queryWithPrivilegesOrElse.mockImplementation((path, keyType, query) => {
      if (keyType === KeyType.ADMIN) return Promise.resolve(rootDatabase.adminKeyResponse)
      if (keyType === KeyType.SERVER) return Promise.resolve(rootDatabase.serverKeyResponse)
      return Promise.reject()
    })

    return store.dispatch(loadSchemaTree(faunaClient)).then(() => {
      expect(schema).toEqual(rootDatabase.schemaTree.toJS())
    })
  })

  it("should load deep nested databases", () => {
    faunaClient.queryWithPrivilegesOrElse.mockReturnValue(
      Promise.resolve(subDatabase.serverKeyResponse)
    )

    return store.dispatch(loadSchemaTree(faunaClient, ["my-app", "my-blog"])).then(() => {
      expect(schema).toEqual(
        Immutable.fromJS({
          info: { name: "/" }
        })
        .setIn(
          ["databases", "byName", "my-app", "info"],
          Map.of("name", "my-app")
        )
        .setIn(
          ["databases", "byName", "my-app", "databases", "byName", "my-blog"],
          subDatabase.schemaTree.set("info", Map.of(
            "name", "my-blog",
            "databasesLoaded", true,
            "schemaLoaded", true
          ))
        )
        .toJS()
      )
    })
  })

  describe("when the root database is already loaded", () => {
    beforeEach(() => {
      store = store.withInitialState({
        schema: rootDatabase.schemaTree
      })
    })

    it("should not load the same database again", () => {
      return store.dispatch(loadSchemaTree(faunaClient, [])).then(() => {
        expect(faunaClient.queryWithPrivilegesOrElse).not.toHaveBeenCalled()
      })
    })

    it("should be able to load a sub-database", () => {
      faunaClient.queryWithPrivilegesOrElse.mockReturnValue(
        Promise.resolve(subDatabase.serverKeyResponse)
      )

      return store.dispatch(loadSchemaTree(faunaClient, ["my-app"])).then(() => {
        expect(schema).toEqual(
          rootDatabase.schemaTree
          .setIn(["databases", "byName", "my-app"], subDatabase.schemaTree)
          .toJS()
        )
      })
    })

    it("should be able to load a more databases", () => {
      faunaClient.queryWithPrivilegesOrElse.mockReturnValue(
        Promise.resolve({
          databases: {
            data: [{
              name: "another-db"
            }]
          }
        })
      )

      return store.dispatch(loadDatabases(faunaClient, [], "database-cursor")).then(() => {
        expect(schema).toEqual(
          rootDatabase.schemaTree
            .setIn(["databases", "byName", "another-db"], {
              info: { name: "another-db" },
              databases: {},
              classes: {},
              indexes: {}
            })
            .setIn(["databases", "cursor"], null)
            .toJS()
        )
      })
    })

    it("should not load databases if cursor is new and databases are already loaded", () => {
      return store.dispatch(loadDatabases(faunaClient, [], null)).then(() => {
        expect(faunaClient.queryWithPrivilegesOrElse).not.toHaveBeenCalled()
      })
    })

    it("should be able to create a new database", () => {
      faunaClient.query.mockReturnValue(Promise.resolve({
        name: "new-db"
      }))

      return store.dispatch(createDatabase(faunaClient, [], { name: "new-db" })).then(() => {
        expect(schema).toEqual(
          rootDatabase.schemaTree.setIn(
            ["databases", "byName", "new-db"],
            Immutable.fromJS({
              info: {
                name: "new-db"
              },
              databases: {},
              classes: {},
              indexes: {}
            })
          ).toJS()
        )
      })
    })

    it("should be able to delete a database", () => {
      faunaClient.query.mockReturnValue(Promise.resolve())

      return store.dispatch(deleteDatabase(faunaClient, [], "my-app")).then(() => {
        expect(schema).toEqual(
          rootDatabase.schemaTree
            .removeIn(["databases", "byName", "my-app"])
            .toJS()
        )
      })
    })

    it("should be able to create a new class", () => {
      faunaClient.query.mockReturnValue(Promise.resolve({
        name: "new-class"
      }))

      return store.dispatch(createClass(faunaClient, ["my-app"], { name: "new-class" })).then(() => {
        expect(schema).toEqual(
          rootDatabase.schemaTree.setIn(
            ["databases", "byName", "my-app", "classes", "byName", "new-class"],
            Immutable.fromJS({
              name: "new-class"
            })
          ).toJS()
        )
      })
    })

    it("should be able to delete a class", () => {
      faunaClient.query.mockReturnValue(Promise.resolve())

      return store.dispatch(deleteClass(faunaClient, [], "people")).then(() => {
        expect(schema).toEqual(
          rootDatabase.schemaTree
            .removeIn(["classes", "byName", "people"])
            .toJS()
        )
      })
    })

    it("should be able to create a new index", () => {
      faunaClient.query.mockReturnValue(Promise.resolve({
        name: "new-index"
      }))

      return store.dispatch(createIndex(faunaClient, ["my-app"], { name: "new-index" })).then(() => {
        expect(schema).toEqual(
          rootDatabase.schemaTree.setIn(
            ["databases", "byName", "my-app", "indexes", "byName", "new-index"],
            Immutable.fromJS({
              name: "new-index"
            })
          ).toJS()
        )
      })
    })

    it("should be able to delete an index", () => {
      faunaClient.query.mockReturnValue(Promise.resolve())

      return store.dispatch(deleteIndex(faunaClient, [], "all_people")).then(() => {
        expect(schema).toEqual(
          rootDatabase.schemaTree
            .removeIn(["indexes", "byName", "all_people"])
            .toJS()
        )
      })
    })
  })
})
