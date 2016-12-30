import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

export function updateClassInfo(client, result) {
  return {
    type: "UPDATE_CLASS_INFO",
    scopedClient: client,
    result: result
  }
}

export function updateSelectedClass(name) {
  return {
    type: "UPDATE_SELECTED_CLASS",
    name: name
  }
}

export function getClassInfo(client, name) {
  return (dispatch, getState) => {
    if(getState().classes[name]) {
      dispatch(updateSelectedClass(name))
      return Promise.resolve()
    }

    return client.query(q.Get(q.Class(name))).then(
      result => dispatch(updateClassInfo(client, result))
    )
  }
}

export function updateIndexInfo(clazz, indexes) {
  return {
    type: "UPDATE_INDEX_INFO",
    clazz: clazz,
    indexes: indexes
  }
}

export function queryForIndexes(client, classRef) {
  return (dispatch, getState) => {
    let name = classRef.id

    if(getState().classes[name] && getState().classes[name].indexes) {
      return Promise.resolve()
    }

    return client.query(
      q.Filter(
        q.Map(q.Paginate(Ref("indexes")), indexRef => q.Get(indexRef)),
        indexInstance => {
          return q.If(q.Contains("source", indexInstance),
            q.Equals(classRef, q.Select("source", indexInstance)),
            true
          )
        }
      )
    ).then(
      result => dispatch(updateIndexInfo(classRef.id, result.data))
    )
  }
}

