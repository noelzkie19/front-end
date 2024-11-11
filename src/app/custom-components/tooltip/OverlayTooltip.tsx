import {faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const iconStyle = {
	color: 'green',
	cursor: 'pointer',
};

interface Props {
	message?: any;
}

const OverlayTooltip: React.FC<Props> = ({message, ...props}) => {
	const renderTooltip = () => (
		<Tooltip id='button-tooltip' {...props}>
			{message}
		</Tooltip>
	);

	return (
		<OverlayTrigger placement='right' delay={{show: 250, hide: 400}} overlay={renderTooltip}>
			<span className='h4'>
				<FontAwesomeIcon role='button' icon={faInfoCircle} style={iconStyle} title={'add info here'} />
			</span>
		</OverlayTrigger>
	);
};

export default OverlayTooltip;
