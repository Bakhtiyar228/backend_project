const { MongoClient, ServerApiVersion } = require('mongodb');
const URL = "mongodb+srv://Bakhtiyar:mongo@cluster0.qkzth0h.mongodb.net/?retryWrites=true&w=majority";

let dbConnection;
const client = new MongoClient(URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

module.exports = {
  client,  
  connectToDb: async (cb) => {
    await client
      .connect()
      .then(async (client) => {
        await client.db("admin").command({ ping: 1 });
        console.log('Connected successfully to MongoDB!');
        dbConnection = client.db();
        return cb();
      })
      .catch((err) => { return cb(err); })
  },
  getDb: () => dbConnection,
};
