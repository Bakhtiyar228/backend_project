const express = require('express');
const { connectToDb, getDb, client } = require('./db'); 
const { secret } = require('./config'); 
const path = require('path');
const fs = require('fs');
const PORT = 3000;
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const adminRouter = require('./adminRouter');
const authRouter = require('./authRouter');

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/images', express.static(path.join(__dirname, '../frontend/images')));
app.use('/fonts', express.static(path.join(__dirname, '../frontend/fonts')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));
app.use(express.json());
app.use(authRouter);
app.use(adminRouter);

let db;

connectToDb((err) => {
  if (!err) {
    app.listen(PORT, err => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Webpage runs on port ${PORT}`);
      }
    });
    db = getDb();
  } else {
    console.log(`There was an error: ${err}`);
    return;
  }
});

app.get('/', async (req, res) => {
  fs.createReadStream("../frontend/index.html").pipe(res);
});

app.get('/avatar', async (req, res) => {
  try {
    const username = req.query.username;
    const user = await client
      .db('users')
      .collection('users')
      .findOne({ name: username });
    if (!user || !user.avatar) {
    const newuser = await client
      .db('users')
      .collection('users')
      .findOne({ name: "default" });
     res.send(newuser.avatar);
    }
    else{
      res.send(user.avatar); 
    }
  } catch (error) {
    console.error('Error retrieving avatar:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/updateAvatar', async (req, res) => {
  try {
    const username = req.body.username;
    const avatar = req.body.avatar;
    await client
      .db('users')
      .collection('users')
      .updateOne({ name: username }, { $set: { avatar: avatar } });
    res.json({ message: 'Avatar updated successfully' });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

app.get('/getUserData', async (req, res) => {
  try {
      const username = req.query.username;
      const user = await client
      .db('users')
      .collection('users')
      .findOne({ name: username });
      if (!user) {
          return res.status(404).send('User data not found');
      }
      res.json(user.UserData);
  } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).send('Internal Server Error');
  }
});


app.post('/updateUserData', async (req, res) => {
  try {
    const username = req.body.username;
    const userData = req.body.userData;
    await client
      .db('users')
      .collection('users')
      .updateOne({ name: username }, { $set: { UserData: userData } });
    res.json({ message: 'Information updated successfully' });
  } 
   catch (error) {
      res.status(500).send('Internal Server Error');
  }
});


app.get('/getaboutme', async (req, res) => {
  try {
    const username = req.query.username;
    const user = await client
      .db('users')
      .collection('users')
      .findOne({ name: username });
    if (!user.aboutme) {
     res.send("No information");
    }
    else{
      res.send(user.aboutme); 
    }
  } catch (error) {
    console.error('Error retrieving information:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/updateAboutMe', async (req, res) => {
  try {
    const username = req.body.username;
    const newAboutMe = req.body.newAboutMe;
    await client
      .db('users')
      .collection('users')
      .updateOne({ name: username }, { $set: { aboutme: newAboutMe } });
    res.json({ message: 'Information updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update information' });
  }
});

app.post('/deleteAvatar', async (req, res) => {
  try {
    const username = req.body.username;
    await client
      .db('users')
      .collection('users')
      .updateOne({ name: username }, { $unset: { avatar: "" } });
    res.json({ message: 'Avatar deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete avatar' });
  }
});

app.get('/getDefaultAvatar', async (req, res) => {
  try {
    const defaultUser = await client
      .db('users')
      .collection('users')
      .findOne({ name: "default" });
     return res.send(defaultUser.avatar);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.post('contacts', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await client
      .db('contacts')
      .collection('subscribers')
      .insertOne({ email });
    res.status(201).json({ message: 'Email sent successfully', data: result.ops });
  } catch (error) {
    console.error('Error saving email:', error);
    res.status(500).json({ error: 'Failed to save email' });
  }
});

app.get('/searchpage', (req, res) => {
  fs.createReadStream("../frontend/searchpage.html").pipe(res);
});

app.post('/contact_us', async (req, res) => {
  try {
    const { name, email, phonenumber, message } = req.body;
    const result = await client
      .db('contacts')
      .collection('contact_us')
      .insertOne({ name, email, phonenumber, message });
    res.status(201).json({ message: 'We will answer you later !', data: result.ops });
  } catch (error) {
    console.error('Error saving email:', error);
    res.status(500).json({ error: 'There was error. Please tell authors!' });
  }
});

app.get('/about', (req, res) => {
  fs.createReadStream("../frontend/about.html").pipe(res);
})

app.post('/about', async (req, res) => {
  try {
    const id = "1";
    const about = await client
      .db('website_information')
      .collection('about_us')
      .findOne({ id });
    const text = about.text;
    return res.json({ text });
  } catch (error) {
    res.status(500).json({ error: 'Error occured' });
  }
});


app.get('/blog', (req, res) => {
  fs.createReadStream("../frontend/blog.html").pipe(res);
})

app.get('/categories', (req, res) => {
  fs.createReadStream("../frontend/categories.html").pipe(res);
})

app.get('/contact', (req, res) => {
  fs.createReadStream("../frontend/contact.html").pipe(res);
}) 

app.get('/profile', (req, res) => {
  fs.createReadStream("../frontend/profile.html").pipe(res);
})

app.get('/orderHistory', async (req, res) => {
  try {
      const user = client.db('orders').collection('total');
      const orderHistory = await user.find({ username: req.query.username }).toArray(); 
      res.json(orderHistory);
  } catch (error) {
      console.error('Error fetching order history:', error);
      res.status(500).json({ error: 'Failed to fetch order history' });
  }
});




