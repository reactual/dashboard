import { List } from "immutable"

export const nestedDatabaseNodeIn = (path, node) => {
  const nodePath = List(path).flatMap(
    segment => ["databases", "byName", segment]
  )

  if (node) {
    return nodePath.concat(node)
  }

  return nodePath
}
