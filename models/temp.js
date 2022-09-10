import { MongoClient } from 'mongodb';
import {
  ObjectId
} from 'mongodb';

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const agg = [
  {
    '$match': {
      'product': new ObjectId('6316004063f8ad625d45a83d')
    }
  }, {
    '$group': {
      '_id': '$product', 
      'averageRating': {
        '$avg': '$rating'
      }, 
      'numOfReviews': {
        '$sum': 1
      }
    }
  }
];

const client = await MongoClient.connect(
  'mongodb+srv://mainlycricket:12345@nodeexperssprojects.h7e3nte.mongodb.net/test',
  { useNewUrlParser: true, useUnifiedTopology: true }
);
const coll = client.db('ECOMMERCE').collection('reviews');
const cursor = coll.aggregate(agg);
const result = await cursor.toArray();
await client.close();