/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

var DB;
MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
  if (err) {
    console.log('Database error: ' + err)
  } 
  else {
    console.log('Successful database connection');
    DB = db;
  }
});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      DB.collection('books').find({}).toArray((err, doc) => {        
        let arr = [];
        if (!err && doc) {
          doc.map((e) => {
            arr = [...arr, {_id: e._id, title: e.title, commentcount: e.comments.length}]
          });
        }
        res.json(arr);
      })    
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      var title = req.body.title;
      if (title) {
        DB.collection('books').insertOne(
          {title: title, comments: []}, (err, doc) => {
            if (!err) {
              res.json(doc.ops[0])
            } else {
            res.type('txt').send('error');
            }
          }
        )
      } else {
        res.type('txt').send('missed title');
      }     
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      DB.collection('books').drop({}, (err, data) => {
        if (!err) {
          res.type('txt').send('complete delete successful');
        } else {
          res.type('txt').send('db is empty');
        }
      })
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      if (ObjectId.isValid(bookid)) {
        DB.collection('books').findOne({ _id: ObjectId(bookid) }, (err, book) => {
          if (!err && book) {
            res.json(book);
          } else {
            res.type('txt').send('no book exists');
          }
        })
      } else {
        res.type('txt').send('invalid id');
      }
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      if (ObjectId.isValid(bookid)) {
        DB.collection('books').updateOne(
          {_id: ObjectId(bookid)},
          { $push: {comments: comment} }
        )
        res.redirect('/api/books/' + req.params.id);
      } else {
        res.type('txt').send('invalid id');
      }
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      if (ObjectId.isValid(bookid)) {
        DB.collection('books').deleteOne({_id: ObjectId(bookid)}, (err, data) => {
          if (!err) {
            res.type('txt').send('delete successful');
          } else {
            res.type('txt').send('no book exists');
          }
        });        
      }
      //if successful response will be 'delete successful'
    });

  
};