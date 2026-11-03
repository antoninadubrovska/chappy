import { useParams } from 'react-router-dom'

function ChannelPage() {
    const { channelId } = useParams()

    return <h1>Channel: {channelId}</h1>
}

export default ChannelPage