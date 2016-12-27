import faunadb from 'faunadb';
const q = faunadb.query;

export function updateClassInfo(client, result) {
  return {
    type: "UPDATE_CLASS_INFO",
    scopedClient: client,
    result: result
  }
}

export function getClassInfo(client, name) {
  return (dispatch, getState) => {
    if(getState().classes[name])
      return Promise.resolve()

    return client.query(q.Get(q.Class(name))).then(
      result => dispatch(updateClassInfo(client, result))
    )
  }
}

