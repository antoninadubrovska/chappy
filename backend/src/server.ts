import express from "express";

const app = express();
const PORT = 3008;

app.use(express.json());

app.get("/api/test", (_req, res) => {
	res.json({ message: "Hello from the Chappy backend" });
});

// test endpoint
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
