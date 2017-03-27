import React from "react"
import { Map, List } from "immutable"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import { query as q } from "faunadb"

import { IndexBrowser } from "../index-browser"

jest.mock("../../../activity-monitor", () => ({
  monitorActivity: x => x
}))

jest.mock("../../../notifications", () => ({
  watchForError: () => Promise.resolve("mocked")
}))

describe("IndexBrowser Component", () => {
  let classIndex, index

  const render = (index) => shallow(
    <IndexBrowser dispatch={x => x} index={index} />
  )

  beforeEach(() => {
    classIndex = Map.of(
      "ref", q.Index("a-index"),
      "terms", List()
    )

    index = Map.of(
      "ref", q.Index("a-index"),
      "terms", List.of(
        Map.of("field", List.of("data", "name"))
      )
    )
  })

  it("browser a class index", () => {
    const comp = render(classIndex)
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("select a ref", () => {
    const comp = render(classIndex)
    return comp.find("Connect(Pagination)").props().onSelectRef(q.Ref("fake")).then(() => {
      comp.update()
      expect(shallowToJson(comp)).toMatchSnapshot()
    })
  })

  it("browser non class index", () => {
    const comp = render(index)
    expect(shallowToJson(comp)).toMatchSnapshot()

    comp.find("ReplEditor").simulate("change", "a name")
    comp.find("Button").simulate("click")
    expect(shallowToJson(comp)).toMatchSnapshot()
  })
})
