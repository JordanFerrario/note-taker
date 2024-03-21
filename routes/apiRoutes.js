const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

module.exports = (app) => {
  // GET /api/notes route
  app.get("/api/notes", (req, res) => {
    fs.readFile(path.join(__dirname, "../db/db.json"), "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error reading notes data");
      }
      res.json(JSON.parse(data));
    });
  });

  // POST /api/notes route
  app.post("/api/notes", (req, res) => {
    // Read the current notes
    fs.readFile(path.join(__dirname, "../db/db.json"), "utf8", (err, data) => {
      if (err) {
        console.errorr(err);
        return res.status(500).send("Error reading notes data");
      }

      const notes = JSON.parse(data);
      // Create a new note with an unique ID
      const newNote = { id: uuidv4(), ...req.body };

      // Add the new note to the array
      notes.push(newNote);

      // Write the updated notes back to db.json
      fs.writeFile(
        path.join(__dirname, "../db/db.json"),
        JSON.stringify(notes, null, 2),
        (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Error saving the new note");
          }

          // Return the new note
          res.json(newNote);
        }
      );
    });
  });
};
