import React from 'react';
import {ElementStyle} from '../../../../constants/Constants';
import {MlabButton} from '../../../../custom-components';

const RemProfile: React.FC = () => {
	const openAddRemProfile = () => {
		const win: any = window.open(`/relationship-management/add-rem-profile`, '_blank');
		win.focus();
	};

	const openEditRemProfile = () => {
		const win: any = window.open(`/relationship-management/edit-rem-profile`, '_blank');
		win.focus();
	};
	return (
		<>
			Rem Profile
			<MlabButton access={true} label='Add' style={ElementStyle.secondary} type={'button'} weight={'solid'} size={'sm'} onClick={openAddRemProfile} />
			<MlabButton
				access={true}
				label='Edit'
				style={ElementStyle.secondary}
				type={'button'}
				weight={'solid'}
				size={'sm'}
				onClick={openEditRemProfile}
			/>
		</>
	);
};

export default RemProfile;
