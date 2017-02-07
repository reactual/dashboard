import Immutable from "immutable"

import {
  selectedDatabase,
  subDatabasesInSelectedDatabase,
  classesInSelectedDatabase,
  indexesInSelectedDatabase
} from "../"

const schemaTree = Immutable.fromJS({
  info: {
    name: "/"
  },
  databases: {
    byName: {
      "my-app": {
        info: {
          name: "my-app",
        },
        databases: {
          byName: {
            "my-blog": Immutable.fromJS({
              info: {
                name: "my-blog"
              },
              classes: {
                byName: {
                  "people": { name: "people" },
                  "users": { name: "users" }
                }
              },
              indexes: {
                byName: {
                  "all_people": { name: "all_people" },
                  "all_users": { name: "all_users" }
                }
              }
            })
          }
        }
      }
    }
  }
})

describe("selectedDatabase", () => {
  describe("when there is a database selected", () => {
    const state = Immutable.fromJS({
      schema: schemaTree,
      router: {
        database: ["my-app", "my-blog"]
      }
    })

    const database = selectedDatabase(state).toJS()

    it("contains database path", () => expect(database.path).toEqual(["my-app", "my-blog"]))
    it("contains database url", () => expect(database.url).toEqual("/my-app/my-blog"))
    it("contains database name", () => expect(database.name).toEqual("my-blog"))

    it("contains database classes", () => {
      expect(database.classes).toEqual([
        { name: "people", url: "/my-app/my-blog/classes/people" },
        { name: "users", url: "/my-app/my-blog/classes/users" }
      ])
    })

    it("contains database indexes", () => {
      expect(database.indexes).toEqual([
        { name: "all_people", url: "/my-app/my-blog/indexes/all_people" },
        { name: "all_users", url: "/my-app/my-blog/indexes/all_users" }
      ])
    })
  })

  describe("when there is NO database selected", () => {
    const state = Immutable.fromJS({
      schema: schemaTree,
      router: {
        database: []
      }
    })

    const database = selectedDatabase(state).toJS()

    it("contains emtpy database path", () => expect(database.path).toEqual([]))
    it("contains root url", () => expect(database.url).toEqual("/"))
    it("contains root db name", () => expect(database.name).toEqual("/"))
    it("contains no classes", () => expect(database.classes).toEqual([]))
    it("contains no indexes", () =>  expect(database.indexes).toEqual([]))
  })
})

describe("subDatabasesInSelectedDatabase", () => {
  it("returns a list of sub databases", () => {
    const state = Immutable.fromJS({
      schema: schemaTree,
      router: {
        database: ["my-app"]
      }
    })

    expect(subDatabasesInSelectedDatabase(state).toJS())
      .toEqual(["my-blog"])
  })

  it("returns empty list when no selected database", () => {
    const state = Immutable.fromJS({
      schema: schemaTree,
      router: {
        database: ["not-loaded"]
      }
    })

    expect(subDatabasesInSelectedDatabase(state).toJS())
      .toEqual([])
  })
})

describe("classesInSelectedDatabase", () => {
  it("returns a list of selected classes", () => {
    const state = Immutable.fromJS({
      schema: schemaTree,
      router: {
        database: ["my-app", "my-blog"]
      }
    })

    expect(classesInSelectedDatabase(state).toJS())
      .toEqual(["people", "users"])
  })

  it("returns empty list when no selected database", () => {
    const state = Immutable.fromJS({
      schema: schemaTree,
      router: {}
    })

    expect(classesInSelectedDatabase(state).toJS())
      .toEqual([])
  })
})

describe("indexesInSelectedDatabase", () => {
  it("returns a list of selected indexes", () => {
    const state = Immutable.fromJS({
      schema: schemaTree,
      router: {
        database: ["my-app", "my-blog"]
      }
    })

    expect(indexesInSelectedDatabase(state).toJS())
      .toEqual(["all_people", "all_users"])
  })

  it("returns empty list when no selected database", () => {
    const state = Immutable.fromJS({
      schema: schemaTree,
      router: {}
    })

    expect(indexesInSelectedDatabase(state).toJS())
      .toEqual([])
  })
})
