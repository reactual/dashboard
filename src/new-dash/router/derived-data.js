import { Seq } from "immutable"

export const selectedDatabasePath = (state) =>
  state.getIn(["router", "selectedResource", "database"], Seq())
