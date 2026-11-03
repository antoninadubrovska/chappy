import { useParams } from 'react-router-dom'

function DirectMessagePage() {
    const { username } = useParams()

    return <h1>DM: {username}</h1>
}

export default DirectMessagePage