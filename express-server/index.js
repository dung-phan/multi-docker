const config = require('./config');

// Create an Express application
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres client setup
const { Pool } = require('pg');
const pgClient = new Pool({
	user: config.pgUser,
	host: config.pgHost,
	database: config.pgDatabase,
	password: config.pgPassword,
	port: 5432,
})
pgClient.on('error', () => console.error('Lost Postgres connection'));

pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch(err => console.error(err));

// Redis client setup
const redis = require('redis');

const redisClient = redis.createClient({
	socket: {
		host: config.redisHost,
		port: config.redisPort
	},
})
const redisPublisher = redisClient.duplicate();

async function connectRedis() {
    try {
        await redisClient.connect();
        await redisPublisher.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Redis connection error:', err);
    }
}

connectRedis();

// Express route handlers
app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.get('/values/all', async (req, res) => {
	try {
        const values = await pgClient.query('SELECT * FROM values');
        res.send(values.rows);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Error fetching values');
    }
});

app.get('/values/current', async (req, res) => {
	try {
        const values = await redisClient.hGetAll('values');
        res.send(values);
    } catch (err) {
        console.error('Redis error:', err);
        res.status(500).send('Error fetching values');
    }
})

app.post('/values', async (req, res) => {
    const index = req.body.index;

    if (parseInt(index) > 40) {
       return res.status(422).send('Index too high');
    }

    try {
        // Save to Redis
		await redisClient.hSet('values', index, 'Nothing yet!');
		await redisPublisher.publish('insert', index);

        // Save to Postgres
        await pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

        res.send({ working: true });
    } catch (err) {
        console.error('Error saving value:', err);
        res.status(500).send('Error saving value');
    }
});

app.listen(5000, () => {
	console.log('Listening on port 5000...');
})
