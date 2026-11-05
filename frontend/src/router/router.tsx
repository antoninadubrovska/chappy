import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import MoreChannelsPage from '../pages/MoreChannelsPage'
import AiChatPage from '../pages/AiChatPage'
import HomePage from '../pages/HomePge'
import ProfilePage from '../pages/ProfilePage'
import DirectMessagePage from '../pages/DirectMessagePage'
import ChannelPage from '../pages/ChannelPage'

// TODO switch to web router
export const router = createBrowserRouter([
    {
        path: '/',
		element: <App />,
		children: [
			{
				// default child page of /
                index: true,
                element: <HomePage />,
            },
            {
                path: 'moreChannels',
                element: <MoreChannelsPage />,
            },
            {
                path: 'aiChat',
                element: <AiChatPage />,
			},
			{
                path: 'channel/:channelId',
                element: <ChannelPage />,
            },
            {
                path: 'dm/:username',
                element: <DirectMessagePage />,
            },
            {
                path: 'userProfile',
                element: <ProfilePage />,
            },
        ],
    },
])