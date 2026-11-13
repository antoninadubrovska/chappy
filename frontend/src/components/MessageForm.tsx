import type { SyntheticEvent } from 'react';

type MessageFormProps = {
    newMessage: string;
    setNewMessage: (value: string) => void;
    sending: boolean;
    sendError: string;
    handleSendMessage: (event: SyntheticEvent<HTMLFormElement>) => void;
};

function MessageForm({
    newMessage,
    setNewMessage,
    sending,
    sendError,
    handleSendMessage
}: MessageFormProps) {
    return (
        <>
            <form onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    placeholder="Write a message..."
                />

                <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                >
                    {sending ? 'Sending...' : 'Send'}
                </button>
            </form>

            {sendError && <p>{sendError}</p>}
        </>
    );
}

export default MessageForm;