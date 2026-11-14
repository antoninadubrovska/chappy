import type {
    Message,
    GuestMessageCreation,
    AuthenticatedMessageCreation,
} from "../../../packages/shared/src/schema.ts";


export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}


export type Channel = {
    channelId: string;
    name: string;
    isLocked: boolean;
};

export async function getChannels(): Promise<Channel[]> {
    const response = await fetch('/api/channels');

    if (!response.ok) {
        throw new ApiError('Could not retrieve channels', response.status);
    }

    return response.json();
}


export async function getChannelMessages(
	channelId: string,
	token?: string
): Promise<Message[]> {
    const response = await fetch(
		`/api/channels/${channelId}/messages`,
		{
            headers: {
                ...(token && {
                    Authorization: `Bearer ${token}`
                })
            }
        }
    );

    if (!response.ok) {
        throw new ApiError('Could not retrieve channel messages', response.status);
    }

    return response.json();
}

export async function sendChannelMessage(
    channelId: string,
	message: GuestMessageCreation | AuthenticatedMessageCreation,
	// token is optional
    token?: string
): Promise<Message> {
    const response = await fetch(
        `/api/channels/${channelId}/messages`,
        {
			method: 'POST',
			// if the token exists, the Authorization header is added
            headers: {
                'Content-Type': 'application/json',
                ...(token && {
                    Authorization: `Bearer ${token}`
                })
            },
            body: JSON.stringify(message)
        }
    );

    if (!response.ok) {
        throw new ApiError('Could not send message', response.status);
    }

    return response.json();
}
