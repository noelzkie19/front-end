import React from 'react'
import { defaultMaxListeners } from 'stream'

const ContentContainer: React.FC = ( props ) => {
    return <div className='card-body p-9'>{props.children}</div>
}

export default ContentContainer
