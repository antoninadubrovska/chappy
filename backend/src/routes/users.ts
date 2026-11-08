import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { db, TABLE_NAME } from '../database.ts'
import { userRegistrationSchema } from '../../../packages/shared/src/schema.ts'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'

const router = Router()

router.get('/', async (_req, res) => {
    try {
        const result = await db.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
            ExpressionAttributeValues: {
                ':pk': 'USERNAMES',
                ':prefix': 'USERNAME#'
            }
        }))

        const users = result.Items?.map(item => ({
            userId: item.userId,
            username: item.username
        })) ?? []

        return res.json(users)

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            message: 'Could not retrieve users'
        })
    }
})



router.post('/register', async (req, res) => {
    const result = userRegistrationSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json({
            message: 'Invalid registration data',
            errors: result.error.issues
        })
    }

    const { username, displayName, password } = result.data

    const normalizedUsername = username.toLowerCase()

    try {
        const userId = randomUUID()
        const createdAt = new Date().toISOString()
        const passwordHash = await bcrypt.hash(password, 12)

        await db.send(new TransactWriteCommand({
            TransactItems: [
                {
                    Put: {
                        TableName: TABLE_NAME,
                        Item: {
                            pk: `USER#${userId}`,
                            sk: 'PROFILE',
                            userId,
                            username: normalizedUsername,
                            displayName,
                            passwordHash,
                            createdAt
                        }
                    }
                },
                {
                    Put: {
                        TableName: TABLE_NAME,
                        Item: {
                            pk: 'USERNAMES',
                            sk: `USERNAME#${normalizedUsername}`,
                            userId,
                            username: normalizedUsername
                        },
                        ConditionExpression: 'attribute_not_exists(pk)'
                    }
                }
            ]
        }))

        return res.status(201).json({
            userId,
            username: normalizedUsername,
            displayName,
            createdAt
        })

    } catch (error) {
        if (
            error instanceof Error &&
            error.name === 'TransactionCanceledException'
        ) {
            return res.status(409).json({
                message: 'Username is already taken'
            })
        }

        console.error(error)

        return res.status(500).json({
            message: 'Could not register user'
        })
    }
})

export default router