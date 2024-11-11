// Information:
// This reusable hook will display all list of language details assigned to schedule template
// will return the following columns:
//
// ScheduleTemplateSettingId
// ScheduleTemplateName
// ScheduleTemplateDescription
// CreatedBy
// CreatedDate
// UpdatedBy
// UpdatedDate

import {Guid} from 'guid-typescript';
import {useEffect, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import useConstant from '../../../../constants/useConstant';
import {ScheduleTemplateByIdRequest} from '../../models/request/ScheduleTemplateByIdRequest';
import {ScheduleTemplateResponse} from '../../models/response/ScheduleTemplateResponse';
import {GetScheduleTeplateSettingById, SendGetScheduleTeplateSettingById} from '../../services/RemSettingApi';

const useScheduleDetailsByTemplateId = (id: any) => {
	const [templateDetails, setTemplateDetails] = useState<ScheduleTemplateResponse>();
	const {successResponse, HubConnected} = useConstant();
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	useEffect(() => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						const request: ScheduleTemplateByIdRequest = {
							ScheduleTeplateSettingId: id,
							userId: userAccessId.toString(),
							queueId: Guid.create().toString(),
						};
						SendGetScheduleTeplateSettingById(request)
							.then((response) => {
								// IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
								if (response.status === successResponse) {
									messagingHub.on(request.queueId.toString(), (message) => {
										GetScheduleTeplateSettingById(message.cacheId)
											.then((data) => {
												let responseData = data.data;
												setTemplateDetails(responseData);

												console.log('data ', responseData);
												console.log('data2 ', templateDetails);
											})
											.catch(() => {
												console.log('Problem in language template details');
											});
										messagingHub.off(request.queueId.toString());
										messagingHub.stop();
									});

									setTimeout(() => {
										if (messagingHub.state === HubConnected) {
											messagingHub.stop();
										}
									}, 30000);
								}
							})
							.catch(() => {
								messagingHub.stop();
								console.log('Problem in language template details');
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	}, []);

	return templateDetails;
};

export default useScheduleDetailsByTemplateId;
