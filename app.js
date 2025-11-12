/* Dependencies */
const path = require("path");
const express = require("express");

// Set up Express app
const app = express();

// Import and use routes
const recordsRoutes = require("./app/routes/records");
const statsRoutes = require("./app/routes/stats");
app.use("/api", recordsRoutes);
app.use("/api", statsRoutes);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// Fallback to serve index.html for any other route
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Export app so server.js can import it
module.exports = app;
