import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {OverlayTrigger} from 'react-bootstrap-v5';

interface Props {
	access: boolean | undefined;
	onClick: () => void;
	faIcon?: any;
	toolTipText?: string;
	iconColor?: any;
	isDisable?: any;
	hasCustomTooltip?: any;
}

// styles
const iconStyle = {
	cursor: 'pointer',
	color: '#009EF7',
	fontSize: '13px',
};

const disAbleIconStyle = {
	cursor: 'not-allowed',
	color: '#ccc',
	fontSize: '13px',
};

const TableIconButton: React.FC<Props> = ({access, onClick, faIcon, toolTipText, iconColor, isDisable, hasCustomTooltip}) => {
	const renderTooltip = (props: any) => (
		<Tooltip id='button-tooltip' contentStyle={{backgroundColor: 'black'}} {...props}>
			{toolTipText}
		</Tooltip>
	);

	return (
		<>
			{access === true ? (
				<>
					{!isDisable ? (
						<>
							{hasCustomTooltip === true && (
								<OverlayTrigger placement='right' delay={{show: 250, hide: 400}} overlay={<Tooltip id='button-tooltip-2'>{toolTipText}</Tooltip>}>
									<span style={iconStyle} className={iconColor} onClick={onClick}>
										<FontAwesomeIcon icon={faIcon} />
									</span>
								</OverlayTrigger>
							)}

							{!hasCustomTooltip && (
								<span style={iconStyle} className={iconColor} onClick={onClick} title={toolTipText}>
									<FontAwesomeIcon icon={faIcon} />
								</span>
							)}
						</>
					) : (
						<>
							{hasCustomTooltip ? (
								<OverlayTrigger placement='right' delay={{show: 250, hide: 400}} overlay={<Tooltip id='button-tooltip-2'>{toolTipText}</Tooltip>}>
									<span style={disAbleIconStyle} className='d-inline-flex align-items-center'>
										<FontAwesomeIcon icon={faIcon} />
									</span>
								</OverlayTrigger>
							) : (
								<span style={disAbleIconStyle} className='d-inline-flex align-items-center' title={toolTipText}>
									<FontAwesomeIcon icon={faIcon} />
								</span>
							)}
						</>
					)}
				</>
			) : null}
		</>
	);
};

export default TableIconButton;
