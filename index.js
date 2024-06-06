const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');




const port = process.env.PORT || 5000;



// middleware
app.use(cors());
app.use(express.json());



// medical-camp
// V5NOVcMY-Sfaxg5ZF



// MongoDB connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6exc3xw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a new MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


// Create a MongoClient with a MongoClientOptions object to set the Stable API version


async function run() {
  try {
    // all data loaded collection
    const campCollection = client.db("MedicalCamp").collection("AllCampData");
    const participantCollection = client.db("MedicalCamp").collection("Participants");
    
    // Get all camp data
    app.get('/allData', async (req, res) => {
      const result = await campCollection.find().toArray();
      res.send(result);
    });

   // Register a participant for a camp
app.post('/api/register-participant', async (req, res) => {
      try {
        const participantInfo = req.body;
        await participantCollection.insertOne(participantInfo);

 // Update participant count for the camp
        await campCollection.updateOne(
          { _id: participantInfo.campId },
          { $inc: { participantCount: 1 } }
        );

 res.status(201).send('Participant registered successfully');
      } catch (error) {
        console.error(error);
        res.status(500).send('Error registering participant');
      }
    });







    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
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
  
  res.send('boss is sittingGGGGG')
})

app.listen(port, () => {
  console.log(`Bistro boss is sitting on port ${port}`);
})