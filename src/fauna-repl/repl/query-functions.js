import { query as q } from 'faunadb'

export const functionNames = Object.values(q)
  .filter(fun => !!fun.name.match(/^[A-Z]/))
  .map(fun => fun.name)

export const queryFunctions = functionNames.map(
  fun => global[fun] ? `q.${fun}` : fun
)

export const queryFunctionsAsGlobalVariables = functionNames
  .filter(fun => !global[fun])
  .map(fun => `var ${fun} = q.${fun}`)
  .join(";")
