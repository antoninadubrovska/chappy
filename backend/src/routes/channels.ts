
import { Router } from "express";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAME } from "../database.ts";
import {
	channelIndexFromDbSchema,
	type ChannelIndexFromDb,
} from "../../../packages/shared/src/schema.ts";

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

export default router;
