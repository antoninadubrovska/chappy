import { Router } from "express";
import { QueryCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAME } from "../database.ts";
import {
	channelIndexFromDbSchema,
	type ChannelIndexFromDb,
	channelCreationSchema,
} from "../../../packages/shared/src/schema.ts";
import { randomUUID } from "node:crypto";
import { requireAuth } from "../middleware.ts";

const router = Router();

// GET /api/channels
router.get("/", async (_req, res) => {
	try {
		const result = await db.send(
			new QueryCommand({
				TableName: TABLE_NAME,
				KeyConditionExpression: "pk = :pk",
				ExpressionAttributeValues: {
					":pk": "CHANNELS",
				},
			}),
		);

		const channels: ChannelIndexFromDb[] = (result.Items ?? []).map(
			(item) => channelIndexFromDbSchema.parse(item),
		);

		return res.status(200).json(channels);
	} catch (error) {
		console.error("GET /api/channels error:", error);
		return res.sendStatus(500);
	}
});

// POST /api/channels
router.post("/", requireAuth, async (req, res) => {
	const result = channelCreationSchema.safeParse(req.body);

	if (!result.success) {
		return res.status(400).json({
			message: "Invalid channel data",
			errors: result.error.issues,
		});
	}

	const { name, isLocked } = result.data;

	const channelId = randomUUID();
	const createdAt = new Date().toISOString();
	const createdBy = res.locals.userId;

	try {
		await db.send(
			new TransactWriteCommand({
				TransactItems: [
					{
						Put: {
							TableName: TABLE_NAME,
							Item: {
								pk: `CHANNEL#${channelId}`,
								sk: "META",
								type: "CHANNEL",
								channelId,
								name,
								isLocked,
								createdBy,
								createdAt,
							},
							ConditionExpression: "attribute_not_exists(pk)",
						},
					},
					{
						Put: {
							TableName: TABLE_NAME,
							Item: {
								pk: "CHANNELS",
								sk: `CHANNEL#${channelId}`,
								type: "CHANNEL_INDEX",
								channelId,
								name,
								isLocked,
							},
							ConditionExpression: "attribute_not_exists(pk)",
						},
					},
				],
			}),
		);

		return res.status(201).json({
			channelId,
			name,
			isLocked,
			createdBy,
			createdAt,
		});
	} catch (error) {
		console.error("POST /api/channels error:", error);
		return res.sendStatus(500);
	}
});

export default router;
