/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function (done) {
    chai.request(server)
      .get('/api/books')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function () {
    this.timeout(5000);
    let idToDelete, idToUpdate;
    before(function () {
      chai.request(server)
        .post('/api/books')
        .send({
          title: 'book to delete'
        })
        .then(
          res => { idToDelete = res.body._id },
          err => { console.error(err); }
        );
    });

    suite('POST /api/books with title => create book object/expect book object', function () {

      test('Test POST /api/books with title', function (done) {
        chai.request(server)
          .post('/api/books')
          .send({
            title: 'loghoosong test book'
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, 'title', 'Book should contains title');
            assert.property(res.body, '_id', 'Book should contains _id');
            idToUpdate = res.body._id;
            done();
          });
      });

      test('Test POST /api/books with no title given', function (done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field title', 'missing required field title');
            done();
          });
      });

    });


    suite('GET /api/books => array of books', function () {

      test('Test GET /api/books', function (done) {
        chai.request(server)
          .get('/api/books')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
            assert.property(res.body[0], 'title', 'Books in array should contain title');
            assert.property(res.body[0], '_id', 'Books in array should contain _id');
            done();
          });
      });

    });


    suite('GET /api/books/[id] => book object with [id]', function () {

      test('Test GET /api/books/[id] with id not in db', function (done) {
        chai.request(server)
          .get('/api/books/64076208d0253a0a9c350936')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db', function (done) {
        chai.request(server)
          .get('/api/books/' + idToUpdate)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body._id, idToUpdate, '_id should be same in url');
            assert.property(res.body, 'title', 'Book should contain title');
            assert.property(res.body, 'comments', 'Book should contain comments');
            assert.equal(res.body.comments.length, 0, 'Book should have no comments');
            done();
          });
      });

    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function () {

      test('Test POST /api/books/[id] with comment', function (done) {
        chai.request(server)
          .post('/api/books/' + idToUpdate)
          .send({ comment: 'update comment' })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body._id, idToUpdate, '_id should be same in url');
            assert.property(res.body, 'title', 'Book should contain title');
            assert.property(res.body, 'comments', 'Book should contain comments');
            assert.equal(res.body.comments.length, 1, 'Book should have 1 comments');
            done();
          });
      });

      test('Test POST /api/books/[id] without comment field', function (done) {
        chai.request(server)
          .post('/api/books/' + idToUpdate)
          .send({})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field comment', 'missing required field comment');
            done();
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function (done) {
        chai.request(server)
          .post('/api/books/64076208d0253a0a9c350936')
          .send({ comment: 'update comment' })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists', 'no book exists');
            done();
          });
      });

    });

    suite('DELETE /api/books/[id] => delete book object id', function () {

      test('Test DELETE /api/books/[id] with valid id in db', async function () {
        const resDel = await chai.request(server)
          .delete('/api/books/' + idToDelete);
        assert.equal(resDel.status, 200);
        assert.equal(resDel.text, 'delete successful', 'delete successful');

        const resGet = await chai.request(server)
          .get('/api/books/' + idToDelete);
        assert.equal(resGet.status, 200);
        assert.equal(resGet.text, 'no book exists', 'book should be deleted')
      });

      test('Test DELETE /api/books/[id] with  id not in db', function (done) {
        chai.request(server)
          .delete('/api/books/64076208d0253a0a9c350936')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists', 'no book exists');
            done();
          });
      });

    });

  });

});
