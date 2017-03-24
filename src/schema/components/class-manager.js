import React from "react"
import { Pivot, PivotItem } from "office-ui-fabric-react"

import ClassInfo from "./class-info"
import ClassDelete from "./class-delete"

export default () => {
  return <div>
      <Pivot>
        <PivotItem linkText="Class Details" itemKey="class-info">
          <ClassInfo />
        </PivotItem>
        <PivotItem linkText="Delete" itemKey="class-delete">
          <ClassDelete />
        </PivotItem>
      </Pivot>
    </div>
}
