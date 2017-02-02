import { reduceRouter, updateSelected } from "../"

describe("Given a router store", () => {
  let store, selectedResource

  beforeEach(() => {
    store = createImmutableTestStore({
      router: reduceRouter
    })(state => selectedResource = state.getIn(["router", "selectedResource"]).toJS())
  })

  it("should selected root database", () => {
    store.dispatch(updateSelected(null))
    expect(selectedResource).toEqual({ database: [] })
  })

  it("should select a sub database", () => {
    store.dispatch(updateSelected("my-app/my-blog"))
    expect(selectedResource).toEqual({ database: ["my-app", "my-blog"] })
  })
})
