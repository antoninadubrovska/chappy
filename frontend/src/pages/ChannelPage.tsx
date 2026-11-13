import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react';
import {
    getChannels,
    getChannelMessages,
    type Channel
} from '../api/channels';
import type { Message } from '../../../packages/shared/src/schema';


function ChannelPage() {
    const { channelId } = useParams()

	const [channel, setChannel] = useState<Channel | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadChannel() {
            if (!channelId) return;

			try {
				// fetch the channel list and its messages at the same time
                const [channels, channelMessages] = await Promise.all([
                    getChannels(),
                    getChannelMessages(channelId)
                ]);

				// locate the channel whose ID matches the URL
                const currentChannel = channels.find(
                    (channel) => channel.channelId === channelId
                );

                if (!currentChannel) {
                    throw new Error('Channel not found');
                }

                setChannel(currentChannel);
                setMessages(channelMessages);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'Something went wrong'
                );
            } finally {
                setLoading(false);
            }
        }

        loadChannel();
    }, [channelId]);

    if (loading) return <p>Loading channel...</p>;
    if (error) return <p>{error}</p>;
    if (!channel) return <p>Channel not found</p>;


	return (
		<main>
		<h1># {channel.name}</h1>

		{messages.length === 0 ? (
			<p>No messages yet. Start the conversation!</p>
		) : (
			<div>
				{messages.map((message) => (
					<article key={message.messageId}>
						<strong>{message.username}</strong>
						<p>{message.content}</p>
						<small>
							{new Date(message.createdAt).toLocaleString()}
						</small>
					</article>
				))}
			</div>
		)}
	</main>


	)
}

export default ChannelPage