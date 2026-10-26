import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const region = process.env.AWS_REGION
const accessKeyId = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

if (!region || !accessKeyId || !secretAccessKey) {
  throw new Error('Missing DynamoDB environment variables.')
}

const dynamoDBClient = new DynamoDBClient({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
})

export const db = DynamoDBDocumentClient.from(dynamoDBClient)

export const TABLE_NAME = 'chappy'