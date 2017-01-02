import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

export function updateClassInfo(client, result) {
  if(!Array.isArray(result))
    result = [result]

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

export function getAllClasses(client) {
  return (dispatch, getState) => {
    if(Object.keys(getState().classes).length > 0)
      return Promise.resolve()

    return client.query(q.Map(q.Paginate(Ref("classes")), clazz => q.Get(clazz))).then(
      result => dispatch(updateClassInfo(client, result.data))
    )
  }
}

export function getClassInfo(client, name) {
  return (dispatch, getState) => {
    if(getState().classes[name]) {
      dispatch(updateSelectedClass(name))
      return Promise.resolve()
    }

    return client.query(q.Get(q.Class(name))).then(result => {
      dispatch(updateClassInfo(client, result))
    }).then(() => {
      dispatch(updateSelectedClass(name))
    })
  }
}

export function updateIndexOfClass(clazz, indexes) {
  return {
    type: "UPDATE_INDEX_OF_CLASS",
    clazz: clazz,
    indexes: indexes
  }
}

export function queryForIndexes(client, classRef) {
  return (dispatch, getState) => {
    const name = classRef.id

    if(getState().classes[name] && getState().classes[name].indexes) {
      return Promise.resolve()
    }

    const allIndexes = q.Filter(
      q.Map(q.Paginate(Ref("indexes")), indexRef => q.Get(indexRef)),
      indexInstance => {
        return q.If(q.Contains("source", indexInstance),
          q.Equals(classRef, q.Select("source", indexInstance)),
          true
        )
      }
    )

    return client.query(
      q.Map(allIndexes, index => q.Select(['name'], index))
    ).then(result => {
      dispatch(updateIndexOfClass(name, result.data))
    })
  }
}

