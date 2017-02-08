import { reduceRouter, updateSelectedResource } from "../"

describe("Given a router store", () => {
  let store, selectedResource

  beforeEach(() => {
    store = createImmutableTestStore({
      router: reduceRouter
    })(state => selectedResource = state.get("router").toJS())
  })

  it("should selected root database", () => {
    store.dispatch(updateSelectedResource({}))
    expect(selectedResource).toEqual({ database: [] })
  })

  it("should select a sub database", () => {
    store.dispatch(updateSelectedResource({ splat: "my-app/my-blog" }))
    expect(selectedResource).toEqual({ database: ["my-app", "my-blog"] })
  })

  it("should empty paths", () => {
    store.dispatch(updateSelectedResource({ splat: "my-app///my-blog/" }))
    expect(selectedResource).toEqual({ database: ["my-app", "my-blog"] })
  })
})
