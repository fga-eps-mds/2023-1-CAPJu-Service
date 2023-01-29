import dotenv from 'dotenv';

dotenv.config();

const HOST = process.env.POSTGRES_HOST || '0.0.0.0';
const PORT = process.env.POSTGRES_PORT || 5432;
const DATABASE = process.env.POSTGRES_DATABASE || 'postgres';

export default  {
	development: {
		dialect: "postgres",
		username: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		database: DATABASE,
		host: HOST,
		port: PORT
	},
	test: {
		dialect: "postgres",
		username: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		// database: "test",
		// host: HOST,
		database: process.env.POSTGRES_DATABASE,
		host: "0.0.0.0",
		port: PORT
    },
    production: {
		dialect: "postgres",
		username: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		database: DATABASE,
		host: HOST,
		port: PORT
	}
};
