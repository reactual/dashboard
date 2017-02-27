import React from "react"
import { Nav, css } from "office-ui-fabric-react"

const _indentationSize = 14

// Custom Nav to add chevron icon to all sub levels and control selected items
export default class CustomNav extends Nav {
  _renderCompositeLink(link, linkIndex, nestingLevel) {
    const isLinkSelected = _isLinkSelected(link, this.props.selectedKey)
    const paddingBefore = (_indentationSize * nestingLevel).toString(10) + 'px'

    return <div key={link.key || linkIndex}
        className={css("ms-Nav-compositeLink", {"is-expanded": link.isExpanded, "is-selected": isLinkSelected })}>
          {((link.links && link.links.length > 0) || (this.props.alwaysShowExpandButton && !link.onClick) ?
            <button
              style={{paddingLeft: paddingBefore}}
              className="ms-Nav-chevronButton ms-Nav-chevronButton--link"
              onClick={this._onLinkExpandClicked.bind(this, link)}
              title={(link.isExpanded ? this.props.expandedStateText : this.props.collapsedStateText)}>
              <i className="ms-Nav-chevron ms-Icon ms-Icon--ChevronDown"></i>
            </button> : null
          )}
        {!!link.onClick ? this._renderButtonLink(link, linkIndex) : this._renderAnchorLink(link, linkIndex, nestingLevel)}
      </div>
  }

  _onLinkExpandClicked(link, ev) {
    if (this.props.onExpand) {
      const res = this.props.onExpand(link) || Promise.resolve()
      res.then(() => this.setState({ isLinkExpandStateChanged: true }))

      link.isExpanded = !link.isExpanded
      ev.preventDefault()
      ev.stopPropagation()
      return
    }

    super._onLinkExpandClicked(link, ev)
  }
}

// https://github.com/OfficeDev/office-ui-fabric-react/blob/v0.69.0-hotfix1/src/components/Nav/Nav.tsx#L210
let _urlResolver;
function _isLinkSelected(link: INavLink, selectedKey: string): boolean {
  if (selectedKey && link.key === selectedKey) {
    return true;
  }

  // resolve is not supported for ssr
  if (typeof(window) === 'undefined') {
    return false;
  }

  if (!link.url) {
    return false;
  }

  _urlResolver = _urlResolver || document.createElement('a');

  _urlResolver.href = link.url || '';
  const target: string = _urlResolver.href;

  if (location.protocol + '//' + location.host + location.pathname === target) {
    return true;
  }

  if (location.href === target) {
    return true;
  }

  if (location.hash) {
    // Match the hash to the url.
    if (location.hash === link.url) {
      return true;
    }

    // Match a rebased url. (e.g. #foo becomes http://hostname/foo)
    _urlResolver.href = location.hash.substring(1);

    return _urlResolver.href === target;
  }

  return false;
}
