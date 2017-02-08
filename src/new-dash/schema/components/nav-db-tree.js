import React, { Component } from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { Nav, css } from "office-ui-fabric-react"

import { databaseTree } from "../"

class NavDBTree extends Component {
  constructor(props) {
    super(props)
     this.state = { links: [] }
  }

  componentDidMount() {
    this.buildLinks(this.props.databaseTree)
  }

  componentWillReceiveProps(next) {
    if (this.props.databaseTree !== next.databaseTree) {
      this.buildLinks(next.databaseTree)
    }
  }

  buildLinks(databaseTree) {
    this.setState({
      links: this.databaseLinks(databaseTree, this.state.links)
    })
  }

  databaseLinks(databaseTree, links) {
    const toLink = (db) => {
      const name = db.get("name")
      const key = db.get("url")
      const link = links.find(l => l.key === key) || {}

      return {
        name,
        key,
        url: key,
        links: this.databaseLinks(db, link.links || []),
        isExpanded: (typeof link.isExpanded === "undefined" ? true : link.isExpanded)
      }
    }

    return databaseTree
      .get("databases")
      .map(toLink)
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
    databaseTree: databaseTree(state)
  })
)(NavDBTree)
