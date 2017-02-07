import Immutable from "immutable"

import { selectedDatabasePath, selectedDatabaseUrl } from "../"

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
