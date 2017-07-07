import ReactGA from "react-ga"
import { Events } from "dashboard-base"

Events.listen("@@dashboard/page-changed", ({ pathname }) => {
  ReactGA.set({ page: pathname })
  ReactGA.pageview(pathname)
})

Events.listen("@@notifications/pushed", ({ type, message }) => {
  ReactGA.event({
    category: "notify",
    action: type,
    label: message
  })
})

Events.listen("@@toggle-repl/toggled", ({ prop }) => {
  ReactGA.event({
    category: "repl",
    action: prop
  })
})

Events.listen("@@toggle-repl/query-executed", () => {
  ReactGA.event({
    category: "repl",
    action: "query"
  })
})

Events.listen("@@schema/updated", ({ resource, action }) => {
  ReactGA.event({
    category: "schema",
    action: `${resource}-${action}`
  })
})
