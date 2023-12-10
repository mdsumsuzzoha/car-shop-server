const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@pheroprojectdbcluster.qyoezfv.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect((error) => {
            if (error) {
                console.log(error);
                return;
            }
        });


        const productsCollection = client.db("productsDB").collection("products");

        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find()
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/products/:id', async (req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result =await productsCollection.findOne(query);
            res.send(result);
        })

        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            // console.log('new product', product);
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);

        })

        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateProduct = req.body;
            const product = {
                $set: {
                    pName: updateProduct.pName,
                    bName: updateProduct.bName,
                    pType: updateProduct.pType,
                    pPrice: updateProduct.pPrice,
                    pDesc: updateProduct.pDesc,
                    pRating: updateProduct.pRating,
                    pImage: updateProduct.pImage,
                },
            };
            const result = await productsCollection.updateOne(filter, product, options);
            res.send(result);
        })

        app.delete('/products/:id', async (req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('CarShopProduct server is running')
})

app.listen(port, () => {
    console.log(`CarShopProduct server is running in port: ${port}`)
})