import React from 'react';
import {ElementStyle} from '../../../../constants/Constants';
import {MlabBadge} from '../../../../custom-components';
type PlayerStatusBadgeProps = {
	status: string;
};
const PlayerStatusBadge = ({status}: PlayerStatusBadgeProps) => {
	return (
		<>
			{status === 'Active' && <MlabBadge label={status} weight={'light'} type={'badge'} style={ElementStyle.success} />}
			{(status === 'Incomplete' || status === 'Created' || status === 'Initial') && (
				<MlabBadge label={status} weight={'light'} type={'badge'} style={ElementStyle.primary} />
			)}
			{(status === 'Closed by company' ||
				status === 'Closed by player' ||
				status === 'Self excluded' ||
				status === 'Suspended' ||
				status === 'Timed out') && <MlabBadge label={status} weight={'light'} type={'badge'} style={ElementStyle.danger} />}
		</>
	);
};

export default PlayerStatusBadge;
