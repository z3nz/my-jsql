import mysql from "mysql"

export default class MyJsql {
	constructor(config) {
		this.config = config;
		this.con = mysql.createConnection(this.config);
		this.Q = {};
	}

	start(args) {
		this.con.connect(...arguments);
	}

	stop(args) {
		this.con.end(...arguments);
	}

	i(args) {
		this.each(arguments, (index, arg) => {
			switch (typeof arg) {
				case 'string':
					this.Q.table = arg;
					break;
				case 'object':
					this.Q.keys = Object.keys(arg);
					this.Q.values = Object.values(arg);
					break;
			}
		});
		this.Q.type = 'insert';
		return this;
	}

	s(args) {
		let keys = ['*'];
		this.each(arguments, (index, arg) => {
			switch (typeof arg) {
				case 'object':
					keys = arg;
					break;
				case 'string':
					this.Q.table = arg;
					break;
			}
		});

		this.Q.type = 'select';
		this.Q.keys = keys;
		this.Q.values = [];
		return this;
	}

	u(args) {
		this.each(arguments, (index, arg) => {
			switch (typeof arg) {
				case 'string':
					this.Q.table = arg;
					break;
				case 'object':
					this.Q.keys = Object.keys(arg);
					this.Q.values = Object.values(arg);
					break;
			}
		});

		this.Q.type = 'update';
		return this;
	}

	d(args) {
		let conditions = [];
		this.each(arguments, (index, arg) => {
			switch (typeof arg) {
				case 'string':
					this.Q.table = arg;
					break;
			}
		});

		this.Q.type = 'delete';
		this.Q.values = [];
		return this;
	}

	t(table) {
		// TODO - need to be able to pass an object of table names for joins (maybe an array too?)
		this.Q.table = table;
		return this;
	}

	// NOTE: this where function only uses the = operator, if another operator is needed, you will have
	// to build the query manually
	w(args) {
		let conditions = [],
			values = [];
		this.each(arguments, (index, arg) => {
			let section = [];
			this.each(arg, (key,value) => {
				// if the key is 'not' then go through the nested object with the not condition
				if (key.toLowerCase()==='not') {
					this.each(value, (k, v) => {
						if (v===null) {
							section.push(`${k} is not null`)
						} else {
							section.push(`not ${k}=?`);
							values.push(v);
						}
					});
				} else {
					if (value===null) {
						section.push(`${key} is null`)
					} else {
						section.push(`${key}=?`);
						values.push(value);
					}
				}
			});
			conditions.push(section.join(' and '));
		});
		this.Q.conditions = conditions;
		this.Q.condition_values = values;
		return this;
	}

	run(args) {
		let query,
			callback,
			values = this.Q.values || [];

		this.each(arguments, (index, arg) => {
			switch (typeof arg) {
				case 'string':
					query = arg;
					break;
				case 'object':
					values = arg;
					break;
				case 'function':
					callback = arg;
					break;
			}
		});

		if (!query) {
			query = this.buildQuery();
		}

		let queryArgs = [query];
		if (values.length) {
			if (this.Q.condition_values) {
				values = values.concat(this.Q.condition_values);
			}
			queryArgs.push(values);
		} else if (this.Q.condition_values) {
			queryArgs.push(this.Q.condition_values);
		}
		if (callback) {
			queryArgs.push(callback);
		}

		this.con.query(...queryArgs);
	}

	buildQuery() {
		let query = '';
		switch (this.Q.type) {
			case 'insert':
				query = `insert into ${this.Q.table} (${this.Q.keys.join()}) values (${Array(this.Q.values.length).fill('?').join()})`;
				break;
			case 'select':
				query = `select ${this.Q.keys.join()} from ${this.Q.table}${this.Q.conditions.length ? ` where (${this.Q.conditions.join(') or (')})` : ''}`;
				break;
			case 'update':
				query = `update ${this.Q.table} set ${this.Q.keys.map((x) => {return `${x}=?`}).join()}${this.Q.conditions.length ? ` where (${this.Q.conditions.join(') or (')})` : ''}`;
				break;
			case 'delete':
				query = `delete from ${this.Q.table}${this.Q.conditions.length ? ` where (${this.Q.conditions.join(') or (')})` : ''}`
				break;
		}
		return query;
	}

	each(a, f) {
		if (Array.isArray(a)) {
			for (let i=0; i<a.length; i++) {
				f(i, a[i]);
			}
		} else {
			let k = Object.keys(a);
			for (let i=0; i<k.length; i++) {
				f(k[i], a[k[i]]);
			}
		}
	}
}