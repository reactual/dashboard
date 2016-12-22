/* eslint-disable */
import {query as q} from 'faunadb';

export default function replEval(client, __query) {
  console.log("evalQuery", client, __query, q)
  const query = eval(__query);
  console.log("runQuery", query)
  return client.query(query)
}
