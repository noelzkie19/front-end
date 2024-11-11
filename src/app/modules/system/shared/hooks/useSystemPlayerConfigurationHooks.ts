import useConstant from '../../../../constants/useConstant';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../setup';
import { useState } from 'react';
import { PlayerConfigurationModel } from '../../models';
import { GetPlayerConfigurationByIdRequestModel } from '../../models/requests/GetPlayerConfigurationByIdRequestModel';
import {Guid} from 'guid-typescript';
import { getPlayerConfigurationById, getPlayerConfigurationByIdResult, saveCodeDetailsList, saveCodeDetailsListResult } from '../../redux/SystemService';
import swal from 'sweetalert';
import { StatusCode } from '../../components/constants/PlayerConfigEnums';
import { UpsertPlayerConfigTypeRequestModel } from '../../models/UpsertPlayerConfigTypeRequestModel';
import { useHistory } from 'react-router-dom';

const useSystemPlayerConfigurationHooks = () => {
	/**
	 *  ? Connections
	 */
	const messagingHub = hubConnection.createHubConnenction();
	const history = useHistory();

	/**
	 *  ? Redux
	 */
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const {SwalFailedMessage, SwalServerErrorMessage, SwalSuccessMessage} = useConstant();

	/**
	 *  ? Constants
	 */
	const [playerConfigurationInfo, setPlayerConfigurationInfo] = useState<PlayerConfigurationModel>();

	/**
	 *  ? Methods
	 */
	const getPlayerConfigInfoById = (id: number) => {
		setTimeout(() => {
			const request: GetPlayerConfigurationByIdRequestModel = {
				id: id,
				userId: userAccessId.toString(),
				queueId: Guid.create().toString(),
			};
			messagingHub.start().then(() => {
				getPlayerConfigurationById(request).then((response) => {
					if (response.status === StatusCode.OK) {
						messagingHub.on(request.queueId.toString(), (message) => {
							getPlayerConfigurationByIdResult(message.cacheId)
								.then((returnData) => {
									const item = Object.assign(returnData.data);
									setPlayerConfigurationInfo(item);
									messagingHub.off(request.queueId.toString());
									messagingHub.stop();
								})
								.catch(() => {
									swal('Failed', 'getPlayerConfigurationById', 'error');
								});
						});

						setTimeout(() => {
							if (messagingHub.state === StatusCode.Connected) {
								messagingHub.stop();
							}
						}, 30000);
					} else {
						swal('Failed', response.data.message, 'error');
					}
				});
			});
		}, 1000);
	};

	const saveDetails = (request: UpsertPlayerConfigTypeRequestModel, config: string) => {
		messagingHub.start().then(() => {
			if (messagingHub.state === StatusCode.Connected) {
				saveCodeDetailsList(request).then((response) => {
					if (response.status === StatusCode.OK) {
						messagingHub.on(request.queueId.toString(), (message) => {
							saveCodeDetailsListResult(message.cacheId)
								.then(() => {
									if (response.status !== StatusCode.OK) {
										swal(SwalFailedMessage.title, 'Error Saving '+ config +' Details', SwalFailedMessage.icon);
									} else {
										messagingHub.off(request.queueId.toString());
										messagingHub.stop();
										swal(SwalSuccessMessage.title, 'The data has been submitted', SwalSuccessMessage.icon);

										history.push('/system/player-configuration-list');
									}
								})
								.catch((ex) => {
									swal(SwalFailedMessage.title, 'save'+ config +'ListResult: ' + ex, SwalFailedMessage.icon);
								});
						});
					} else {
						swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
					}
				});
			}
		});
	}

	return {
		getPlayerConfigInfoById,
		playerConfigurationInfo,
		saveDetails
	};
};

export {useSystemPlayerConfigurationHooks};
