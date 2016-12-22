/* eslint-disable */
export default function replEval(q, client, __query) {
  const query = eval(__query);
  return client.query(query)
}
