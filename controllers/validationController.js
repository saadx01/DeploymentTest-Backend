import { errorHandler } from "../middleware/errorHandler.js";
import { AppError } from "../utils/AppError.js";
import logger from "../utils/logger.js";
import redisClient from "../utils/redisClient.js";



export const getData = async (req,res,next)=>{
    try{
        await redisClient.set("test2","0",{
            EX: 60, // Set expiration time to 60 seconds
            NX: true // Only set the key if it does not already exist
        });
        await redisClient.incrBy("test2",100);
        console.log(await redisClient.get("test2"))
        console.log("time remaining",await redisClient.ttl("test2"))

    //     await redisClient.set("test","toyota",{
    //         EX:60,
    //         NX:true
    //     });
    //     const res1 = await redisClient.get("test");
    //     console.log("Redis value for test ", res1);

    //      await redisClient.set("test", "honda");
    //     const res2 = await redisClient.get("test");
    //     console.log("redis value for test after update", res2);


    // await redisClient.del("tets")


        res.status(200).json({
            message: "Data fetched successfully",
            data: "Sample Data",
            //redisValue: await redisClient.get("test2")
        });
        // logger.error("This is an error message");
        // return next(new AppError("This is a test error", 500))
        
        // throw new Error("This is a test error");
        // res.status(200).json({message: "Data fetched successfully", data: "Sample Data"});

        // properly handle error here using logger
        
        // logger.error("This is an error message");
        //show error in exception file
        // console.log(photo.hello)
        // logger.info("This is a regular info message"); // goes to combined.log
        // logger.warn("This is a warning");              // goes to combined.log
        // logger.error("This is a manual error");        // goes to error.log + combined.l
        // Promise.reject("Manual unhandled rejection");
        // throw new Error("This is an uncaught exception");
        // return next(new AppError("This is an error message", 500));
        // res.status(200).json({message: "Data fetched successfully", data: "Sample Data"});

    }
    catch(err){
          console.log("🔍 Native Error keys:", Object.getOwnPropertyNames(err));

    //    return next(new AppError(err.message, 500));
        console.error(err.message);
        res.status(500).json({message: "Internal Server Error",
            properties: Object.getOwnPropertyNames(err),
        });
    }
}