/* eslint-disable */
import { queryFunctionsAsGlobalVariables } from './query-functions'
import faunadb from 'faunadb'
const q = faunadb.query

export default function replEval(client, __query) {
  try {
    const query = eval(`(function() {${queryFunctionsAsGlobalVariables}; return ${__query};})()`)
    return client.query(query)
  } catch (error) {
    return Promise.reject(error)
  }
}
