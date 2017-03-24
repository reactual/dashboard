import React from "react"
import { Map, List } from "immutable"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import NavSchema from "../nav-schema"
import { reduceSchemaTree } from "../../"

jest.mock("react-router", () => ({
  browserHistory: {
    push: jest.fn()
  }
}))

const { browserHistory } = require("react-router")

describe("NavSchema Component", () => {
  let rootDb, subDb, store, client

  const render = (db) => shallow(
    <NavSchema
      store={store}
      client={client}
      database={db} />
  ).dive()

  beforeEach(() => {
    rootDb = Map.of(
      "isRoot", true,
      "url", "/db/databases",
      "classes", List.of(Map.of("name", "a-class", "url", "/db/classes/a-class")),
      "indexes", List.of(Map.of("name", "a-index", "url", "/db/indexes/a-index")),
    )

    subDb = Map.of(
      "isRoot", false,
      "url", "/db/subdb/databases",
      "classes", List(),
      "indexes", List(),
    )

    client = { hasPrivileges: jest.fn(() => true) }
    store = createImmutableTestStore({ schema: reduceSchemaTree })()
  })

  it("should render classes and indexes for root db", () => {
    expect(shallowToJson(render(rootDb))).toMatchSnapshot()
  })

  it("should render classes and indexes for sub db", () => {
    expect(shallowToJson(render(subDb))).toMatchSnapshot()
  })

  it("should render options for root using a server key", () => {
    client.hasPrivileges.mockReturnValue(false)
    expect(shallowToJson(render(rootDb))).toMatchSnapshot()
  })

  it("should render options for sub using a server key", () => {
    client.hasPrivileges.mockReturnValue(false)
    expect(shallowToJson(render(subDb))).toMatchSnapshot()
  })

  it("navigates to the clicked resource", () => {
    const comp = render(rootDb)
    comp.simulate("linkClick", new Event("click"), { url: "resource-url" })
    expect(browserHistory.push).toHaveBeenCalledWith("resource-url")
  })
})
