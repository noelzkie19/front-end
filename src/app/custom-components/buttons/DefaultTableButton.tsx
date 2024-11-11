import React from 'react'

interface Props {
    title: string
    onClick: () => void
    access?: boolean
    className?: string
    isDisabled?: boolean
    customWidth?: string
    onKeyDown?: (e: any) => void
}

const DefaultTableButton: React.FC<Props> = ({ title, onClick, access, className, isDisabled, customWidth, onKeyDown }) => <>{access === true ? <button type="button" disabled={isDisabled} onClick={onClick} className={className ?? 'btn btn-outline-primary btn-sm px-4'} style={{ minWidth: customWidth ?? "" }} onKeyDown={onKeyDown}> {title}</button> : null}</>

export default DefaultTableButton
