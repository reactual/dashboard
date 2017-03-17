import React from "react"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import { query as q } from "faunadb"

import KeysList from "../keys-list"
import { reduceSchemaTree } from "../../"

jest.mock("react-router", () => ({
  browserHistory: {
    push: jest.fn()
  }
}))

const { browserHistory } = require("react-router")

describe("KeysList Component", () => {
  let comp, client, store

  beforeEach(() => {
    client = {
      query: jest.fn(() =>
        Promise.resolve("fake-key")
      )
    }

    store = createImmutableTestStore({ schema: reduceSchemaTree })()
    comp = shallow(<KeysList store={store} client={client} />).dive()
  })

  it("should render an empty page", () => {
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("fetches keys", () => {
    comp.find("Connect(Pagination)").prop("query")()
    expect(client.query).toHaveBeenCalled()
  })

  it("fetch a key when clicked", () => {
    comp.find("Connect(Pagination)").simulate("selectRef", q.Ref("keys/123"))
    expect(client.query).toHaveBeenCalled()
  })

  it("displays the selected key", () => {
    return comp.instance().onRefSelected(q.Ref("keys/123")).then(() => {
      comp.update()
      expect(shallowToJson(comp)).toMatchSnapshot() // returned key will be present
    })
  })

  it("redirect to database when database ref is cliekced", () => {
    comp.instance().onRefSelected(q.Ref("databases/my-blog"))
    expect(browserHistory.push).toHaveBeenCalledWith("/db/my-blog/databases")
  })
})
