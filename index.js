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


// Middleware to authenticate organizer
// const authenticateOrganizer = (req, res, next) => {
//   // In a real-world application, you'd verify the organizer's identity
//   // Here, we'll mock the authentication and set a dummy organizer ID
//   req.organizerId = req.headers['organizer-id']; // Normally, you'd use a token or session to identify the user
//   if (!req.organizerId) {
//     return res.status(401).send('Unauthorized');
//   }
//   next();
// };





async function run() {
  try {

    // user data save 
       const userCollection = client.db("MedicalCamp").collection("users");
    // all data loaded collection
    const campCollection = client.db("MedicalCamp").collection("AllCampData");
    const participantCollection = client.db("MedicalCamp").collection("Participants");
   const organizerCollection = client.db("MedicalCamp").collection("Organizers");

    
    // users related api

    app.post('/users', async (req, res) => {
      const userInfo = req.body;
      const query = { email: userInfo.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null });
      }
      const result = await userCollection.insertOne(userInfo);
      res.send(result);
    })
    
    
    
    
    // Get all camp data
    app.get('/allData', async (req, res) => {
      const result = await campCollection.find().toArray();
      res.send(result);
    });



   // Register a participant for a camp
 app.post('/participant', async (req, res) => {
      const addAll = req.body;
      console.log(participant);
      const result = await participantCollection.insertOne(addAll);
      res.send(result);
  });

    

       app.get('/allParticipant', async (req, res) => {
      const result = await participantCollection.find().toArray();
      res.send(result);
    });
    






// Get organizer profile
    app.get('/organizer/profile',  async (req, res) => {
      try {
        const organizerId = req.organizerId;
        const organizer = await organizerCollection.findOne({ _id: new ObjectId(organizerId) });
        if (!organizer) {
          return res.status(404).send('Organizer not found');
        }
        res.send(organizer);
      } catch (error) {
        console.error('Error fetching organizer profile:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    // Update organizer profile
    app.put('/organizer/profile',  async (req, res) => {
      try {
        const organizerId = req.organizerId;
        const { name, email, phone, image } = req.body;
        
        const updatedProfile = {
          name,
          email,
          phone,
          image
        };

        const result = await organizerCollection.updateOne(
          { _id: new ObjectId(organizerId) },
          { $set: updatedProfile }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send('Organizer not found');
        }

        const updatedOrganizer = await organizerCollection.findOne({ _id: new ObjectId(organizerId) });
        res.send(updatedOrganizer);
      } catch (error) {
        console.error('Error updating organizer profile:', error);
        res.status(500).send('Internal Server Error');
      }
    });













    // Connect the client to the server	
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