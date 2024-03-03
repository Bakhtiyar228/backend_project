const express = require('express');
const fs = require('fs');
const router = express.Router();
const { client } = require('./db');

router.get('/admin', (req, res) => {
  fs.createReadStream("../frontend/admin.html").pipe(res);
});

router.get('/get_counts', async (req, res) => {
  try {
    const userCollection = client.db('users').collection('users');
    const orderCollection = client.db('orders').collection('total');
    const subscribersCollection = client.db('contacts').collection('subscribers');
    const userCount = await userCollection.countDocuments();
    const orderCount = await orderCollection.countDocuments();
    const subscribersCount = await subscribersCollection.countDocuments();
    const profit = await calculateProfit(orderCollection);
    const counts = {
      users_count: userCount,
      orders_count: orderCount,
      profit: profit,
      subscribers_count: subscribersCount
    };
    res.json(counts);
  } catch (error) {
    console.error('Error occurred while fetching counts:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/get_genres', async (req, res) => {
  const ordersCollection = client.db('orders').collection('total');
  try {
    const genresCounts = await ordersCollection.aggregate([
      { $match: { 'OrderData.genre': { $exists: true } } }, 
      { $group: { _id: '$OrderData.genre', count: { $sum: 1 } } }
    ]).toArray();
    const counts = genresCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    res.json(counts);
  } catch (error) {
    console.error('Error occurred while fetching counts:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/region_counts', async (req, res) => {
  const db = client.db('orders');
  try {
    const regionCounts = await db.collection('total').aggregate([
      { $group: { _id: '$OrderData.region', count: { $sum: 1 } } }
    ]).toArray();
    res.json(regionCounts);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

router.get('/orders', async (req, res) => {
  try {
    const ordersCollection = client.db('orders').collection('total');
    const allOrders = await ordersCollection.find({}).toArray();
    res.json(allOrders);
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
});

router.post('/cancelOrder', async (req, res) => {
  const ordersCollection = client.db('orders').collection('total');
  try {
    const orderId = req.body.orderId;
    await ordersCollection.updateOne(
      { 'OrderData.id': orderId },
      { $set: { 'OrderData.payment-status': 'Rejected', 'OrderData.delivery-status': 'Rejected' } }
    );
    res.status(200).send('Order cancelled successfully');
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).send('Failed to cancel order');
  }
});

router.get('/information', (req, res) => {
  fs.createReadStream("../frontend/admin/information.html").pipe(res);
});

router.get('/forms', (req, res) => {
  fs.createReadStream("../frontend/admin/forms.html").pipe(res);
});

router.get('/tables', (req, res) => {
  fs.createReadStream("../frontend/admin/tables.html").pipe(res);
});

async function calculateProfit(collection) {
  try {
    const result = await collection.aggregate([
      { $group: { _id: null, totalProfit: { $sum: "$OrderData.price" } } }
    ]).toArray();
    return result.length > 0 ? result[0].totalProfit : 0;
  } catch (error) {
    console.error('Error occurred while calculating profit:', error);
    return 0;
  }
}



module.exports = router;
