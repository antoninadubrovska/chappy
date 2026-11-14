import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
	ApiError,
	getChannels,
	getChannelMessages,
	sendChannelMessage,
	type Channel,
} from "../api/channels";
import type { Message } from "../../../packages/shared/src/schema";
import { useAuthStore } from "../store/authStore";
import type { SyntheticEvent } from "react";
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
	const [accessDenied, setAccessDenied] = useState(false);

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

			// every channel navigation starts with a clean state
			setLoading(true);
			setError("");
			setChannel(null);
			setMessages([]);
			setAccessDenied(false);

			try {
				const channels = await getChannels();

				// Find the channel matching the URL
				const currentChannel = channels.find(
					(channel) => channel.channelId === channelId,
				);

				if (!currentChannel) {
					throw new Error("Channel not found");
				}

				// Save channel information before fetching messages
				setChannel(currentChannel);

				// Fetch messages using the optional authentication token
				const channelMessages = await getChannelMessages(
					channelId,
					token ?? undefined,
				);

				setMessages(channelMessages);
			} catch (error) {
				if (error instanceof ApiError && error.status === 403) {
					setAccessDenied(true);
				} else {
					setError(
						error instanceof Error
							? error.message
							: "Something went wrong",
					);
				}
			} finally {
				setLoading(false);
			}
		}

		loadChannel();
	}, [channelId, token]);

	if (loading) return <p>Loading channel...</p>;
	if (error) return <p>{error}</p>;
	if (!channel) return <p>Channel not found</p>;

	return (
		<main className="channel-page">
			<header className="channel-header">

			<h1># {channel.name}</h1>
			</header>


			{accessDenied ? (
				<section className="access-denied">
					<h2>🔒 Private channel</h2>
					<p>You need to log in to view this conversation.</p>
					<p>
						<Link to="/login">Log in</Link>
						{" or "}
						<Link to="/register">create an account</Link>
						{" to continue."}
					</p>
				</section>
			) : (
				<>
					<ChannelMessages messages={messages} />

					<MessageForm
						newMessage={newMessage}
						setNewMessage={setNewMessage}
						sending={sending}
						sendError={sendError}
						handleSendMessage={handleSendMessage}
					/>
				</>
			)}
		</main>
	);
}

export default ChannelPage;
