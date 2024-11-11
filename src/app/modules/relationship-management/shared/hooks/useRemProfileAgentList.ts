import {useEffect, useState} from 'react';
import useConstant from '../../../../constants/useConstant';
import {RemAgentProfileDetailsResponse} from '../../models/response/RemAgentProfileDetailsResponse';
import {GetReusableRemProfileDetails} from '../../services/RemProfileApi';

const useRemProfileAgentList = () => {
	const [profileAgentList, setProfileAgentList] = useState<Array<RemAgentProfileDetailsResponse>>([]);
	const {successResponse} = useConstant();

	useEffect(() => {
		GetReusableRemProfileDetails()
			.then((response) => {
				if (response.status === successResponse) {
					let remProfileData = Object.assign(new Array<RemAgentProfileDetailsResponse>(), response.data);

					setProfileAgentList(remProfileData);
				} else {
					console.log('Problem loading reusable rem profile list');
				}
			})
			.catch(() => {
				console.log('Problem loading reusable rem profile list');
			});
	}, []);

	return profileAgentList;
};

export default useRemProfileAgentList;
