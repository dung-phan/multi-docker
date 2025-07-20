// worker/index.js
const redis = require('redis');
const config = require('./config');

// Client for subscribing to messages
const redisSubscriber = redis.createClient({
    socket: {
        host: config.redisHost,
        port: config.redisPort
    }
});

// Client for setting values (normal Redis operations)
const redisClient = redis.createClient({
    socket: {
        host: config.redisHost,
        port: config.redisPort
    }
});

async function connectRedis() {
    await redisSubscriber.connect();
    await redisClient.connect();
    console.log('Worker connected to Redis');
}

function fibonacci(index) {
    if (index < 2) return 1;
    return fibonacci(index - 1) + fibonacci(index - 2);
}

async function startWorker() {
    await connectRedis();

    // Subscribe to the 'insert' channel using the subscriber client
    await redisSubscriber.subscribe('insert', async (index) => {
        console.log(`Calculating fibonacci for index: ${index}`);
        const result = fibonacci(parseInt(index));

        // Store the calculated result using the regular client
        await redisClient.hSet('values', index, result.toString());
        console.log(`Stored fibonacci(${index}) = ${result}`);
    });
}

// Error handlers
redisSubscriber.on('error', (err) => {
    console.error('Redis Subscriber Error:', err);
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down worker');
    await redisSubscriber.quit();
    await redisClient.quit();
    process.exit(0);
});

startWorker().catch(console.error);
