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
import { getGuestUsername } from "../utils/guestUsername";
import ChannelMessages from "../components/ChannelMessages";
import MessageForm from "../components/MessageForm";

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
			let message: Message;

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

			<ChannelMessages messages={messages} />

			<MessageForm
				newMessage={newMessage}
				setNewMessage={setNewMessage}
				sending={sending}
				sendError={sendError}
				handleSendMessage={handleSendMessage}
			/>

		</main>
	);
}

export default ChannelPage;
