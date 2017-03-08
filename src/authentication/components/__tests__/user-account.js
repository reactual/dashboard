import React from "react"
import util from "util"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"

import { reduceUserSession, UserAccount } from "../../"

// We can't use enzyme#mount to render components that are
// dependent on Fabric's Callout component because it changes
// the DOM adding elemenents at the body, outside of the this
// component's scope.
//
// The elements added by Fabric have cicular dependencies to the
// elements on this component, breaking attempts to take JSON
// snapshots from them.

describe("UserAccount Component", () => {
  let comp, store, currentUser

  beforeEach(() => {
    currentUser = { name: "mocked user" }
    store = createImmutableTestStore({ currentUser: reduceUserSession }, { currentUser })(
      state => currentUser = state.get("currentUser")
    )

    comp = shallow(<UserAccount store={store} />).dive()
  })

  it("should show and hide context menu on click", () => {
    expect(shallowToJson(comp)).toMatchSnapshot()

    comp.find("Button").simulate("click", { target: "mocked" })
    expect(shallowToJson(comp)).toMatchSnapshot()

    // Can't simulate using the DOM. Read above.
    comp.instance().hideMenu()
    comp.update()
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("should show context menu on click", () => {
    // Can't simulate using the DOM. Read above.
    comp.instance().logout()
    expect(currentUser).toBeNull()
  })
})
