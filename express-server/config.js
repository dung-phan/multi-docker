module.exports = {
	// Redis Server configuration
	redisHost: process.env.REDIS_HOST,
	redisPort: process.env.REDIS_PORT,


	// PostgreSQL configuration
	pgUser: process.env.PG_USER,
	pgHost: process.env.PG_HOST,
	pgDatabase: process.env.PG_DATABASE,
	pgPassword: process.env.PG_PASSWORD,
}
