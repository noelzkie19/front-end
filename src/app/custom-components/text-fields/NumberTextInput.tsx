import React from 'react'

interface Props {
  ariaLabel: string
  onChange?: any
  className?: string
  disabled?: boolean
  min?: string
}

const NumberTextInput: React.FC<Props> = ({ariaLabel, min, ...props}) => {
  props.className = props.className != null && props.className != '' ? props.className : 'form-control form-control-sm form-control-solid'

  const formatInput = (e: any) => {
    // Prevent characters that are not numbers ("e", ".", "+" & "-") ✨
    let checkIfNum
    if (e.key !== undefined) {
      // Check if it's a "e", ".", "+" or "-"
      checkIfNum = e.key === 'e' || e.key === '.' || e.key === '+' || e.key === '-'
    } else if (e.keyCode !== undefined) {
      // Check if it's a "e" (69), "." (190), "+" (187) or "-" (189)
      checkIfNum = e.keyCode === 69 || e.keyCode === 190 || e.keyCode === 187 || e.keyCode === 189
    }
    return checkIfNum && e.preventDefault()
  }

  return (
    <div className='col-sm-12'>
      <input type='number' min={min !== '' ? min : '0'} onKeyDown={formatInput} aria-label={ariaLabel} {...props} />
    </div>
  )
}

export default NumberTextInput
