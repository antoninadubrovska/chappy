import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import MoreChannelsPage from '../pages/MoreChannelsPage'
import AiChatPage from '../pages/AiChatPage'
import HomePage from '../pages/HomePge'
import ProfilePage from '../pages/ProfilePage'
import DirectMessagePage from '../pages/DirectMessagePage'
import ChannelPage from '../pages/ChannelPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'

// TODO switch to web router
export const router = createBrowserRouter([

	// login won't render the Sidebar
	{
		path: '/login',
		element: <LoginPage />,
	},
	{
		path: '/register',
		element: <RegisterPage />,
	},
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