import React from "react"
import { connect } from "react-redux"

import NavDBTree from "./nav-db-tree.js"
import NavSchema from "./nav-schema.js"

const NavTree = (props) => {
  return <div className="ms-Grid-row">
      <div className="ms-Grid-col ms-u-sm12 ms-u-xl6">
        <NavDBTree />
      </div>
      <div className="ms-Grid-col ms-u-sm12 ms-u-xl6">
        <NavSchema />
      </div>
    </div>
}

export default connect()(NavTree)
