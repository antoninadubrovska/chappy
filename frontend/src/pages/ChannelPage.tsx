import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
	getChannels,
	getChannelMessages,
	sendChannelMessage,
	type Channel,
} from "../api/channels";
import type { Message } from "../../../packages/shared/src/schema";
import { useAuthStore } from "../store/authStore";
import type { SyntheticEvent } from 'react';

// TODO move out the helper
function getGuestUsername() {
	let username = sessionStorage.getItem("guestUsername");

	if (!username) {
		username = `Guest ${Math.floor(1000 + Math.random() * 9000)}`;
		sessionStorage.setItem("guestUsername", username);
	}

	return username;
}

function ChannelPage() {
	const { channelId } = useParams();

	// store contains:
	// token: string | null
	// user: AuthUser | null
	const { token, user } = useAuthStore();

	const [channel, setChannel] = useState<Channel | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// state for the message input
	const [newMessage, setNewMessage] = useState("");
	// prevent repeated submissions while sending
	const [sending, setSending] = useState(false);
	const [sendError, setSendError] = useState("");

	async function handleSendMessage(event: SyntheticEvent<HTMLFormElement>) {
		event.preventDefault();

		// don't send empty messages
		if (!channelId || !newMessage.trim()) return;

		setSending(true);
		setSendError("");

		try {
			let message;

			if (token && user) {
				// Logged in user
				message = await sendChannelMessage(
					channelId,
					{ content: newMessage },
					token,
				);
			} else {
				// Guest user
				message = await sendChannelMessage(channelId, {
					username: getGuestUsername(),
					content: newMessage,
				});
			}

			// use the previous state and append the newly returned message
			setMessages((previousMessages) => [...previousMessages, message]);

			setNewMessage("");
		} catch (error) {
			setSendError(
				error instanceof Error
					? error.message
					: "Could not send message",
			);
			// always reset the sending state
		} finally {
			setSending(false);
		}
	}

	useEffect(() => {
		async function loadChannel() {
			if (!channelId) return;

			try {
				// fetch the channel list and its messages at the same time
				const [channels, channelMessages] = await Promise.all([
					getChannels(),
					getChannelMessages(channelId),
				]);

				// locate the channel whose ID matches the URL
				const currentChannel = channels.find(
					(channel) => channel.channelId === channelId,
				);

				if (!currentChannel) {
					throw new Error("Channel not found");
				}

				setChannel(currentChannel);
				setMessages(channelMessages);
			} catch (error) {
				setError(
					error instanceof Error
						? error.message
						: "Something went wrong",
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

			<form onSubmit={handleSendMessage}>
				<input
					type="text"
					value={newMessage}
					onChange={(event) => setNewMessage(event.target.value)}
					placeholder="Write a message..."
				/>

				<button type="submit" disabled={sending || !newMessage.trim()}>
					{sending ? "Sending..." : "Send"}
				</button>
			</form>

			{sendError && <p>{sendError}</p>}
		</main>
	);
}

export default ChannelPage;
