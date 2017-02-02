import React from "react"
import Immutable from "immutable"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { Nav, css } from "office-ui-fabric-react";

const databaseLinks = (schema, dbUrl = "") => {
  const databaseTree = (db) => {
    const name = db.getIn(["info", "name"])
    const url = `${dbUrl}/${name}`

    return {
      name,
      url,
      key: url,
      isExpanded: true,
      links: databaseLinks(db, url)
    }
  }

  return schema
    .getIn(["databases", "byName"], Immutable.Map())
    .map(nested => databaseTree(nested))
    .toList()
    .toJS()
}

const onClick = (e, link) => {
  e.preventDefault()
  browserHistory.push(link.url)
}

const NavDBTree = (props) => {
  const links = [{
    name: "Databases",
    isExpanded: true,
    links: databaseLinks(props.schema)
  }]

  return <Flav groups={links} onLinkClick={onClick} />
}

// Custom nav tree to add chevron icon to all sub databases
class Flav extends Nav {
  _renderCompositeLink(link, linkIndex, nestingLevel) {
    const key = link.key || linkIndex
    const isLinkSelected = key === this.state.selectedKey

    return <div key={key}
        className={css("ms-Nav-compositeLink", {"is-expanded": link.isExpanded, "is-selected": isLinkSelected })}>
          {(link.links && link.links.length > 0 ?
            <button
              className="ms-Nav-chevronButton ms-Nav-chevronButton--link"
              onClick={this._onLinkExpandClicked.bind(this, link)}
              title={(link.isExpanded ? this.props.expandedStateText : this.props.collapsedStateText)}>
              <i className="ms-Nav-chevron ms-Icon ms-Icon--ChevronDown"></i>
            </button> : null
          )}
        {!!link.onClick ? this._renderButtonLink(link, linkIndex) : this._renderAnchorLink(link, linkIndex, nestingLevel)}
      </div>
  }
}

export default connect(
  state => ({
    schema: state.get("schema")
  })
)(NavDBTree)
