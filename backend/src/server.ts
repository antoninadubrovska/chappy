import express from "express";
import usersRouter from './routes/users.ts'


const app = express();
const PORT = Number(process.env.PORT) || 3008;
const HOST = "0.0.0.0";


app.use(express.json());

app.use('/api/users', usersRouter)

app.get("/api/test", (_req, res) => {
	res.json({ message: "Hello from the Chappy backend" });
});


app.listen(PORT, HOST, () => {
	console.log(`Server running on ${PORT}`);
});
