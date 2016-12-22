/* eslint-disable */
export default function replEval(q, client, __query) {
  console.log("evalQuery", client, __query, q)
  const query = eval(__query);
  console.log("runQuery", query)
  return client.query(query)
}
