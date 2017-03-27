import React from "react"
import Immutable from "immutable"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import { KeysForm } from "../keys-form"

jest.mock("../../../notifications", () => ({
  notify: (msg, fn) => fn()
}))

const fill = (comp) => {
  comp.find("TextField[label='Name']").simulate("beforeChange", "server-key")
  comp.find("Dropdown[label='Role']").simulate("changed", { key: "admin" })
  comp.find("Dropdown[label='Database']").simulate("changed", { key: "db1" })
}

describe("KeysForm Component", () => {
  let comp, client

  beforeEach(() => {
    client = {
      query: jest.fn(() => Promise.resolve({
        secret: "one-time-secret"
      }))
    }

    comp = shallow(
      <KeysForm
        client={client}
        database={Immutable.fromJS({
          databases: [
            { name: "db1" },
            { name: "db2" }
          ]
        })} />
    )
  })

  it("should render an empty form", () => {
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("should be submit the form", () => {
    fill(comp)
    expect(shallowToJson(comp)).toMatchSnapshot()
    comp.find("Connect(SchemaForm)").simulate("submit").simulate("finish")
    expect(shallowToJson(comp)).toMatchSnapshot() // Form clean
  })

  it("should create a new key on submit", () => {
    fill(comp)
    return comp.find("Connect(SchemaForm)").props().onSubmit().then(() => {
      comp.find("Connect(SchemaForm)").simulate("finish")
      expect(shallowToJson(comp)).toMatchSnapshot() // Form clean + secret being displayed
    })
  })
})
