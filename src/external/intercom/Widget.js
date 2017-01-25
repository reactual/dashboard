import { Component } from 'react'
import { loadIntercomWidget, unloadIntercomWidget } from './SDK'
import Lead from './Lead'

export default class IntercomWidget extends Component {
  componentDidMount() {
    this.updateWidget(this.props.user)
  }

  componentWillReceiveProps(next) {
    if (this.props.user === next.user) return
    this.updateWidget(next.user)
  }

  updateWidget(user) {
    const lead = Lead.from(user)

    if (lead) {
      loadIntercomWidget(lead)
    } else {
      unloadIntercomWidget()
    }
  }

  componentWillUnmount() {
    unloadIntercomWidget()
  }

  shouldComponentUpdate() {
    return false
  }

  render() {
    return false
  }
}
