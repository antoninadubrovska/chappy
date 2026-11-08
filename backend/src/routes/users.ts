import { Router } from "express";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { TransactWriteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAME, getUserByUsername } from "../database.ts";
import {
	userRegistrationSchema,
	loginCredentialsSchema,
	type TokenResponse,
} from "../../../packages/shared/src/schema.ts";
import jwt from "jsonwebtoken";

const router = Router();

const SECRET = process.env.SECRET;

if (!SECRET) {
	throw new Error("Missing JWT secret.");
}

router.get("/", async (_req, res) => {
	try {
		const result = await db.send(
			new QueryCommand({
				TableName: TABLE_NAME,
				KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
				ExpressionAttributeValues: {
					":pk": "USERNAMES",
					":prefix": "USERNAME#",
				},
			}),
		);

		const users =
			result.Items?.map((item) => ({
				userId: item.userId,
				username: item.username,
			})) ?? [];

		return res.json(users);
	} catch (error) {
		console.error(error);

		return res.status(500).json({
			message: "Could not retrieve users",
		});
	}
});

router.post("/login", async (req, res) => {
	// validate before accessing the credentials
	const result = loginCredentialsSchema.safeParse(req.body);

	if (!result.success) {
		return res.status(400).json({
			message: "Invalid login credentials",
		});
	}

	const { username, password } = result.data;

	try {
		// DynamoDB function retrieves the profile
		const user = await getUserByUsername(username);

		if (!user) {
			return res.status(401).json({
				message: "Invalid username or password",
			});
		}

		// compare the plain password with the stored hash
		const passwordMatches = await bcrypt.compare(
			password,
			user.passwordHash,
		);

		if (!passwordMatches) {
			return res.status(401).json({
				message: "Invalid username or password",
			});
		}

		// generate JWT
		const token = jwt.sign({ userId: user.userId }, SECRET, {
			expiresIn: "8h",
		});

		// store and send this token when making authenticated requests
		const response: TokenResponse = { jwt: token };

		return res.status(200).json(response);
	} catch (error) {
		console.error(error);

		return res.status(500).json({
			message: "Could not log in",
		});
	}
});

router.post("/register", async (req, res) => {
	const result = userRegistrationSchema.safeParse(req.body);

	if (!result.success) {
		return res.status(400).json({
			message: "Invalid registration data",
			errors: result.error.issues,
		});
	}

	const { username, displayName, password } = result.data;

	const normalizedUsername = username.toLowerCase();

	try {
		const userId = randomUUID();
		const createdAt = new Date().toISOString();
		const passwordHash = await bcrypt.hash(password, 12);

		await db.send(
			new TransactWriteCommand({
				TransactItems: [
					{
						Put: {
							TableName: TABLE_NAME,
							Item: {
								pk: `USER#${userId}`,
								sk: "PROFILE",
								userId,
								username: normalizedUsername,
								displayName,
								passwordHash,
								createdAt,
							},
						},
					},
					{
						Put: {
							TableName: TABLE_NAME,
							Item: {
								pk: "USERNAMES",
								sk: `USERNAME#${normalizedUsername}`,
								userId,
								username: normalizedUsername,
							},
							ConditionExpression: "attribute_not_exists(pk)",
						},
					},
				],
			}),
		);

		return res.status(201).json({
			userId,
			username: normalizedUsername,
			displayName,
			createdAt,
		});
	} catch (error) {
		if (
			error instanceof Error &&
			error.name === "TransactionCanceledException"
		) {
			return res.status(409).json({
				message: "Username is already taken",
			});
		}

		console.error(error);

		return res.status(500).json({
			message: "Could not register user",
		});
	}
});

export default router;
