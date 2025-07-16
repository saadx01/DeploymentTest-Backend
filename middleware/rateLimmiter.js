import redisClient from "../utils/redisClient.js";


export const rateLimitter =({limit, timer, key}) => async (req, res, next) => {
    // write logic according to redis using my current ip address
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const fullkey = `request_count:${clientIp}-${key}`;
    const requestCount = await redisClient.incr(fullkey); // Increment the request count for the client IP

    if (requestCount === 1) {
        await redisClient.expire(fullkey, timer); // Set expiration time for the fullkey to 60
    }


    if (requestCount > limit) {
        const timeRemaining = await redisClient.ttl(fullkey); // Get the time remaining for the key
        return res.status(429).json({ error: `Too many requests from IP: ${clientIp}. Time remaining: ${timeRemaining} seconds` });
    }
    next(); // Proceed to the next middleware or route handler
}