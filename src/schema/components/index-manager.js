import React from "react"
import { Pivot, PivotItem } from "office-ui-fabric-react"

import IndexInfo from "./index-info"

export default () => {
  return <Pivot>
    <PivotItem linkText="Index Details" itemKey="index-info">
      <IndexInfo />
    </PivotItem>
  </Pivot>
}
