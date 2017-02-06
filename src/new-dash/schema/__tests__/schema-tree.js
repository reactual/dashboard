import Immutable, { Map } from "immutable"
import { query as q } from "faunadb"

import {
  loadSchemaTree,
  createDatabase,
  createClass,
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
      name: "/"
    },
    loaded: true,
    databases: {
      byName: {
        "my-app": {
          info: {
            name: "my-app",
            ref: q.Ref("databases/my-app"),
            ts: 123
          },
          loaded: false,
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
        name: "people",
        ref: q.Ref("classes/people"),
        ts: 11
      }]
    },
    indexes: {
      data: []
    }
  },
  schemaTree: Immutable.fromJS({
    info: {
      name: "my-app",
      ref: q.Ref("databases/my-app"),
      ts: 123
    },
    loaded: true,
    databases: {},
    classes: {
      byName: {
        "people": {
          name: "people",
          ref: q.Ref("classes/people"),
          ts: 11
        },
      },
      cursor: null
    },
    indexes: {}
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
          subDatabase.schemaTree.set("info", Map.of("name", "my-blog"))
        )
        .toJS()
      )
    })
  })

  it("should not load a database twice", () => {
    faunaClient.queryWithPrivilegesOrElse.mockReturnValue(
      Promise.resolve(subDatabase.serverKeyResponse)
    )

    const loadMyApp = () => store.dispatch(loadSchemaTree(faunaClient, ["my-app"]))

    return loadMyApp().then(() => {
      return loadMyApp().then(() => {
        // One with admin and one with server key
        expect(faunaClient.queryWithPrivilegesOrElse).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe("when schema tree is already loaded", () => {
    beforeEach(() => {
      store = store.withInitialState({
        schema: rootDatabase.schemaTree
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
              loaded: false,
              databases: {},
              classes: {},
              indexes: {}
            })
          ).toJS()
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

    xit("should be able to create a new index", () => {})
  })
})
