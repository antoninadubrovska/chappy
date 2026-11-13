import type {
    Message,
    GuestMessageCreation,
    AuthenticatedMessageCreation,
} from "../../../packages/shared/src/schema.ts";

export type Channel = {
    channelId: string;
    name: string;
    isLocked: boolean;
};

export async function getChannels(): Promise<Channel[]> {
    const response = await fetch('/api/channels');

    if (!response.ok) {
        throw new Error('Could not retrieve channels');
    }

    return response.json();
}


export async function getChannelMessages(
    channelId: string
): Promise<Message[]> {
    const response = await fetch(
        `/api/channels/${channelId}/messages`
    );

    if (!response.ok) {
        throw new Error('Could not retrieve channel messages');
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
        throw new Error('Could not send message');
    }

    return response.json();
}
