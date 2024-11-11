import React from 'react'

interface Props {
    title: string;
}

const BasicLabel: React.FC<Props> = ({ title }) => { return (<label className="form-label-sm">{ title }</label> )}

export default BasicLabel