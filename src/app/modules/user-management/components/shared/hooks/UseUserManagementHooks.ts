import {useState} from 'react';
import swal from 'sweetalert';
import * as hubConnection from '../../../../../../setup/hub/MessagingHub';
import {MessageGroupEnum} from '../../../../../constants/Constants';
import useConstant from '../../../../../constants/useConstant';
import {GetAppConfigSettingByApplicationIdResponseModel} from '../../../../system/models/response/GetAppConfigSettingByApplicationIdResponseModel';
import {getAppConfigSettingByApplicationId} from '../../../../system/redux/SystemService';
import {CommunicationProviderAccountListbyIdResponseModel, CommunicationProviderAccountUdt, UserIdRequestModel} from '../../../models/index';
import {
	getCommProviderUserListOption,
	getCommunicationProviderAccountListbyId,
	getCommunicationProviderAccountListbyIdResult,
	getCommunicationProviderAccountListByUserId,
	getTeamListbyUserIdOption,
} from '../../../redux/UserManagementService';
import { LookupModel } from '../../../../../common/model';

export const UseUserManagementHooks = () => {
	/**
	 *  ? Constant
	 */
	const {successResponse, HubConnected} = useConstant();

	const [communicationProviderStatusOptions, setCommunicationProviderStatusOptions] = useState<Array<any>>([]);
	const [communicationProviderAccountList, setCommunicationProviderAccountList] = useState<Array<CommunicationProviderAccountListbyIdResponseModel>>(
		[]
	);
	const [communicationProviderAccounts, setCommunicationProviderAccounts] = useState<Array<CommunicationProviderAccountUdt>>([]);

	const [appConfigSettingList, setAppConfigSettingList] = useState<Array<GetAppConfigSettingByApplicationIdResponseModel>>([]);
	const [commProviderUserList, setCommProviderUserList] = useState<Array<LookupModel>>([]);
	const [teamsByUserIdList, setTeamsByUserIdList] = useState<Array<LookupModel>>([]);

	const getCommunicationProviderAccountStatusOptions = () => {
		let communicationProviderStatus = [
			{label: 'Active', value: '1'},
			{label: 'Inactive', value: '0'},
		];
		setCommunicationProviderStatusOptions(communicationProviderStatus);
	};

	const getCommunicationProviderAccountList = (_userIdRequest: UserIdRequestModel) => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						getCommunicationProviderAccountListbyId(_userIdRequest)
							.then((response) => {
								// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
								if (response.status === successResponse) {
									messagingHub.on(_userIdRequest.queueId.toString(), (message) => {
										getCommunicationProviderAccountListbyIdResult(message.cacheId)
											.then((data) => {
												let responseData = data.data;
												setCommunicationProviderAccountList(responseData);
											})
											.catch(() => {
												console.log('Problem in communication provider account list');
											});
										messagingHub.off(_userIdRequest.queueId.toString());
										messagingHub.stop();
									});

									setTimeout(() => {
										if (messagingHub.state === HubConnected) {
											messagingHub.stop();
										}
									}, 30000);
								} else {
									messagingHub.stop();
									console.log('Problem in communication provider account list');
								}
							})
							.catch(() => {
								messagingHub.stop();
								console.log('Problem in communication provider account list');
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const getCommunicationProviderAccounts = (_userId: number, _hasValidationCount: boolean, _validationMessage: string) => {
		getCommunicationProviderAccountListByUserId(_userId)
			.then((response) => {
				if (_hasValidationCount) {
					if (response.data.filter((obj) => obj.messageGroupId === MessageGroupEnum.Call).length === 0) swal('Failed', _validationMessage, 'error');
				}
				setCommunicationProviderAccounts(response.data);
			})
			.catch(() => {
				swal('Failed', 'Problem in getting getCommunicationProviderAccounts', 'error');
			});
	};

	const getAppconfigSettings = (_applicationId: number) => {
		getAppConfigSettingByApplicationId(_applicationId)
			.then((response) => {
				if (response.status === successResponse) {
					setAppConfigSettingList(response.data);
				}
			})
			.catch((ex) => console.log('having problem getting application config' + ex));
	};

	const getCommProviderUserList = () => {
		getCommProviderUserListOption().then((response) => {
			if (response.status === successResponse) {
				setCommProviderUserList(response.data);
			}
		}).catch((ex) => console.log('problem in fetching user list' + ex));
	};

	const getTeamListByUserId = (_userId: number) => {
		getTeamListbyUserIdOption(_userId).then((response) => {
			if (response.status === successResponse) {
				setTeamsByUserIdList(response.data);
			}
		}).catch((ex) => console.log('problem in fetching user list' + ex));
	};

	return {
		getCommunicationProviderAccountStatusOptions,
		communicationProviderStatusOptions,
		getCommunicationProviderAccountList,
		communicationProviderAccountList,
		getCommunicationProviderAccounts,
		communicationProviderAccounts,
		getAppconfigSettings,
		appConfigSettingList,
		getCommProviderUserList,
		commProviderUserList,
		getTeamListByUserId,
		teamsByUserIdList
	};
};
