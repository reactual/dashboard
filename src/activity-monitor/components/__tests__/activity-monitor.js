import React from "react"
import renderer from "react-test-renderer"

import { reduceActivityMonitor, monitorActivity, ActivityMonitor } from "../../"

describe("ActivityMonitor Component", () => {
  let comp, store

  beforeEach(() => {
    store = createImmutableTestStore({ activityMonitor: reduceActivityMonitor })()
    comp = renderer.create(<ActivityMonitor store={store} />)
    expect(comp).toMatchSnapshot()
  })

  it("should turn spinner on and off when monitoring activity", () => {
    return store.dispatch(
      monitorActivity(() => {
        expect(comp).toMatchSnapshot() // Inside monitor. Display spinner
        return Promise.resolve()
      })
    ).then(() => {
      expect(comp).toMatchSnapshot() // Outside monitor. Hide spinner
    })
  })
})
