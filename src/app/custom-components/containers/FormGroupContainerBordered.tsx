import React from 'react'

const style = {
    border: '1px solid #e9ecef',
    padding: '20px',
    margin: '0 0 20px 0'
  };

const FormGroupContainerBordered: React.FC = (props) => {
    return <div className='form-group row' style={style}>  {props.children} </div>
}

export default FormGroupContainerBordered
