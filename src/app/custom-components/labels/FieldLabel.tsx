import React from 'react'

interface Props {
    title: string;
    fieldSize?: string;
}

const FieldLabel: React.FC<Props> = ({ title, fieldSize }) => {
    return (
        <div className={"col-sm-" + (fieldSize != undefined ? fieldSize : '12')}>
            <label className="form-label-sm">{ title }</label>
        </div>
    )
}

export default FieldLabel
