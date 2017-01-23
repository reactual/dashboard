/* eslint-disable */
export default function replEval(q, client, __query) {
  try {
    const query = eval(__query)
    return client.query(query)
  } catch (error) {
    return Promise.reject(error)
  }
}
