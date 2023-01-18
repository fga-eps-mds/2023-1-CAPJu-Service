export default  {
	development: {
		dialect: "postgres",
		username: 'postgres',
		password: 'postgre',
		database: 'postgres',
		host: '0.0.0.0',
		port: 5432
	},
	test: {
		database: "db",
		dialect: "sqlite",
		storage: "test-db.sqlite3"
    },
    production: {
		dialect: "postgres",
		username: 'postgres',
		password: 'postgre',
		database: 'postgres',
		host: '0.0.0.0',
		port: 5432
	}
};
