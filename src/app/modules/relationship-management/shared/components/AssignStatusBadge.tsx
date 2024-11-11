import {ElementStyle} from '../../../../constants/Constants';
import {MlabBadge} from '../../../../custom-components';
type AssignStatusBadgeProps = {
	assignStatus: any;
};

const AssignStatusBadge = ({assignStatus}: AssignStatusBadgeProps) => {
	return (
		<>
			{assignStatus === true && <MlabBadge label={'Assigned'} weight={'light'} type={'badge'} style={ElementStyle.success} />}
			{assignStatus !== true && <MlabBadge label={'Unassigned'} weight={'light'} type={'badge'} style={ElementStyle.danger} />}
		</>
	);
};

export default AssignStatusBadge;
