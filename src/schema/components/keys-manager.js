import React from "react"
import { Pivot, PivotItem } from "office-ui-fabric-react"

import KeysForm from "./keys-form"
import KeysList from "./keys-list"

export default () => {
  return <div>
      <Pivot>
        <PivotItem linkText="Keys" itemKey="keys">
          <KeysList />
        </PivotItem>
        <PivotItem linkText="Create a Key" itemKey="create">
          <KeysForm />
        </PivotItem>
      </Pivot>
    </div>
}
