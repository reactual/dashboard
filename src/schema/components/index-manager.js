import React from "react"
import { Pivot, PivotItem } from "office-ui-fabric-react"

import IndexInfo from "./index-info"
import IndexDelete from "./index-delete"

export default () => {
  return <Pivot>
    <PivotItem linkText="Index Details" itemKey="index-info">
      <IndexInfo />
    </PivotItem>
    <PivotItem linkText="Delete" itemKey="index-delete">
      <IndexDelete />
    </PivotItem>
  </Pivot>
}
