import { Router } from "express";
import { QueryCommand, TransactWriteCommand, PutCommand, } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAME, getUserById, getChannelById } from "../database.ts";
import {
	channelIndexFromDbSchema,
	type ChannelIndexFromDb,
	channelCreationSchema,
	// Message,
	type Message,
	messageFromDbSchema, guestMessageCreationSchema,
	authenticatedMessageCreationSchema,
	channelFromDbSchema

} from "../../../packages/shared/src/schema.ts";
import { randomUUID } from "node:crypto";
import { requireAuth, optionalAuth } from "../middleware.ts";


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


// GET /api/channels/:channelId/messages
router.get("/:channelId/messages", optionalAuth, async (req, res) => {
	const channelId = req.params.channelId;

	if (typeof channelId !== "string") {
		return res.sendStatus(400);
	}

	try {

		// Retrieve channel metadata
        const channel = await getChannelById(channelId);

        if (!channel) {
            return res.sendStatus(404);
        }

        // Validate channel metadata
        const channelResult = channelFromDbSchema.safeParse(channel);

        if (!channelResult.success) {
            console.error("Invalid channel metadata:", channelResult.error.issues);
            return res.sendStatus(500);
        }

        const userId = res.locals.userId;

        // Guests cannot access locked channels
        if (channelResult.data.isLocked && !userId) {
            return res.sendStatus(403);
		}

		// retrieve messages
		const result = await db.send(


            new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression:
                    "pk = :pk AND begins_with(sk, :sk)",
                ExpressionAttributeValues: {
                    ":pk": `CHANNEL#${channelId}`,
                    ":sk": "MESSAGE#",
				},
				// messages in ascending order
                ScanIndexForward: true,
            }),
        );

        const messages: Message[] = (result.Items ?? []).map(item => {
            const message = messageFromDbSchema.parse(item);

            return {
                messageId: message.messageId,
                channelId: message.channelId,
                userId: message.userId,
                username: message.username,
                content: message.content,
                createdAt: message.createdAt,
            };
        });

        return res.status(200).json(messages);
    } catch (error) {
        console.error("GET channel messages error:", error);
        return res.sendStatus(500);
    }
});




router.post("/:channelId/messages", optionalAuth, async (req, res) => {
    const channelId = req.params.channelId;

    if (typeof channelId !== "string") {
        return res.sendStatus(400);
    }

    const userId = res.locals.userId;

    let username = '';
    let messageUserId: string | null = null;
    let content = '';

    // Validate the request
    if (userId) {
        const result = authenticatedMessageCreationSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid message data",
                errors: result.error.issues,
            });
        }

        content = result.data.content;

    } else {
        const result = guestMessageCreationSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid message data",
                errors: result.error.issues,
            });
        }

        username = result.data.username;
        messageUserId = null;
        content = result.data.content;
    }

    try {
        // Look up authenticated user
        if (userId) {
            const user = await getUserById(userId);

            if (!user) {
                return res.sendStatus(401);
            }

            username = user.username;
            messageUserId = userId;
        }

        // Create message
        const messageId = randomUUID();
        const createdAt = new Date().toISOString();

        const message: Message = {
            messageId,
            channelId,
            userId: messageUserId,
            username,
            content,
            createdAt,
        };

        // Store message in the channel's partition
        await db.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    pk: `CHANNEL#${channelId}`,
                    sk: `MESSAGE#${createdAt}#${messageId}`,
                    type: "MESSAGE",
                    ...message,
                },
            }),
        );

        return res.status(201).json(message);

    } catch (error) {
        console.error("POST channel message error:", error);
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
