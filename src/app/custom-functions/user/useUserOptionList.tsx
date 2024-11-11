import React, {useEffect, useState} from 'react';
import useConstant from '../../constants/useConstant';
import {UserOptionModel} from '../../modules/user-management/models';
import {UserInfoListModel} from '../../modules/user-management/models/UserInfoListModel';
import {GetUserOptions} from '../../modules/user-management/redux/UserManagementService';

const useUserOptionList = () => {
	//States
	const [userList, setUserList] = useState<Array<UserOptionModel>>([]);
	// Constant
	const {successResponse} = useConstant();
	useEffect(() => {
		GetUserOptions().then((response) => {
			if (response.status === successResponse) {
				let resultData = Object.assign(new Array<UserOptionModel>(), response.data);
				setUserList(resultData);
			}
		});
	}, []);

	return {userList};
};

export default useUserOptionList;
