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
  const [ type ] = ref.value.split("/")

  if (!supportedRefTypes.includes(type)) {
    return Map.of("name", ref.value, "url", null)
  }

  return Map.of(
    "name", ref.value,
    "url", buildUrl(parentUrl, ref.value)
  )
}
