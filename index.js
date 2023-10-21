const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello world");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASSWORD_DB}@cluster0.b2w59kw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const brandsCollection = client.db("phonesDB").collection("brands");
    const phonesCollection = client.db("phonesDB").collection("phones");
    const cartCollection = client.db("phonesDB").collection("mycart");
    app.get("/brands", async (req, res) => {
      const cursor = brandsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/phones/:brand", async (req, res) => {
      const brand = req.params.brand;
      console.log(brand);
      const query = { brand: brand };
      const cursor = phonesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/phones", async (req, res) => {
      const cursor = phonesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.post("/phones", async (req, res) => {
      const newProduct = req.body;
      const result = await phonesCollection.insertOne(newProduct);
      res.send(result);
    });
    app.get("/phone/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await phonesCollection.findOne(query);
      res.send(result);
    });
    app.put("/phone/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updatedPhone = req.body;
      const phone = {
        $set: {
          image: updatedPhone.image,
          name: updatedPhone.name,
          price: updatedPhone.price,
          rating: updatedPhone.rating,
          description: updatedPhone.description,
          brand: updatedPhone.brand,
          type: updatedPhone.type,
        },
      };
      const result = await phonesCollection.updateOne(filter, phone, option);
      res.send(result);
    });
    app.post('/mycart', async(req, res) => {
      const newCart = req.body
      const result = await cartCollection.insertOne(newCart)
      res.send(result)
    })
    app.get('/mycart', async(req, res)=> {
      const cursor = cartCollection.find()
      const result = await cursor.toArray()
      res.send(result)
})
app.delete('/mycart/:id', async(req, res) => {
  const id = req.params.id
  const query = {_id: new ObjectId(id)}
  const result = await cartCollection.deleteOne(query)
  res.send(result)
})

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
