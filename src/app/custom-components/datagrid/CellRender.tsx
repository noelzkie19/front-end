import React from 'react'

const CellRender: React.FC = ( props ) => {

    // const cellValue = {props.valueFormatted} ? {props.valueFormatted }: {props.value};

    const buttonClicked = () => {
        // alert(`${cellValue} medals won!`)
        console.log(props)
    }
     

    return (
        <span>
        {/* <span>{props.valueFormatted}</span>&nbsp; */}
            <button onClick={() => buttonClicked()}>Push For Total</button>
        </span>
    )
}

export default CellRender
