import React from "react"
import { Map, List } from "immutable"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import ClassInfo from "../class-info"
import { reduceSchemaTree } from "../../"

describe("ClassInfo Component", () => {
  let clazz, store

  beforeEach(() => {
    clazz = Map.of(
      "name", "fake-class",
      "historyDays", 30,
      "ttlDays", 10,
      "indexes", List.of(
        Map.of(
          "name", "all_fake-class",
          "url", "/db/indexes/all_fake-class"
        )
      )
    )

    store = createImmutableTestStore({ schema: reduceSchemaTree })()
  })

  it("renders class details", () => {
    const comp = shallow(<ClassInfo store={store} clazz={clazz} />).dive()
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("renders class when no history or ttl", () => {
    const c = clazz.set("historyDays", null).set("ttlDays", null)
    const comp = shallow(<ClassInfo store={store} clazz={c} />).dive()
    expect(shallowToJson(comp)).toMatchSnapshot()
  })
})



