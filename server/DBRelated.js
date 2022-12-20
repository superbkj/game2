
const { MongoClient, ServerApiVersion } = require('mongodb');

const config = require("../config.js");

const uri = config.uri;

function connectToCluster() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
  
  return client.connect()
  .then(() => {
    console.log("Connected to cluster");
    return client;
  })
  .catch(err => console.error(err));
}

function connectToCollection(client) {
  const collection = client.db("myGame").collection("accounts");
  console.log("Connected to collection");
  return collection;
}

function getResultArray(collection, query) {
  return Promise.resolve(collection.find(query))
  .then(result => {
    console.log("search done")
    return result.toArray();
  });
}

//USERS[data.username] === data.password
function isValidPassword(data) {
  let client;
  
  return connectToCluster()
  .then(_client => {
    client = _client;
    return connectToCollection(client)
  })
  .then(collection => {
    return getResultArray(collection, {username: data.username})
  })
  .then(docs => {
    if (docs.length !== 1) {
      return false;
    }
    else if (docs[0].password === data.password) {
      return true;
    }
    else {
      return false;
    }
  })
  .finally(() => {
    console.log("Closing connection");
    client.close();
  })
}

function isUsernameTaken(data) {
  let client;
  
  return connectToCluster()
  .then(_client => {
    client = _client;
    return connectToCollection(client)
  })
  .then(collection => {
    return getResultArray(collection, {username: data.username})
  })
  .then(docs => {
    if (docs.length > 0) {
      return true;
    }
    else {
      return false;
    }
  })
  .finally(() => {
    console.log("Closing connection");
    client.close();
  })
}


function addUser(data) {
  let client;
  
  return connectToCluster()
  .then(_client => {
    client = _client;
    return connectToCollection(client)
  })
  .then(collection => {
    return collection.insertOne({username: data.username, password: data.password});
  })
  .finally(() => {
    console.log("Closing connection");
    client.close();
  })
}


exports.isValidPassword = isValidPassword;
exports.isUsernameTaken = isUsernameTaken;
exports.addUser = addUser;