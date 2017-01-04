import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

export function updateClassInfo(result) {
  if(!Array.isArray(result))
    result = [result]

  return {
    type: "UPDATE_CLASS_INFO",
    result: result
  }
}

export function updateSelectedClass(name) {
  return {
    type: "UPDATE_SELECTED_CLASS",
    name: name
  }
}

export function fetchingClasses(fetching) {
  return {
    type: "FETCHING_CLASSES",
    fetching: fetching
  }
}

export function getAllClasses(client) {
  return (dispatch, getState) => {
    const classes = getState().classes

    if(classes.fetchingData || Object.keys(classes.byName || {}).length > 0)
      return Promise.resolve()

    dispatch(fetchingClasses(true))

    return client.query(q.Map(q.Paginate(Ref("classes")), clazz => q.Get(clazz)))
      .then(result => dispatch(updateClassInfo(result.data)))
      .then(() => dispatch(fetchingClasses(false)))
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
    const classes = getState().classes

    if(classes && classes.indexes && classes.indexes[name]) {
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

    return client.query(q.Map(allIndexes, index => q.Select(['name'], index)))
      .then(result => dispatch(updateIndexOfClass(name, result.data)))
  }
}

