const express = require('express');
const router = express.Router();
const { client } = require('./db');
const { secret } = require('./config');
const jwt = require('jsonwebtoken');
const fs = require('fs');


router.get('/auth', (req, res) => {
    fs.createReadStream("../frontend/auth.html").pipe(res);
  })

router.post('/login', async (req, res) => {
    try {
        const { name, password } = req.body;
        const user = await client
          .db('users')
          .collection('users')
          .findOne({ name });
    
        if (!user) {
          return res.status(401).json({ error: `User "${name}" not found.`});
        }
        if (user.password !== password) {
          return res.status(401).json({ error: 'Invalid password' });
        }
        const token = generateAccessToken(user._id);
        return res.json({ token });
      } catch (error) {
        res.status(500).json({ error: 'Failed to log in' });
      }
    });

router.post('/registration', async (req, res) => {
    try {
        const { newname, newpassword } = req.body; 
        if (!newname || !newpassword) {
          return res.status(400).json({ error: 'Username and password are required' });
        }
        const existingUser = await client
          .db('users')
          .collection('users')
          .findOne({ name: newname });
        if (existingUser) {
          return res.status(400).json({ error: 'User with this username already exists. Please choose another username.' });
        }
        const user = await client
          .db('users')
          .collection('users')
          .insertOne({ name: newname, password: newpassword });
        const token = generateAccessToken(user.insertedId);
        return res.json({ token, message: "You are signed up" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to sign up' });
      }      });
    
      const generateAccessToken = (id) =>{
        const payload = {
          id
        }
        return jwt.sign(payload, secret, {expiresIn: '5min'})
      }
      module.exports = router;
