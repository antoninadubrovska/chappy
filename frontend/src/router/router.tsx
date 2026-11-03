import { createHashRouter } from 'react-router-dom'
import App from '../App'
import MoreChannelsPage from '../pages/MoreChannelsPage'
import AiChatPage from '../pages/AiChatPage'
import HomePage from '../pages/HomePge'

export const router = createHashRouter([
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
                path: 'discover',
                element: <MoreChannelsPage />,
            },
            {
                path: 'ai',
                element: <AiChatPage />,
            },
        ],
    },
])