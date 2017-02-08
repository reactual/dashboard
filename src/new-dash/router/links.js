import { Map } from "immutable"

export const buildUrl = (parentUrl, ...parts) => {
  const url = parts.join("/")
  if (url === "/") return parentUrl
  if (parentUrl === "/") return `/${url}`

  return `${parentUrl}/${url}`
}

const supportedRefTypes = [
  "classes",
  "indexes"
]

export const linkForRef = (parentUrl, ref) => {
  const path = (ref && ref.value) || ""
  const [ type ] = path.split("/")

  if (!supportedRefTypes.includes(type)) {
    return Map.of("name", path, "url", null)
  }

  return Map.of(
    "name", path,
    "url", buildUrl(parentUrl, path)
  )
}
