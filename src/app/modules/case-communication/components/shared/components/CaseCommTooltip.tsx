import React from 'react';
import {Toast} from 'react-bootstrap-v5';

interface Props {
	message?: any;
	showCaseCommToolTip: boolean;
}
const CaseCommTooltip: React.FC<Props> = ({message, showCaseCommToolTip}) => {
	return (
		<Toast show={showCaseCommToolTip} style={{position: 'relative', marginBottom: 60, width: 'auto'}}>
			<Toast.Body>{message}</Toast.Body>
		</Toast>
	);
};

export {CaseCommTooltip};
