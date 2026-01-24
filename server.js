// NOTE: This file is for LOCAL DEVELOPMENT ONLY - not used in production
// Production deployment is handled by Vercel using app.js

// Load env vars first (local-only since .env.development.local isn't tracked in git)
if (process.env.NODE_ENV !== "production") {
	require("dotenv").config({ path: ".env.development.local" });
}
const app = require("./app");
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
	if (process.env.NODE_ENV === "production") {
		console.log(`Server running on port ${PORT}`);
	} else {
		console.log(`Server running on http://localhost:${PORT}`);
	}
});
