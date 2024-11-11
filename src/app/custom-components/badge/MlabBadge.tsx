import React from 'react'
import { ElementStyle } from '../../constants/Constants'
interface BadgeProps {
    label: string;
    weight: 'normal' | 'light';
    type: 'badge' | 'pill';
    style: ElementStyle;
  }

const MlabBadge : React.FC<BadgeProps> = ({
    label = 'badge',
    weight = 'normal',
    type = 'badge',
    style = ElementStyle.primary,
    ...props
} : BadgeProps) => {
    return (
        <span 
            className={['badge', (type === 'pill' ? 'rounded-pill' : ''), `badge${(weight === 'normal' ? '' : '-light')}-${style}`].join(' ')}
            {...props}
        >
            {label}
        </span>
    )
}

export default MlabBadge
