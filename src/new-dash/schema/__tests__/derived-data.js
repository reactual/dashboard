import Immutable from "immutable"

import {
  selectedDatabase,
  subDatabasesInSelectedDatabase,
  classesInSelectedDatabase,
  indexesInSelectedDatabase
} from "../"

const myBlog = Immutable.fromJS({
  info: {
    name: "my-blog"
  },
  classes: {
    byName: {
      "people": {},
      "users": {}
    }
  },
  indexes: {
    byName: {
      "all_people": {},
      "all_users": {}
    }
  }
})

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
            "my-blog": myBlog
          }
        }
      }
    }
  }
})

describe("selectedDatabase", () => {
  it("returns selected database", () => {
    const state = Immutable.fromJS({
      schema: schemaTree,
      router: {
        database: ["my-app", "my-blog"]
      }
    })

    expect(selectedDatabase(state).toJS()).toEqual(myBlog.toJS())
  })

  it("returns empty if selected database is not present", () => {
    const state = Immutable.fromJS({
      schema: schemaTree,
      router: {
        database: ["not-loaded"]
      }
    })

    expect(selectedDatabase(state).toJS()).toEqual({})
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
