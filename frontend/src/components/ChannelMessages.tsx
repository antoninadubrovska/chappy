import type { Message } from '../../../packages/shared/src/schema';

type ChannelMessagesProps = {
    messages: Message[];
};

function ChannelMessages({ messages }: ChannelMessagesProps) {
    if (messages.length === 0) {
        return <p>No messages yet. Start the conversation!</p>;
    }

    return (
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
    );
}

export default ChannelMessages;