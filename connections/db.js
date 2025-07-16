import {connect} from 'mongoose';


export const connectToDatabase = async () => {
    console.log("Connecting to database...", process.env.MONGODB_URI);
    connect(`${process.env.MONGODB_URI}`,{
        dbName: 'task01',
    }).then((conn)=>{
        console.log(`Database connected successfully: ${conn.connection.host}`);
    }).catch((err)=>{
        console.error(`Database connection failed: ${err.message}`);
    });
}