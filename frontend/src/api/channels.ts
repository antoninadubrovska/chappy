
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
