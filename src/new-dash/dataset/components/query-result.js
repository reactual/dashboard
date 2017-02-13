import React, { Component } from "react"

import {
  Pivot,
  PivotItem,
  DetailsList,
  CheckboxVisibility,
  DetailsListLayoutMode
} from "office-ui-fabric-react"

import { renderSpecialType } from "../special-types"

export default class QueryResult extends Component {

  render() {
    if (this.props.error) return this.showError()
    if (this.props.result) return this.showResult()
    return null
  }

  showError() {
    const { error } = this.props

    if (error.requestResult && error.requestResult.responseContent) { // Query Error
      return <div>
          <p>{error.toString()}</p>
          <pre>{this.stringify(error.requestResult.responseContent)}</pre>
        </div>
    }

    return <p>{error.toString()}</p>
  }

  showResult() {
    const { columns, data } = this.buildDataSet()
    const selectedTab = data.length > 0 ? 0 : 1

    return <Pivot initialSelectedIndex={selectedTab}>
        <PivotItem linkText="Data">
          {data.length > 0 ?
            <DetailsList
              checkboxVisibility={CheckboxVisibility.hidden}
              layoutMode={DetailsListLayoutMode.justified}
              onRenderItemColumn={this.renderItemColumn.bind(this)}
              selectionMode="none"
              columns={columns}
              items={data} /> :
            <span className="ms-fontWeight-light">
              No data to show. Check JSON view to see the server response.
            </span>}
        </PivotItem>
        <PivotItem linkText="JS">
          <pre>{this.stringify(this.props.result)}</pre>
        </PivotItem>
      </Pivot>
  }

  buildDataSet() {
    const columnsByName = {}
    const data = []

    const dataToParse = this.props.result.data || this.props.result
    let hasNonObjects = false

    if (Array.isArray(dataToParse)) {
      dataToParse.forEach(elem => {
        if (typeof elem === "object") {
          Object.keys(elem).forEach(key => {
            if (!columnsByName[key]) {
              columnsByName[key] = {
                key,
                name: key,
                fieldName: key,
                minWidth: 0,
                maxWidth: 300
              }
            }
          })

          data.push(elem)
        } else {
          data.push({ $$dashboard_non_objects_found$$: elem })
          hasNonObjects = true
        }
      })
    }

    const columns = Object.values(columnsByName)

    if (hasNonObjects) {
      columns.push(
        {
          key: "$$dashboard_non_objects_found$$",
          fieldName: "$$dashboard_non_objects_found$$",
          name: "...",
          minWidth: 0,
          maxWidth: 300
        }
      )
    }

    return { columns, data }
  }

  renderItemColumn(item, index, column) {
    const value = item[column.key || index]
    if (!value) return null

    const specialItem = renderSpecialType(item)
    const specialValue = renderSpecialType(value)
    const result = specialItem || specialValue || value

    if (typeof result === "object") {
      return this.stringify(result)
    }

    return result
  }

  stringify(obj) {
    const replacements = []

    let string = JSON.stringify(obj, (key, value) => {
      const parsed = renderSpecialType(value)

      if (parsed) {
        const placeHolder = "$$dash_replacement_$" + replacements.length + "$$"
        replacements.push(parsed)
        return placeHolder
      }

      return value
    }, 2)

    replacements.forEach((replace, index) => {
      string = string.replace('"$$dash_replacement_$' + index + '$$"', replace)
    })

    return string
  }

}
