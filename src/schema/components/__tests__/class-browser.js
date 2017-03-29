import React from "react"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import { query as q } from "faunadb"
import { Map, List } from "immutable"

import { ClassBrowser } from "../class-browser"

jest.mock("../../../notifications", () => ({ watchForError: (msg, fn) => fn() }))
jest.mock("../../../activity-monitor", () => ({ monitorActivity: jest.fn() }))
jest.mock("../../", () => ({ createIndex: jest.fn(() => () => null) }))

const { createIndex } = require("../../")

describe("ClassBrowser Component", () => {
  let comp, clazz, classWithoutIndex, client

  beforeEach(() => {
    client = {
      query: jest.fn(() => Promise.resolve({
        data: [{
          ref: q.Ref("classes/people/1"),
          data: { name: "Bob" }
        }]
      }))
    }

    clazz = Map.of(
      "name", "people",
      "ref", q.Ref("classes/people"),
      "indexes", List.of(
        Map.of(
          "name", "all_people",
          "classIndex", true,
          "ref", q.Ref("indexes/all_people")
        )
      )
    )

    classWithoutIndex = Map.of(
      "name", "users",
      "ref", q.Ref("classes/users"),
      "indexes", List.of()
    )

    comp = shallow(
      <ClassBrowser
        dispatch={jest.fn(x => x)}
        isBusy={false}
        client={client}
        clazz={clazz}
        databaseUrl="/db/a-db/databases"
        path={["a-db"]} />
    )
  })

  it("displays instances", () => {
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("should respond to changes in pagination", () => {
    comp.find("InstancesList").props().query({ size: 1 })
    expect(client.query).toHaveBeenCalled()
  })

  it("should respond to selected ref", () => {
    comp.find("InstancesList").simulate("selectRef", "a-ref")
    expect(client.query).toHaveBeenCalled()
  })

  it("should display new index button when no class index", () => {
    comp.setProps({ clazz: classWithoutIndex })
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("should disable create index button when busy", () => {
    comp.setProps({ clazz: classWithoutIndex, isBusy: true })
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("should be able to create a new class index", () => {
    comp.setProps({ clazz: classWithoutIndex })
    comp.find("Button").simulate("click", { preventDefault: jest.fn() })

    expect(createIndex).toHaveBeenCalledWith(client, ["a-db"], {
      name: "all_users",
      source: q.Ref("classes/users")
    })
  })
})
