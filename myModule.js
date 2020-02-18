var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


exports.updateDb = function (email, name, message, database, collection)
{
    console.log("test")
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db(database);
        var query = { email: `${email}` };
        dbo.collection(collection).find(query).toArray(function (err, result) {
          if (err) throw err;
          console.log("DEBUG")
          console.log(result);
          if (result.length!=0) {
            var newvalues = { $set: { name: `${name}`, message: `${message}` } };
            dbo.collection(collection).updateOne(query, newvalues, function (err, res) {
              if (err) throw err;
              console.log("1 document updated");
              db.close();
            });
          } else {
            var myobj = { name: `${name}`, email: `${email}`, message: `${message}`};
            dbo.collection(collection).insertOne(myobj, function (err, res) {
              if (err) throw err;
              console.log("1 document inserted");
              db.close();
            });
          }
        });
      });
};

exports.updateUserDb = function (user, database, collection)
{
    console.log("test")
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db(database);
        var query = { name: `${user.name}` };
        dbo.collection(collection).find(query).toArray(function (err, result) {
          if (err) throw err;
          console.log("DEBUG")
          console.log(result);
          if (result.length!=0) {
              db.close();
              return;
          } else {
            dbo.collection(collection).insertOne(user, function (err, res) {
              if (err) throw err;
              console.log("1 document inserted");
              db.close();
            });
          }
        });
      });
};

exports.getDataFromDb = function (query, collection, database){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(database);
        dbo.collection(collection).find(query).toArray(function(err, result) {
          if (err) return err;
          console.log(result);
          db.close();
          return result;
        });
      });
      return {}
}