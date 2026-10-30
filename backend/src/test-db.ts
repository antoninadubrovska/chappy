import { DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const region = process.env.AWS_REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

if (!region || !accessKeyId || !secretAccessKey) {
	throw new Error("Missing DynamoDB environment variables.");
}

const client = new DynamoDBClient({
	region,
	credentials: {
		accessKeyId,
		secretAccessKey,
	},
});

try {
	const result = await client.send(
		new DescribeTableCommand({ TableName: "chappy" }),
	);

	// checks the connection, credentials, permissions, and table name without writing or deleting any data

	console.log("Connected to DynamoDB!");
	console.log("Table:", result.Table?.TableName);
	console.log("Status:", result.Table?.TableStatus);
	console.log("Keys:", result.Table?.KeySchema);
} catch (error) {
	console.error("DynamoDB connection failed:", error);
	process.exitCode = 1;
} finally {
	client.destroy();
}
