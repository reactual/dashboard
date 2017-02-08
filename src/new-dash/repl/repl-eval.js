import { query as q } from "faunadb"

/* eslint-disable */
const doEval = (q, code) => eval(code)

export const evalQuery = (client, path, key, code) => {
  if (!code.trim()) {
    return Promise.reject("Can not eval empty query.")
  }

  try {
    return client.query(path, key, doEval(q, `(${code})`))
  } catch (error) {
    return Promise.reject(error)
  }
}
