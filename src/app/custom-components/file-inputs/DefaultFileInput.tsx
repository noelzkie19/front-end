import React from 'react'
import { Form } from 'react-bootstrap-v5'

interface Props {
    defaultValue? : File
    onChange: (val: any) => void
    value?: any
    accept? : string
    defaultLabel?: string
    disabled:boolean
}

const DefaultFileInput: React.FC<Props> = ( props ) => {

    return (
        <Form.Group controlId="formFile" className="mb-3">
            {props.defaultValue ? <Form.Label>{props.defaultValue}</Form.Label> : null}
            <Form.Control type="file" size="sm" onChange={props.onChange} accept={props.accept} value={props.value} disabled={props.disabled} />
       </Form.Group>
    )
}

export default DefaultFileInput
