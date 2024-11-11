import React from 'react'
import SVG from 'react-inlinesvg'
import {toAbsoluteUrl} from '../AssetHelpers'
type Props = {
  className?: string
  path: string
  svgClassName?: string
}

const KTSVG: React.FC<Props> = ({className = '', path, svgClassName = 'mh-50px', ...props}) => {
  return (
    <span className={`svg-icon ${className}`}>
      <SVG src={toAbsoluteUrl(path)} className={svgClassName} {...props} />
    </span>
  )
}

export {KTSVG}
