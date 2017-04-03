import React from "react"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import { List, Map } from "immutable"

import { NotificationBar } from "../notification-bar"

it("renders empty", () => {
  const comp = shallow(<NotificationBar notifications={List()}/>)
  expect(shallowToJson(comp)).toMatchSnapshot()
})

it("displays notifications", () => {
  const comp = shallow(
    <NotificationBar notifications={List.of(
      Map.of("type", "error", "message", "an error"),
      Map.of("type", "success", "message", "a success"),
      Map.of("type", "info", "message", "an info")
    )}/>
  )

  expect(shallowToJson(comp)).toMatchSnapshot()
})
