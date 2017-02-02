import React, { Component } from "react"
import { Map } from "immutable"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { Nav, css } from "office-ui-fabric-react";

class NavDBTree extends Component {
  constructor(props) {
    super(props)
     this.state = { links: [] }
  }

  componentDidMount() {
    this.buildLinks(this.props.schema)
  }

  componentWillReceiveProps(next) {
    if (this.props.schema !== next.schema) {
      this.buildLinks(next.schema)
    }
  }

  buildLinks(schema) {
    this.setState({
      links: this.databaseLinks(schema, this.state.links)
    })
  }

  databaseLinks(schema, links, partenUrl = "") {
    const databaseTree = (db) => {
      const name = db.getIn(["info", "name"])
      const key = `${partenUrl}/${name}`
      const link = links.find(l => l.key === key) || {}

      return {
        name,
        key,
        url: key,
        links: this.databaseLinks(db, link.links || [], key),
        isExpanded: (typeof link.isExpanded === "undefined" ? true : link.isExpanded)
      }
    }

    return schema
      .getIn(["databases", "byName"], Map())
      .map(nested => databaseTree(nested))
      .toList()
      .toJS()
  }

  onClick(e, link) {
    e.preventDefault()
    browserHistory.push(link.url)
  }

  render() {
    const links = [{
      name: "Databases",
      links: this.state.links
    }]

    return <Flav groups={links} onLinkClick={this.onClick.bind(this)} />
  }
}


// Custom Nav to add chevron icon to all sub levels
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
