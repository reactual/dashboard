import React from "react"
import { Map } from "immutable"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import { reduceSchemaTree, KeysManager } from "../../"

describe("KeysManager Component", () => {
  let store

  beforeEach(() => {
    store = createImmutableTestStore({ schema: reduceSchemaTree })()
  })

  it("should render for root db", () => {
    const comp = shallow(<KeysManager store={store} />).dive()
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("should keys containment message when not a root database", () => {
    const db = Map.of(
      "isRoot", false,
      "name", "subdb",
      "parent", Map.of(
        "url", "/db/parent/databases"
      )
    )

    const comp = shallow(<KeysManager store={store} database={db} />).dive()
    expect(shallowToJson(comp)).toMatchSnapshot()
  })
})
