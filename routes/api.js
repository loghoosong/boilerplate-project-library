/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const mongoose = require("mongoose");

module.exports = function (app) {
  const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    comments: [String],
  }, {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      }
    }
  });
  const BookModel = mongoose.model('BookModel', bookSchema);

  app.route('/api/books')
    .get(function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      BookModel.aggregate([
        {
          $addFields: {
            commentcount: { $size: '$comments' }
          }
        }, {
          $unset: ['comments', '__v']
        }
      ]).then(
        data => { res.json(data); },
        err => { console.error(err); }
      );
    })

    .post(function (req, res) {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) {
        res.send('missing required field title');
        return;
      }

      const book = new BookModel({ title });
      book.save().then(
        doc => {
          res.json({
            title: doc.title,
            _id: doc._id,
          });
        },
        err => { console.error(err); }
      );
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
      BookModel.deleteMany({}).then(
        () => { res.send('complete delete successful'); },
        err => { console.error(err); }
      );
    });



  app.route('/api/books/:id')
    .get(function (req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      BookModel.findById(bookid).then(
        data => {
          if (data) {
            res.json(data);
          } else {
            res.send('no book exists');
          }
        },
        err => { console.error(err); }
      );
    })

    .post(function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!comment) {
        res.send('missing required field comment');
        return;
      }

      BookModel.findById(bookid).then(
        doc => {
          if (doc) {
            doc.comments.push(comment);
            doc.save().then(
              saved => { res.json(saved) },
              err => { console.error(err); }
            );
          } else {
            res.send('no book exists');
          }
        },
        err => { console.error(err) },
      );

    })

    .delete(function (req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      BookModel.findByIdAndRemove(bookid).then(
        doc => {
          if (doc) {
            res.send('delete successful');
          } else {
            res.send('no book exists');
          }
        },
        err => { console.error(err) }
      );
    });

};
