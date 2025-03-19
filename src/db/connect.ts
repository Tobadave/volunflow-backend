const { MongoClient, ServerApiVersion } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI,  {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
   
(async () => {
    try {
        await client.connect();

        await client.db("admin").command({ ping: 1 }).then(()=> console.log("Pinged your deployment. You successfully connected to MongoDB!"));
    }finally {
        // await client.close();
    }
})().catch(console.dir); 

export default client.db("main");