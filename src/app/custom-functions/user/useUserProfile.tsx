import React, {useEffect, useState} from 'react';
import * as hubConnection from '../../../setup/hub/MessagingHub';
import {UserIdRequestModel} from '../../modules/user-management/models/UserIdRequestModel';
import {Guid} from 'guid-typescript';
import {RootState} from '../../../setup';
import {useSelector, shallowEqual} from 'react-redux';
import {getUserById, getUserByIdInfo} from '../../modules/user-management/redux/UserManagementService';
import {UserModel} from '../../modules/user-management/models/UserModel';

export default function useUserProfile() {
	// -----------------------------------------------------------------
	// REDUX STORE
	// -----------------------------------------------------------------
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	// -----------------------------------------------------------------
	// STATE
	// -----------------------------------------------------------------
	const [userProfile, setUserProfile] = useState<UserModel>();

	useEffect(() => {
		const messagingHub = hubConnection.createHubConnenction();
		messagingHub.start().then(() => {
			const request: UserIdRequestModel = {
				queueId: Guid.create().toString(),
				userId: userAccessId.toString(),
				userIdRequest: userAccessId,
			};

			getUserById(request).then((response) => {
				if (response.data.status === 200) {
					messagingHub.on(request.queueId.toString(), (message) => {
						getUserByIdInfo(message.cacheId)
							.then((data) => {
								setUserProfile(data.data);
							})
							.catch((ex: any) => {
								console.log(ex);
							});
						messagingHub.off(request.queueId.toString());
						messagingHub.stop();
					});
				} else {
					console.log(response.data.message);
				}
			});
		});
	}, []);

	return userProfile;
}
