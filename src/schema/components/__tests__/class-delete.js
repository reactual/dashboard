import React from "react"
import { Map } from "immutable"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import ClassDelete from "../class-delete"
import { reduceSchemaTree } from "../../"

jest.mock("react-router", () => ({
  browserHistory: {
    push: jest.fn()
  }
}))

const { browserHistory } = require("react-router")

describe("ClassDelete Component", () => {
  let comp, store, client

  beforeEach(() => {
    client = { query: jest.fn(() => Promise.resolve()) }
    store = createImmutableTestStore({ schema: reduceSchemaTree })()

    comp = shallow(
      <ClassDelete
        store={store}
        client={client}
        path={["a-db"]}
        clazz={Map.of("name", "fake-class")}
        dbUrl="/db/a-db/databases" />
    ).dive()
  })

  it("renders delete form", () => {
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("delete class", () => {
    return store.dispatch(comp.props().onDelete()).then(() => {
      expect(browserHistory.push).toHaveBeenCalledWith("/db/a-db/classes")
    })
  })
})

