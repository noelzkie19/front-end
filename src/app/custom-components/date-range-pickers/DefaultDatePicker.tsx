import React from 'react'
import { DatePicker, } from 'rsuite';
import 'rsuite/dist/rsuite.min.css'

interface Props {
    format: string
    value: any
    onChange: (val: any) => void
    disabled?: boolean
    placeholder?: string
    ranges?: any
    minDate?: any
    showTime?: any
}

const DefaultDatePicker: React.FC<Props> = ({ format, value, onChange, disabled, placeholder, ranges, minDate, showTime}) => {
    return (
        <DatePicker
            format={format}
            showMeridian={showTime}
            onChange={onChange}
            appearance="default"
            placeholder= {placeholder ?? "DD/mm/yyyy HH:mm:ss"}
            style={{ width: '100%' }}
            value={value}
            ranges={ranges}
            disabledDate={minDate}        
            {...(disabled ? {disabled: disabled} : {})}
        />
    )
}

export default DefaultDatePicker


