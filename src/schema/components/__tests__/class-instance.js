import React from "react"
import { Map } from "immutable"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import ClassInstance from "../class-instance"
import { reduceSchemaTree } from "../../"

describe("ClassInstance Component", () => {
  let comp, store, client

  beforeEach(() => {
    client = { query: jest.fn(() => Promise.resolve({ name: "fake-instance" })) }
    store = createImmutableTestStore({ schema: reduceSchemaTree })()

    comp = shallow(
      <ClassInstance
        store={store}
        client={client}
        path={["a-db"]}
        clazz={Map.of("name", "fake-class")} />
    ).dive()
  })

  it("renders instance form", () => {
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("create a new instance", () => {
    comp.find("ReplEditor").simulate("change", "{ 'name': 'Bob' }")
    expect(shallowToJson(comp)).toMatchSnapshot()

    return store.dispatch(comp.find("Connect(SchemaForm)").props().onSubmit()).then(() => {
      comp.update()
      expect(shallowToJson(comp)).toMatchSnapshot()
    })
  })
})


