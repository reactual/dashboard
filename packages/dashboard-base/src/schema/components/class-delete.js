import React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"

import DeleteForm from "./delete-form"
import { deleteClass, selectedDatabase, selectedClass } from "../"
import { notify } from "../../notifications"
import { faunaClient } from "../../authentication"
import { buildResourceUrl } from "../../router"
import { Events } from "../../plugins"

export const ClassDelete = ({ client, path, dbUrl, clazz }) => {
  const onDelete = () => {
    Events.fire("@@schema/updated", { resource: "class", action: "delete" })
    return notify("Class deleted successfully", dispatch =>
      dispatch(deleteClass(client, path, clazz.get("name"))).then(() =>
        browserHistory.push(buildResourceUrl(dbUrl, "classes"))
      )
    )
  }

  return <DeleteForm
    buttonText="Delete Class"
    type="class"
    title={`Delete ${clazz.get("name")}`}
    validateName={clazz.get("name")}
    onDelete={onDelete} />
}

ClassDelete.displayName = "ClassDelete"

export default connect(
  state => ({
    client: faunaClient(state),
    path: selectedDatabase(state).get("path"),
    dbUrl: selectedDatabase(state).get("url"),
    clazz: selectedClass(state)
  })
)(ClassDelete)
