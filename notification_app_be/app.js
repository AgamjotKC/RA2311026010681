const express = require("express");
const { Log } = require("../logging_middleware/logger");

const app = express();
app.use(express.json());

// Test route
app.get("/", async (req, res) => {
    await Log("backend", "info", "route", "Root API hit");
    res.send("Working");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});