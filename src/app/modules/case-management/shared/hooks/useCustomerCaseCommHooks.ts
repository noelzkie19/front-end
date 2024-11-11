import {useState} from 'react';
import {useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import {MessageTypeOptionModel, OptionListModel} from '../../../../common/model';
import {GetMessageTypeOptionList} from '../../../../common/services';
import {ChannelType} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {getAllMessageType} from '../../../system/redux/SystemService';
import {CustomerCaseCommunicationInfoResponseModel, CustomerServiceCaseInformationResponseModel} from '../../models';
import {CustomerCaseCommunicationFeedbackModel} from '../../models/CustomerCaseCommunicationFeedbackModel';
import {CustomerCaseCommunicationSurveyModel} from '../../models/CustomerCaseCommunicationSurveyModel';
import {
	GetCaseCommunicationFeedbackAsync,
	GetCaseCommunicationInfoAsync,
	GetCaseCommunicationSurveyAsync,
	GetCustomerServiceCaseInformationById,
} from '../../services/CustomerCaseApi';

const useCustomerCaseCommHooks = () => {
	/**
	 *  ? Constant
	 */
	const {successResponse, noContentResponse, message} = useConstant();
	const history = useHistory();
	/**
	 *  ? States
	 */
	const [messageTypeOptions, setMessageTypeOptions] = useState<Array<OptionListModel>>([]);
	const [caseInformations, setCaseInformations] = useState<CustomerServiceCaseInformationResponseModel>();
	const [caseCommunication, setCaseCommunication] = useState<CustomerCaseCommunicationInfoResponseModel>();
	const [messageTypeWithFilterOptions, setMessageTypeWithFilterOptions] = useState<Array<OptionListModel>>([]);
	const [caseCommunicationFeedback, setCaseCommunicationFeedback] = useState<Array<CustomerCaseCommunicationFeedbackModel>>([]);
	const [caseCommunicationSurvey, setCaseCommunicationSurvey] = useState<Array<CustomerCaseCommunicationSurveyModel>>([]);
	const [chatIntegrationMessageTypeOptions, setChatIntegrationMessageTypeOptions] = useState<Array<OptionListModel>>([]);

	const getAllMessageTypeOptions = (channelTypes: string) => {
		GetMessageTypeOptionList(channelTypes)
			.then((response) => {
				if (response.status === successResponse) {
					let subTopics = Object.assign(new Array<MessageTypeOptionModel>(), response.data);

					let tempList = Array<OptionListModel>();

					subTopics.forEach((item) => {
						const OptionValue: OptionListModel = {
							value: item.messageTypeId,
							label: item.messageTypeName,
						};
						tempList.push(OptionValue);
					});

					setMessageTypeOptions(tempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
				}
			})
			.catch(() => {
				//disableSplashScreen()
				swal('Failed', message.codeList.messageTypeOptionListError, 'error');
			});
	};

	const getCustomerServiceCaseInformationById = (_caseId: number, userId: number) => {
		GetCustomerServiceCaseInformationById(_caseId, userId)
			.then((response) => {
				if (response.status === successResponse) {
					let data = Object.assign(response.data);
					setCaseInformations(data);
				} else if (response.status === noContentResponse) {
					history.push('/error/401');
				} else {
					swal('Failed', message.customerCase.caseInformationError, 'error');
				}
			})
			.catch(() => {
				swal('Failed', message.customerCase.caseInformationError, 'error');
			});
	};

	const getCaseCommunicationInfo = (_communicationid: number, userId: number) => {
		GetCaseCommunicationInfoAsync(_communicationid, userId)
			.then((response) => {
				if (response.status === successResponse) {
					if (response.data.customerCaseCommunicationInfo === undefined || response.data.customerCaseCommunicationInfo === null) {
						history.push('/error/401');
					}

					setCaseCommunication(response.data.customerCaseCommunicationInfo);
					setCaseCommunicationFeedback(response.data.customerCaseCommunicationFeedback);
					setCaseCommunicationSurvey(response.data.customerCaseCommunicationSurvey);
				}
			})
			.catch((ex: any) => {
				console.log('[ERROR] Customer Case: ' + ex);
				swal('Failed', message.customerCase.caseCommunicationsError, 'error');
			});
	};

	const getAllMessageTypeOptionsWithFilters = (CHANNEL_TYPES: string) => {
		getAllMessageType().then((response) => {
			if (response.status === successResponse) {
				let channelTypeId = CHANNEL_TYPES;
				let messagetypes = response.data.filter((messageType) => {
					let channelTypes = messageType.channelTypeId.replace(/ /g, '').split(',');
					if (channelTypes.some((a) => channelTypeId.includes(a))) {
						return true;
					}
				});

				let tempList = Array<OptionListModel>();

				messagetypes.forEach((item) => {
					const OptionValue: OptionListModel = {
						value: item.messageTypeId !== undefined ? item.messageTypeId.toString() : '',
						label: item.messageTypeName,
					};
					tempList.push(OptionValue);
				});

				setMessageTypeWithFilterOptions(tempList);
			} else {
				swal('Failed', message.codeList.messageTypeOptionListError, 'error');
			}
		});
	};

	const getCaseCommunicationFeedback = (_communicationId: number) => {
		GetCaseCommunicationFeedbackAsync(_communicationId)
			.then((response) => {
				if (response.status === successResponse) {
					setCaseCommunicationFeedback(response.data);
				}
			})
			.catch((ex: any) => {
				console.log('[ERROR] Customer Case: ' + ex);
				swal('Failed', message.customerCase.communicationFeedbackError, 'error');
			});
	};

	const getCaseCommunicationSurvey = (_communicationId: number) => {
		GetCaseCommunicationSurveyAsync(_communicationId)
			.then((response) => {
				if (response.status === successResponse) {
					setCaseCommunicationSurvey(response.data);
				}
			})
			.catch((ex: any) => {
				console.log('[ERROR] Customer Case: ' + ex);
				swal('Failed', message.customerCase.communicationSurveyError, 'error');
			});
	};

	const getChatIntegrationMessageTypeOptions = () => {
		GetMessageTypeOptionList(ChannelType.ChatIntegrationId)
			.then((response) => {
				if (response.status === successResponse) {
					let subTopics = Object.assign(new Array<MessageTypeOptionModel>(), response.data);

					let tempList = Array<OptionListModel>();

					subTopics.forEach((item) => {
						const OptionValue: OptionListModel = {
							value: item.messageTypeId,
							label: item.messageTypeName,
						};
						tempList.push(OptionValue);
					});

					setChatIntegrationMessageTypeOptions(tempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
				}
			})
			.catch(() => {
				swal('Failed', message.codeList.messageTypeOptionListError, 'error');
			});
	};

	return {
		getAllMessageTypeOptions,
		messageTypeOptions,
		getCustomerServiceCaseInformationById,
		caseInformations,
		getCaseCommunicationInfo,
		caseCommunication,
		getAllMessageTypeOptionsWithFilters,
		messageTypeWithFilterOptions,
		caseCommunicationFeedback,
		caseCommunicationSurvey,
		getCaseCommunicationFeedback,
		getCaseCommunicationSurvey,
		chatIntegrationMessageTypeOptions,
		getChatIntegrationMessageTypeOptions
	};
};

export default useCustomerCaseCommHooks;
