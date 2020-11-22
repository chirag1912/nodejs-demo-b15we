const express = require("express");
const mongodb = require("mongodb");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

const app = express();
dotenv.config();

const mongoClient = mongodb.MongoClient;
const objectId = mongodb.ObjectID;
const port = process.env.PORT || 3000;
let dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017";

app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  try {
    let client = await mongodb.connect(dbUrl);
    let db = client.db("B15_WE");
    let result = await db.collection("users").find().toArray();
    res.status(200).json({ result });
    client.close();
  } catch (error) {
    console.log(error);
    res.send(500);
  }
});

app.get("/get-user/:id", async (req, res) => {
  try {
    let client = await mongodb.connect(dbUrl);
    let db = client.db("B15_WE");
    let result = await db
      .collection("users")
      .findOne({ _id: objectId(req.params.id) });
    res.status(200).json({ result });
    client.close();
  } catch (error) {
    console.log(error);
    res.send(500);
  }
});
app.post("/add-user", async (req, res) => {
  try {
    let client = await mongodb.connect(dbUrl);
    let db = client.db("B15_WE");
    let result = await db.collection("users").insertOne(req.body);
    res.status(200).json({ message: "USer Created" });
    client.close();
  } catch (error) {
    console.log(error);
    res.send(500);
  }
});
app.put("/update-user/:id", async (req, res) => {
  try {
    let client = await mongodb.connect(dbUrl);
    let db = client.db("B15_WE");
    let result = await db
      .collection("users")
      .findOneAndUpdate({ _id: objectId(req.params.id) }, { $set: req.body });
    res.status(200).json({ message: "User updated" });
    client.close();
  } catch (error) {
    console.log(error);
    res.send(500);
  }
});
app.delete("/delete-user/:id", async (req, res) => {
  try {
    let client = await mongodb.connect(dbUrl);
    let db = client.db("B15_WE");
    let result = await db
      .collection("users")
      .deleteOne({ _id: objectId(req.params.id) });
    res.status(200).json({ message: "User deleted" });
    client.close();
  } catch (error) {
    console.log(error);
    res.send(500);
  }
});

app.post("/register", async (req, res) => {
  try {
    let client = await mongodb.connect(dbUrl);
    let db = client.db("B15_WE");
    let data = await db.collection("users").findOne({ email: req.body.email });
    if (data) {
      res.status(400).json({
        message: "User already exists",
      });
    } else {
      let salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(req.body.password, salt);
      req.body.password = hash;
      let result = await db.collection("users").insertOne(req.body);
      res.status(200).json({
        message: "User registered",
      });
    }
    client.close();
  } catch (error) {
    console.log(error);
    res.send(500);
  }
});

app.post("/login", async (req, res) => {
  try {
    let client = await mongodb.connect(dbUrl);
    let db = client.db("B15_WE");
    let data = await db.collection("users").findOne({ email: req.body.email });
    if (data) {
      let isValid = await bcrypt.compare(req.body.password, data.password);
      if (isValid) {
        res.status(200).json({ message: "Login success" });
      } else {
        res.status(401).json({ message: "Login unsuccessful" });
      }
    } else {
      res.status(400).json({
        message: "User is not registered",
      });
    }
    client.close();
  } catch (error) {
    console.log(error);
    res.send(500);
  }
});

app.listen(port, () => console.log("Your app is running with", port));
