import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

export function updateClassInfo(client, database, result) {
  if(!Array.isArray(result))
    result = [result]

  return {
    type: "UPDATE_CLASS_INFO",
    scopedClient: client,
    database: database,
    result: result
  }
}

export function updateSelectedClass(database, name) {
  return {
    type: "UPDATE_SELECTED_CLASS",
    database: database,
    name: name
  }
}

export function getAllClasses(client, database) {
  return (dispatch, getState) => {
    const classes = getState().classes[database]

    if(classes /*&& Object.keys(classes).length > 0*/)
      return Promise.resolve()

    return client.query(q.Map(q.Paginate(Ref("classes")), clazz => q.Get(clazz))).then(
      result => dispatch(updateClassInfo(client, database, result.data))
    )
  }
}

export function getClassInfo(client, database, name) {
  return (dispatch, getState) => {
    const classes = getState().classes[database]

    if(classes && classes[name]) {
      dispatch(updateSelectedClass(database, name))
      return Promise.resolve()
    }

    return client.query(q.Get(q.Class(name))).then(result => {
      dispatch(updateClassInfo(client, database, result))
    }).then(() => {
      dispatch(updateSelectedClass(database, name))
    })
  }
}

export function updateIndexOfClass(clazz, database, indexes) {
  return {
    type: "UPDATE_INDEX_OF_CLASS",
    database: database,
    clazz: clazz,
    indexes: indexes
  }
}

export function queryForIndexes(client, database, classRef) {
  return (dispatch, getState) => {
    const name = classRef.id
    const classes = getState().classes[database]

    if(classes && classes[name] && classes[name].indexes) {
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
      dispatch(updateIndexOfClass(name, database, result.data))
    })
  }
}

