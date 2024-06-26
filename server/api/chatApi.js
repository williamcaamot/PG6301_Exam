import express from "express";
import { ObjectId } from "mongodb";

function chatApi(db) {
  const router = express.Router();

  router.get("/chatroom/:id", async (req, res) => {
    try {
      if (!req.user) {
        res.status(401);
        res.json({ message: "You must be logged inn to get a chat room!" });
        return;
      }
      const id = new ObjectId(req.params.id);
      const data = await db.collection("chatrooms").findOne({ _id: id });
      res.status(200);
      res.json({ message: "Success", data: data });
    } catch (e) {
      res.status(404);
      res.json({
        message: "Something went wrong in the server, message: " + e.message,
      });
    }
  });

  router.get("/chatroom/owner/:email", async (req, res) => {
    try {
      if (!req.user) {
        res.status(401);
        res.json({
          message: "You must be logged inn to list your chat rooms!",
        });
        return;
      }
      if (req.user.email !== req.params.email) {
        res.status(401);
        res.json({ message: "You can not list other peoples chat rooms" });
        return;
      }
      const email = req.params.email;
      const data = await db
        .collection("chatrooms")
        .find({ owner: email })
        .toArray();
      res.status(200);
      res.json({
        message: "Successfully found chat rooms to user",
        data: data,
      });
    } catch (e) {
      res.status(404);
      res.json({
        message: "Something went wrong in the server, message: " + e.message,
      });
    }
  });

  router.get("/chatroom", async (req, res) => {
    try {
      if (!req.user) {
        res.status(401);
        res.json({ message: "You must be logged in to view chatrooms!" });
        return;
      }
      const data = await db.collection("chatrooms").find().toArray();
      res.status(200);
      res.json({ message: "Success", data: data });
    } catch (e) {
      res.status(404);
      res.json({
        message: "Something went wrong in the server, message: " + e.message,
      });
    }
  });

  router.post("/chatroom", async (req, res) => {
    try {
      if (!req.user) {
        res.status(401);
        res.json({ message: "You must be logged in to add a chatroom" });
        return;
      }
      if (req.body.title.length < 5 || req.body.description < 5) {
        res.status(409);
        res.json({
          message:
            "The title or description is not long enough (minimum 5 characters)",
        });
        return;
      }
      if (req.body.title.length > 50 || req.body.description > 200) {
        res.status(409);
        res.json({ message: "Too long name or description!" });
        return;
      }
      if (await db.collection("chatrooms").findOne({ title: req.body.title })) {
        console.log("Found exisiting chatroom");
        res.status(409);
        res.json({ message: "A chatroom with this title already exists!" });
        return;
      }
      const chatroom = {
        owner: req.user.email,
        title: req.body.title,
        description: req.body.description,
        messages: [],
      };
      const dbres = await db.collection("chatrooms").insertOne(chatroom);
      res.status(201);
      res.json({
        message: `Sucessfully added the chatroom with title: ${req.body.title}`,
        data: dbres.insertedId,
      });
    } catch (e) {
      res.json({
        message: "Something went wrong in the server, message: " + e.message,
      });
    }
  });

  router.put("/chatroom/:id", async (req, res) => {
    try {
      if (!req.user) {
        res.status(401);
        res.json({
          message: "You must be logged in to edit chatroom details!",
        });
        return;
      }
      if (req.body.title.length < 5 || req.body.description < 5) {
        res.status(409);
        res.json({
          message:
            "The title or description is not long enough (minimum 5 characters)",
        });
        return;
      }
      if (req.body.title.length > 50 || req.body.description > 200) {
        res.status(409);
        res.json({ message: "Too long name or description!" });
        return;
      }
      const newChatroom = {
        title: req.body.title,
        description: req.body.description,
      };
      const id = new ObjectId(req.params.id);
      const data = await db.collection("chatrooms").findOne({ _id: id });
      if (data) {
        if (data.owner !== req.user.email) {
          res.status(401);
          res.json({ message: "Could not find user" });
          return;
        }
        let resdata = await db.collection("chatrooms").updateOne(
          { _id: id }, // The filter to match the document you want to update
          { $set: newChatroom }, // The update document
        );
        res.status(201);
        res.json({
          message: "Updated chatroom successfully",
          data: newChatroom,
        });
      } else {
        res.json({ message: "Could not find chatroom to update" });
      }
    } catch (e) {
      res.json({
        message: "Something went wrong in the server, message: " + e.message,
      });
    }
  });

  router.delete("/chatroom/:id", async (req, res) => {
    try {
      if (!req.user) {
        res.status(401);
        res.json({ message: "You must be logged in to delete a chat room" });
        return;
      }
      const id = new ObjectId(req.params.id);
      const data = await db.collection("chatrooms").findOne({ _id: id });
      if (data) {
        if (data.owner !== req.user.email) {
          res.status(401);
          res.json({ message: "Could not find user" });
          return;
        }
        await db.collection("chatrooms").deleteOne({ _id: id });
        res.status(201);
        res.json({ message: "Successfully deleted chatroom!" });
      } else {
        res.json({
          message:
            "Could not find chatroom to delete! (did you already delete it?)",
        });
      }
    } catch (e) {
      res.json({
        message: "Something went wrong in the server, message: " + e.message,
      });
    }
  });

  return router;
}

export default chatApi;
