import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient,  GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";


const region = process.env.AWS_REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

if (!region || !accessKeyId || !secretAccessKey) {
	throw new Error("Missing DynamoDB environment variables.");
}

const dynamoDBClient = new DynamoDBClient({
	region,
	credentials: {
		accessKeyId,
		secretAccessKey,
	},
});

export const db = DynamoDBDocumentClient.from(dynamoDBClient);

export const TABLE_NAME = "chappy";


// the first record is to discover the userId, the second is to retrieve the password hash

export async function getUserByUsername(username: string) {
    const normalizedUsername = username.toLowerCase()

    const usernameResult = await db.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pk AND sk = :sk',
        ExpressionAttributeValues: {
            ':pk': 'USERNAMES',
            ':sk': `USERNAME#${normalizedUsername}`
        }
    }))

    const usernameItem = usernameResult.Items?.[0]

    if (!usernameItem) {
        return undefined
    }

    const profileResult = await db.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: {
            pk: `USER#${usernameItem.userId}`,
            sk: 'PROFILE'
        }
    }))

    return profileResult.Item
}

// authenticated users
export async function getUserById(userId: string) {
    const result = await db.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: {
            pk: `USER#${userId}`,
            sk: 'PROFILE'
        }
    }))

    return result.Item
}
















// retrieve channel metadata
export async function getChannelById(channelId: string) {
    const result = await db.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: {
            pk: `CHANNEL#${channelId}`,
            sk: 'META'
        }
    }));

    return result.Item;
}