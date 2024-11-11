import {useState} from 'react';
import {MessageTypeOptionModel, OptionListModel} from '../../../../common/model';
import {GetCaseTypeOptionList, GetDateByOptionList, GetMessageTypeOptionList} from '../../../../common/services';
import useConstant from '../../../../constants/useConstant';
import {CodeListModel, GetCodeListByIdRequest, OperatorInfoModel, PCSCommunicationProviderOptionResponseModel} from '../../models';
import {LanguageResponseModel} from '../../models/LanguageResponseModel';
import {PostChatSurveyLookupsResponseModel} from '../../models/response/PostChatSurveyLookupsResponseModel';
import {
	getAllBrand,
	getAllCurrency,
	getCodeListById,
	GetAllOperator,
	GetLanguageOptionList,
	getPCSCommunicationProviderOption,
	getPostChatSurveyLookups,
	GetSubtopicOptionsById,
	getSurveyTemplateById,
	getSurveyTemplateByIdResult,
	GetTopicOptionsByCode,
	sendCodeListById,
	GetTicketFieldsList,
} from '../../redux/SystemService';
import {GetSurveyTemplateByIdRequestModel} from '../../models/requests/GetSurveyTemplateByIdRequestModel';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {SurveyTemplateRequestModel} from '../../models/SurveyTemplateRequestModel';
import {Guid} from 'guid-typescript';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../setup';
import {IAuthState} from '../../../auth';
import { USER_CLAIMS } from '../../../user-management/components/constants/UserClaims';

const useSystemOptionHooks = () => {
	/**
	 *  ? Connections
	 */
	const messagingHub = hubConnection.createHubConnenction();

	/**
	 *  ? Redux
	 */
	const {userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	/**
	 *  ? Constants
	 */
	const {successResponse, HubConnected} = useConstant();

	/**
	 * ? States
	 */
	const [brandOptionList, setBrandOptionList] = useState<Array<OptionListModel>>([]);
	const [isBrandLoading, setIsBrandLoading] = useState<boolean>(false);

	const [currencyOptionList, setCurrencyOptionList] = useState<Array<OptionListModel>>([]);
	const [isCurrencyLoading, setIsCurrencyLoading] = useState<boolean>(false);

	const [caseTypeOptionList, setCaseTypeOptionList] = useState<Array<OptionListModel>>([]);
	const [isCaseTypeLoading, setIsCaseTypeLoading] = useState<boolean>(false);

	const [languageOptions, setLanguageOptions] = useState<Array<LanguageResponseModel>>([]);
	const [ticketFieldsOptions, setTicketFieldsOptions] = useState<Array<OptionListModel>>([]);
	const [isLanguageLoading, setIsLanguageLoading] = useState<boolean>(false);

	const [postChatSurveyOptions, setPostChatSurveyOptions] = useState<PostChatSurveyLookupsResponseModel>({
		licenses: [],
		skills: [],
		licenseByBrandMessageType: [],
		skillsByLicense: [],
	});
	const [isPostChatSurveyLoading, setIsPostChatSurveyLoading] = useState<boolean>(false);

	const [topicLanguageOptions, setTopicLanguageOptions] = useState<Array<OptionListModel>>([]);
	const [isTopicLanguageLoading, setIsTopicLanguageLoading] = useState<boolean>(false);

	const [subtopicLanguageOptions, setSubtopicLanguageOptions] = useState<Array<OptionListModel>>([]);
	const [isSubtopicLanguageLoading, setIsSubtopicLanguageLoading] = useState<boolean>(false);

	const [pcsCommunicationProviderOption, setPcsCommunicationProviderOption] = useState<Array<PCSCommunicationProviderOptionResponseModel>>([]);

	const [messageTypeOptionList, setMessageTypeOptionList] = useState<Array<OptionListModel>>([]);

	const [surveyTemplateInfo, setSurveyTemplateInfo] = useState<SurveyTemplateRequestModel>();

	const [codeListInfo, setCodeListInfo] = useState<CodeListModel>();
	const [operatorOptionList, setOperatorOptionList] = useState<Array<OptionListModel>>([]);
	const [isOperatorLoading, setIsOperatorLoading] = useState<boolean>(false);

	const [dateByOptions, setDateByOptions] = useState<Array<OptionListModel>>([]);
	/**
	 *  ? Methods
	 */

	const checkAccess = (_access: any, _id: any, _page: any) => {
		if (_id !== 0) {
			if ((_page === 'v' && !_access.includes(USER_CLAIMS.PaymentMethodRead)) ||
				(_page === 'e' && !_access.includes(USER_CLAIMS.PaymentMethodWrite)) ||
				(!_access.includes(USER_CLAIMS.PaymentMethodRead) && _access.includes(USER_CLAIMS.PaymentMethodWrite))){
				return false;
			}
			return true;
		}
		return false;
	}

	const getBrandOptions = (_userId?: number, _platformId?: number) => {
		setIsBrandLoading(true);
		getAllBrand(_userId, _platformId)
			.then((response) => {
				if (response.status === successResponse) {
					let brandTempList = Array<OptionListModel>();
					response.data.forEach((item) => {
						const brandOption: OptionListModel = {
							value: item.brandId.toString(),
							label: item.brandName,
						};
						brandTempList.push(brandOption);
					});
					setBrandOptionList(brandTempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
					setIsBrandLoading(false);
				} else {
					setIsBrandLoading(false);
				}
			})
			.catch(() => {
				setIsBrandLoading(false);
				console.log('Problem in getting brand list');
			});
	};

	const getCurrencyOptions = () => {
		setIsCurrencyLoading(true);
		getAllCurrency()
			.then((response) => {
				if (response.status === successResponse) {
					let currencyTempList = Array<OptionListModel>();

					response.data.forEach((item) => {
						const currencyOption: OptionListModel = {
							value: item.id.toString(),
							label: item.name,
						};
						currencyTempList.push(currencyOption);
					});

					setCurrencyOptionList(currencyTempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));

					setIsCurrencyLoading(false);
				} else {
					setIsCurrencyLoading(false);
					console.log('Problem in currency list');
				}
			})
			.catch(() => {
				setIsCurrencyLoading(false);
				console.log('Problem in currency list');
			});
	};

	const getCaseTypeOptions = () => {
		setIsCaseTypeLoading(true);
		GetCaseTypeOptionList()
			.then((response) => {
				if (response.status === successResponse) {
					let tempList = Array<OptionListModel>();
					response.data.forEach((item) => {
						const OptionValue: OptionListModel = {
							value: item.caseTypeId,
							label: item.caseTypeName,
						};
						tempList.push(OptionValue);
					});

					setCaseTypeOptionList(tempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
					setIsCaseTypeLoading(false);
				} else {
					setIsCaseTypeLoading(false);
				}
			})
			.catch(() => {
				setIsCaseTypeLoading(false);
			});
	};

	const getLanguageOptions = () => {
		setIsLanguageLoading(true);
		GetLanguageOptionList()
			.then((response) => {
				if (response.status === successResponse) {
					let data = Object.assign(new Array<LanguageResponseModel>(), response.data);
					setLanguageOptions(data);
					setIsLanguageLoading(false);
				} else {
					setIsLanguageLoading(false);
					console.log('Problem in getting language list');
				}
			})
			.catch(() => {
				setIsLanguageLoading(false);
				console.log('Problem in getting language list');
			});
	};

	const getTicketFieldsOptions = () => {
		setIsLanguageLoading(true);
		GetTicketFieldsList()
			.then((response) => {
				if (response.status === successResponse) {
					let fieldList = Array<OptionListModel>();
					response.data.forEach((item: any) => {
						const OptionValue: OptionListModel = {
							value: item.id.toString(),
							label: item.fieldName,
						};
						fieldList.push(OptionValue);
					});
					setTicketFieldsOptions(fieldList);
					setIsLanguageLoading(false);
				} else {
					setIsLanguageLoading(false);
					console.log('Problem in getting ticket fields list');
				}
			})
			.catch(() => {
				setIsLanguageLoading(false);
				console.log('Problem in getting ticket fields list');
			});
	};

	const getPostChatSurveyOptions = () => {
		setIsPostChatSurveyLoading(true);
		getPostChatSurveyLookups()
			.then((response) => {
				if (response.status === successResponse) {
					let data = Object.assign({} as PostChatSurveyLookupsResponseModel, response.data);
					setPostChatSurveyOptions(data);
					setIsPostChatSurveyLoading(false);
				} else {
					setIsPostChatSurveyLoading(false);
					console.log('Problem in getting post chat survey lookups');
				}
			})
			.catch(() => {
				setIsPostChatSurveyLoading(false);
				console.log('Problem in getting post chat survey lookups');
			});
	};

	const getTopicLanguageOptions = async (languageCode: string, caseTypeId: number) => {
		setIsTopicLanguageLoading(true);
		GetTopicOptionsByCode(languageCode, caseTypeId)
			.then((response) => {
				if (response.status === successResponse) {
					let optionList = Array<OptionListModel>();
					response.data.forEach((item: any) => {
						const OptionValue: OptionListModel = {
							value: item.topicLanguageId,
							label: item.topicLanguageTranslation,
						};
						optionList.push(OptionValue);
					});
					setTopicLanguageOptions(optionList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
					setIsTopicLanguageLoading(false);
				} else {
					setIsTopicLanguageLoading(false);
					console.log('Problem in getting language topic list');
				}
			})
			.catch(() => {
				setIsTopicLanguageLoading(false);
				console.log('Problem in getting language topic list');
			});
	};

	const getSubtopicLanguageOptions = (topicLanguageId: number) => {
		setIsSubtopicLanguageLoading(true);
		GetSubtopicOptionsById(topicLanguageId)
			.then((response) => {
				if (response.status === successResponse) {
					let optionList = Array<OptionListModel>();
					response.data.forEach((item: any) => {
						const OptionValue: OptionListModel = {
							value: item.subtopicLanguageId,
							label: item.subtopicLanguageTranslation,
						};
						optionList.push(OptionValue);
					});
					setSubtopicLanguageOptions(optionList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
					setIsSubtopicLanguageLoading(false);
				} else {
					setIsSubtopicLanguageLoading(false);
					console.log('Problem in getting language subtopic list');
				}
			})
			.catch(() => {
				setIsSubtopicLanguageLoading(false);
				console.log('Problem in getting language subtopic list');
			});
	};

	const getPCSCommunicationProviderOptions = () => {
		getPCSCommunicationProviderOption()
			.then((response) => {
				if (response.status === successResponse) {
					setPcsCommunicationProviderOption(response.data);
				} else {
					console.log('Problem in getting PCS Communication ProviderOption list');
				}
			})
			.catch(() => {
				setIsSubtopicLanguageLoading(false);
				console.log('Problem in getting language subtopic list');
			});
	};

	const getMessageTypeOptionList = (channelTypeId: string) => {
		GetMessageTypeOptionList(channelTypeId)
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

					setMessageTypeOptionList(tempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
				}
			})
			.catch(() => {
				//disableSplashScreen()
				console.log('Problem in message type brand list');
			});
	};

	const getSurveyTemplateInfo = (_request: GetSurveyTemplateByIdRequestModel) => {
		messagingHub
			.start()
			.then(() => {
				getSurveyTemplateById(_request)
					.then(() => {
						messagingHub.on(_request.queueId.toString(), (message) => {
							getSurveyTemplateByIdResult(message.cacheId)
								.then((returnData) => {
									const data = Object.assign(returnData.data);
									setSurveyTemplateInfo(data);
								})
								.catch(() => {
									console.log('Problem in fetching survey template info');
								});
							messagingHub.off(_request.queueId.toString());
						});
						setTimeout(() => {
							if (messagingHub.state === 'Connected') {
								messagingHub.stop();
							}
						}, 30000);
					})
					.catch(() => {
						console.log('Problem in getting Survey template Result');
					});
			})
			.catch(() => {
				console.log('Problem in getting Survey template Info');
			});
	};
	const getAllOperator = () => {
		setIsOperatorLoading(true);
		GetAllOperator()
			.then((response) => {
				if (response.status === successResponse) {
					let allOperators = Object.assign(new Array<OperatorInfoModel>(), response.data);
					let operatorTempList = Array<OptionListModel>();

					allOperators.forEach((item) => {
						const operatorOption: OptionListModel = {
							value: item.operatorId.toString(),
							label: item.operatorName,
						};
						operatorTempList.push(operatorOption);
					});
					setOperatorOptionList(operatorTempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
					setIsOperatorLoading(false);
				} else {
					console.log('Failed', 'Problem in getting all operator list');
				}
			})
			.catch(() => {
				console.log('Failed', 'Problem in getting all operator list');
			});
	};

	const getSystemCodelist = (_codeListPageId: number) => {
		messagingHub.start().then(() => {
			const request: GetCodeListByIdRequest = {
				queueId: Guid.create().toString(),
				userId: userId?.toString() ?? '0',
				codeListId: _codeListPageId,
			};
			sendCodeListById(request)
				.then((response) => {
					if (response.status === successResponse) {
						messagingHub.on(request.queueId.toString(), (message) => {
							getCodeListById(message.cacheId)
								.then((returnData) => {
									const data = Object.assign(returnData.data);
									setCodeListInfo(data);
								})
								.catch(() => {
									console.log('error on geting code list');
								});
							messagingHub.off(request.queueId.toString());
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
					console.log('Failed', 'Problem in getting message type list');
				});
		});
	};

	const getDateByOptionList = () => {
		GetDateByOptionList()
		.then((response) => {
			if(response.status === successResponse) {
				let dateBy = Object.assign(new Array<OptionListModel>(), response.data);
				let tempList = Array<OptionListModel>();
				
				dateBy.forEach((item) => {
					tempList.push(item);
				});

				setDateByOptions(tempList)
			}
		})
	}

	return {
		checkAccess,
		getBrandOptions,
		brandOptionList,
		isBrandLoading,
		getCurrencyOptions,
		currencyOptionList,
		isCurrencyLoading,
		getCaseTypeOptions,
		caseTypeOptionList,
		isCaseTypeLoading,
		getLanguageOptions,
		getTicketFieldsOptions,
		ticketFieldsOptions,
		languageOptions,
		isLanguageLoading,
		getPostChatSurveyOptions,
		postChatSurveyOptions,
		isPostChatSurveyLoading,
		getTopicLanguageOptions,
		topicLanguageOptions,
		isTopicLanguageLoading,
		getSubtopicLanguageOptions,
		subtopicLanguageOptions,
		isSubtopicLanguageLoading,
		getPCSCommunicationProviderOptions,
		pcsCommunicationProviderOption,
		getMessageTypeOptionList,
		messageTypeOptionList,
		getSurveyTemplateInfo,
		surveyTemplateInfo,
		getSystemCodelist,
		codeListInfo,
		getAllOperator,
		operatorOptionList,
		isOperatorLoading,
		getDateByOptionList,
		dateByOptions
	};
};

export {useSystemOptionHooks};