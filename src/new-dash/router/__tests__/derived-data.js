import Immutable from "immutable"

import { selectedDatabasePath, selectedDatabaseUrl, selectedResource } from "../"

describe("selectedDatabasePath", () => {
  it("returns selected path", () => {
    const path = selectedDatabasePath(Immutable.fromJS({
      router: {
        database: ["a", "b"]
      }
    }))

    expect(path.toJS()).toEqual(["a", "b"])
  })

  it("returns empty when no selected path", () => {
    const path = selectedDatabasePath(Immutable.fromJS({
      router: {}
    }))

    expect(path.toJS()).toEqual([])
  })
})

describe("selectedDatabaseUrl", () => {
  it("returns selected db's url", () => {
    const path = selectedDatabaseUrl(Immutable.fromJS({
      router: {
        database: ["a", "b"]
      }
    }))

    expect(path).toEqual("/a/b")
  })

  it("returns empty when no selected path", () => {
    const path = selectedDatabaseUrl(Immutable.fromJS({
      router: {}
    }))

    expect(path).toEqual("")
  })
})

describe("selectedResource", () => {
  describe("when there is a database selected", () => {
    const state = Immutable.fromJS({
      router: {
        database: ["a", "b"]
      }
    })

    const selected = selectedResource(state).toJS()

    it("contains database path", () => expect(selected.database.path).toEqual(["a", "b"]))
    it("contains database url", () => expect(selected.database.url).toEqual("/a/b"))
  })

  describe("when there is NO database selected", () => {
    const state = Immutable.fromJS({
      router: {
        database: []
      }
    })

    const selected = selectedResource(state).toJS()

    it("contains empty database path", () => expect(selected.database.path).toEqual([]))
    it("contains root url", () => expect(selected.database.url).toEqual("/"))
  })
})
