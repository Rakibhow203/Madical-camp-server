const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');




const port = process.env.PORT || 5000;



// middleware
app.use(cors());
app.use(express.json());






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





async function run() {
  try {

    // user data save 
       const userCollection = client.db("MedicalCamp").collection("users");
    // all data loaded collection
    const campCollection = client.db("MedicalCamp").collection("AllCampData");
    const participantCollection = client.db("MedicalCamp").collection("Participants");
   const organizerCollection = client.db("MedicalCamp").collection("Organizers");

    
    
    


     // jwt related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
    })

// middlewares 
    const verifyToken = (req, res, next) => {
      console.log('inside verify token', req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
      })
    }

 // use verify admin after verifyToken
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === 'admin';
      if (!isAdmin) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    }

    // users related api
 app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });


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
      // console.log(participant);
      const result = await participantCollection.insertOne(addAll);
      res.send(result);
  });

    
       // Add camp data 
 app.post('/allData', async (req, res) => {
      const addAll = req.body;
      const result = await campCollection.insertOne(addAll);
      res.send(result);
  });

    //get allParticipant data

    app.get('/allParticipantDash', async (req, res) => {
      const result = await participantCollection.find().toArray();
      res.send(result);
    });
    
  app.get('/allParticipant', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await participantCollection.find(query).toArray();
      res.send(result);
    });




let camps = []; // In-memory data storage for simplicity

// Fetch all camps
app.get('/allData', (req, res) => {
  res.status(200).json(camps);
});

// Get camp by ID
app.get('/allData/:campId', (req, res) => {
  const camp = camps.find(c => c.id === req.params.campId);
  if (camp) {
    res.status(200).json(camp);
  } else {
    res.status(404).json({ message: 'Camp not found' });
  }
});

// Add a new camp
app.post('/allData', (req, res) => {
  const newCamp = { ...req.body, id: Date.now().toString() };
  camps.push(newCamp);
  res.status(201).json(newCamp);
});

// Update a camp by ID
app.put('/update-camp/:campId', (req, res) => {
  const campIndex = camps.findIndex(c => c.id === req.params.campId);
  if (campIndex > -1) {
    camps[campIndex] = { ...camps[campIndex], ...req.body };
    res.status(200).json(camps[campIndex]);
  } else {
    res.status(404).json({ message: 'Camp not found' });
  }
});

// Delete a camp by ID
 app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await campCollection.deleteOne(query);
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