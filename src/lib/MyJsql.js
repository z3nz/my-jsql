export default class MyJsql {
  constructor (con) {
    this.con = con
    this.clear()
  }

  i () {
    this.each(arguments, (index, arg) => {
      switch (typeof arg) {
        case 'object':
          this.Q.keys = Object.keys(arg)
          this.Q.values = Object.values(arg)
          break
      }
    })
    this.Q.type = 'insert'
    return this
  }

  s () {
    let keys = ['*']
    this.each(arguments, (index, arg) => {
      switch (typeof arg) {
        case 'object':
          keys = arg
          break
      }
    })
    this.Q.type = 'select'
    this.Q.keys = keys
    this.Q.values = []
    return this
  }

  u () {
    this.each(arguments, (index, arg) => {
      switch (typeof arg) {
        case 'object':
          this.Q.keys = Object.keys(arg)
          this.Q.values = Object.values(arg)
          break
      }
    })
    this.Q.type = 'update'
    return this
  }

  d () {
    this.Q.type = 'delete'
    this.Q.values = []
    return this
  }

  t (table) {
    // TODO - need to be able to pass an object of table names for joins (maybe an array too?)
    this.Q.table = table
    return this
  }

  w () {
    let conditions = []
    let conditionValues = []
    this.each(arguments, (index, arg) => {
      switch (typeof arg) {
        case 'string':
          conditions.push(arg)
          break
        case 'object':
          if (Array.isArray(arg)) {
            conditionValues = arg
          } else {
            let section = []
            this.each(arg, (key, value) => {
              if (typeof value === 'object' && value !== null) {
                this.each(value, (k, v) => {
                  /* istanbul ignore else */
                  if (k.toLowerCase() === 'not') {
                    if (v === null) {
                      section.push(`${key} is not null`)
                    } else {
                      section.push(`not ${key}=?`)
                      conditionValues.push(v)
                    }
                  }
                })
              } else if (value === null) {
                section.push(`${key} is null`)
              } else {
                section.push(`${key}=?`)
                conditionValues.push(value)
              }
            })
            conditions.push(section.join(' and '))
          }
          break
      }
    })
    this.Q.conditions = conditions
    this.Q.conditionValues = conditionValues
    return this
  }

  l () {
    let limit = ''
    let offset = ''
    this.each(arguments, (index, arg) => {
      if (parseInt(index)) {
        offset = arg
      } else {
        limit = arg
      }
    })
    this.Q.limit = limit
    this.Q.offset = offset
    return this
  }

  o () {
    let orderBy = []
    this.each(arguments, (index, arg) => {
      switch (typeof arg) {
        case 'object':
          this.each(arg, (k, v) => {
            orderBy.push(`${k} ${v}`)
          })
          break
      }
    })
    this.Q.orderBy = orderBy
    return this
  }

  run () {
    let query = this.getQuery()
    let values = this.getValues()
    let callback

    this.each(arguments, (index, arg) => {
      switch (typeof arg) {
        case 'string':
          query = arg
          break
        case 'object':
          values = arg
          break
        case 'function':
          callback = arg
          break
      }
    })

    let queryArgs = [query]
    if (values.length) queryArgs.push(values)
    /* istanbul ignore else */
    if (callback) queryArgs.push(callback)

    this.con.query(...queryArgs)
  }

  clear () {
    this.Q = {
      conditionValues: [],
      conditions: [],
      keys: [],
      limit: '',
      offset: '',
      orderBy: [],
      table: '',
      type: '',
      values: []
    }
    return this
  }

  getQuery () {
    let query = ''
    switch (this.Q.type) {
      case 'insert':
        query = `insert into ${this.Q.table} (${this.Q.keys.join()}) values (${Array(this.Q.values.length).fill('?').join()})`
        break
      case 'select':
        query = `select ${this.Q.keys.join()} from ${this.Q.table}${this.Q.conditions.length ? ` where (${this.Q.conditions.join(') or (')})` : ''}${this.Q.orderBy.length ? ` order by ${this.Q.orderBy.join()}` : ''}${this.Q.limit ? ` limit ${this.Q.limit}` : ''}${this.Q.offset ? `,${this.Q.offset}` : ''}`
        break
      case 'update':
        query = `update ${this.Q.table} set ${this.Q.keys.map((x) => { return `${x}=?` }).join()}${this.Q.conditions.length ? ` where (${this.Q.conditions.join(') or (')})` : ''}`
        break
      case 'delete':
        query = `delete from ${this.Q.table}${this.Q.conditions.length ? ` where (${this.Q.conditions.join(') or (')})` : ''}`
        break
    }
    return query
  }

  getValues () {
    return this.Q.values.concat(this.Q.conditionValues)
  }

  each (a, f) {
    if (Array.isArray(a)) {
      for (let i = 0; i < a.length; i++) {
        f(i, a[i])
      }
    } else {
      let k = Object.keys(a)
      for (let i = 0; i < k.length; i++) {
        f(k[i], a[k[i]])
      }
    }
  }
}
