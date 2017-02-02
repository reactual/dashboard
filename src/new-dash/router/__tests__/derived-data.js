import Immutable from "immutable"

import { selectedDatabasePath } from "../"

describe("selectedDatabasePath", () => {
  it("returns selected path", () => {
    const path = selectedDatabasePath(Immutable.fromJS({
      router: {
        selectedResource: {
          database: ["a", "b"]
        }
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
