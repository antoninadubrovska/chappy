import type { Message } from '../../../packages/shared/src/schema';

type ChannelMessagesProps = {
    messages: Message[];
};

function ChannelMessages({ messages }: ChannelMessagesProps) {
    if (messages.length === 0) {
        return <p>No messages yet. Start the conversation!</p>;
    }

    return (
        <div className="channel-messages">
            {messages.map((message) => (
                <article className="message" key={message.messageId}>
					<strong className="message-username">{message.username}</strong>

					<p className="message-content">{message.content}</p>

					<small className="message-timestamp">
                        {new Date(message.createdAt).toLocaleString()}
                    </small>
                </article>
            ))}
        </div>
    );
}

export default ChannelMessages;