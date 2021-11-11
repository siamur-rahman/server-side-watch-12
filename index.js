
const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config()
const cors = require('cors');


;

const ObjectId = require('mongodb').ObjectId;
const app = express();

//middlewere
app.use(cors());
app.use(express.json())

const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wrybq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
   try {
      await client.connect();


      const database = client.db("watch");
      const servicesCollection = database.collection("services");
      const ordersCollection = database.collection("orders");
      const userCollection = database.collection("user");


      //get api
      app.get('/services', async (req, res) => {
         const cursor = servicesCollection.find({});
         const services = await cursor.toArray();
         res.send(services);
      })

      app.get('/user', async (req, res) => {
         const cursor = ordersCollection.find({});
         const services = await cursor.toArray();
         res.send(services);
      })

      app.get('/user/:email', async (req, res) => {
         const email = req.params.email;
         const query = { email: email };
         const user = await userCollection.findOne(query);
         let isAdmin = false;
         if (user?.role === 'admin') {
            isAdmin = true;
         }
         res.json({ admin: isAdmin });
      })



      //get api single user
      app.get('/services/:id', async (req, res) => {
         const id = req.params.id;
         // console.log('load user with id', id);
         const query = { _id: ObjectId(id) };
         const service = await servicesCollection.findOne(query);
         res.send(service);

      })


      //post apii
      app.post('/services', async (req, res) => {
         const newUser = req.body;
         const result = await servicesCollection.insertOne(newUser);
         console.log('added user', result);
         res.json(result);

      })

      app.post('/user', async (req, res) => {
         const newUser = req.body;
         const result = await userCollection.insertOne(newUser);
         console.log('added user', result);
         res.json(result);

      })


      //put api

      app.put('/user', async (req, res) => {
         const user = req.body;
         const filter = { email: user.email };
         const options = { upsert: true };
         const updateDoc = { $set: user };
         const result = await userCollection.updateOne(filter, updateDoc, options);
         res.json(result);
      })

      app.put('/user/admin', async (req, res) => {
         const user = req.body;
         const filter = { email: user.email };
         const options = { upsert: true };
         const updateDoc = { $set: { role: 'admin' } };
         const result = await userCollection.updateOne(filter, updateDoc, options);
         res.json(result);
      })


      //delete api
      app.delete('/services/:id', async (req, res) => {

         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const result = await servicesCollection.deleteOne(query);

         res.json(result);
      })

   } finally {
      //   await client.close();
   }
}
run().catch(console.dir);





app.get('/', (req, res) => {
   res.send('running watch server')
});

app.listen(port, () => {
   console.log('running server  with watch', port)
})