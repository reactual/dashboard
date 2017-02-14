import Immutable from "immutable"
import { query as q } from "faunadb"

import {
  selectedDatabase,
  selectedClass,
  selectedIndex,
  databaseTree
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
            "my-blog": {
              info: {
                name: "my-blog"
              },
              classes: {
                byName: {
                  "people": {
                    name: "people",
                    ref: q.Ref("classes/people"),
                    history_days: 10,
                    ttl_days: 1
                  },
                  "users": { name: "users" }
                }
              },
              indexes: {
                byName: {
                  "all_people": {
                    name: "all_people",
                    source: q.Ref("classes/people")
                  },
                  "all_users": {
                    name: "all_users",
                    source: q.Ref("classes/users")
                  },
                  "people_by_name": {
                    ref: q.Ref("indexes/people_by_name"),
                    name: "people_by_name",
                    source: q.Ref("classes/people"),
                    unique: false,
                    active: true,
                    partitions: 8,
                    values: [
                      { field: [ "data", "name" ], transform: "casefold" },
                      { field: [ "ref" ] },
                    ],
                    terms: [
                      { field: [ "data", "name" ], transform: "casefold" }
                    ]
                  }
                }
              }
            }
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
        { name: "all_users", url: "/my-app/my-blog/indexes/all_users" },
        { name: "people_by_name", url: "/my-app/my-blog/indexes/people_by_name" }
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

describe("selectedClass", () => {
  it("returns the selected class", () => {
    const state = Immutable.fromJS({
      schema: schemaTree,
      router: {
        database: ["my-app", "my-blog"],
        resource: {
          type: "classes",
          name: "people"
        }
      }
    })

    expect(selectedClass(state).toJS()).toEqual({
      name: "people",
      historyDays: 10,
      ttlDays: 1,
      ref: q.Ref("classes/people"),
      indexes: [
        { name: "all_people", url: "/my-app/my-blog/indexes/all_people" },
        { name: "people_by_name", url: "/my-app/my-blog/indexes/people_by_name" }
      ]
    })
  })
})

describe("selectedIndex", () => {
  it("returns the selected index", () => {
    const state = Immutable.fromJS({
      schema: schemaTree,
      router: {
        database: ["my-app", "my-blog"],
        resource: {
          type: "indexes",
          name: "people_by_name"
        }
      }
    })

    expect(selectedIndex(state).toJS()).toEqual({
      name: "people_by_name",
      ref: q.Ref("indexes/people_by_name"),
      active: true,
      unique: false,
      partitions: 8,
      source: {
        name: "classes/people",
        url: "/my-app/my-blog/classes/people"
      },
      values: [
        { field: "data.name", transform: "casefold" },
        { field: "ref", transform: null }
      ],
      terms: [
        { field: "data.name", transform: "casefold" }
      ]
    })
  })
})

describe("databaseTree", () => {
  it("returns the database tree", () => {
    const state = Immutable.fromJS({
      schema: schemaTree,
      router: {
        database: []
      }
    })

    expect(databaseTree(state).toJS()).toEqual({
      url: "/",
      name: "/",
      databases: [
        {
          url: "/my-app",
          name: "my-app",
          databases: [
            {
              url: "/my-app/my-blog",
              name: "my-blog",
              databases: []
            }
          ]
        }
      ]
    })
  })
})
