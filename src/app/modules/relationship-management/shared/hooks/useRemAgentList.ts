//temporary user list

import {Guid} from 'guid-typescript';
import {useEffect, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {LookupModel} from '../../../../shared-models/LookupModel';
import {UserFilterModel} from '../../../user-management/models/UserFilterModel';
import {UserInfoListModel} from '../../../user-management/models/UserInfoListModel';
import {getUserList, getUserListResult} from '../../../user-management/redux/UserManagementService';
const useRemAgentList = () => {
	const [users, setUsers] = useState<Array<LookupModel>>();
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const messagingHub = hubConnection.createHubConnenction();

	useEffect(() => {
		const request: UserFilterModel = {
			email: '',
			fullName: '',
			statuses: '',
			teams: '',
			userIdRequest: 0,
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};
		getUserList(request)
			.then((response) => {
				if (response.status === 200) {
					messagingHub.on(request.queueId.toString(), (message) => {
						getUserListResult(message.cacheId)
							.then((data) => {
								let resultData = Object.assign(new Array<UserInfoListModel>(), data.data);
								console.log('resultData');
								console.log(resultData);

								let optionTempList = Array<LookupModel>();

								resultData.forEach((item) => {
									const tempOption: LookupModel = {
										value: item.userId.toString(),
										label: item.fullName,
									};
									optionTempList.push(tempOption);
								});

								setUsers(optionTempList);
							})
							.catch(() => {
								swal('Failed', 'Problem in getting user list', 'error');
							});
						messagingHub.off(request.queueId.toString());
						messagingHub.stop();
					});
				} else {
					messagingHub.stop();
				}
			})
			.catch(() => {
				messagingHub.stop();
			});
	}, []);

	return users;
};

export default useRemAgentList;
