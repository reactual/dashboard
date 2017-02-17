import { Map, List } from "immutable"

const ROOT_URL = "/db"
const ROOT_RESOURCE_URL = `${ROOT_URL}/databases`

export const buildResourceUrl = (parentUrl, path, resource) => {
  const parent = parentUrl || ROOT_RESOURCE_URL
  const parentPath = parent.split("/").slice(2).slice(0, -1)
  const url = List(parentPath).concat(path).concat(resource).join("/")

  return `${ROOT_URL}/${url}`
    .replace(/\/\/+/, "/")
    .replace(/\/$/, "")
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
    "url", buildResourceUrl(parentUrl, path)
  )
}
