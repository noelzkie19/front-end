import {differenceInMinutes, isAfter} from 'date-fns';
import {Guid} from 'guid-typescript';
import React, {useCallback, useEffect, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../setup';
import {LookupModel, MasterReferenceOptionModel} from '../../../common/model';
import {ChannelType, ElementStyle} from '../../../constants/Constants';
import useConstant from '../../../constants/useConstant';
import {MainContainer, MlabButton} from '../../../custom-components';
import {useBrands, useUserOptionList} from '../../../custom-functions';
import useSystemHooks from '../../../custom-functions/system/useSystemHooks';
import {isJsonSizeValid} from '../../../utils/helper';
import {IAuthState} from '../../auth';
import {useCaseCommHooks, useCaseCommOptions} from '../../case-communication/components/shared/hooks';
import {SwalDetails} from '../../system/components/constants/CampaignSetting';
import {useSystemOptionHooks} from '../../system/shared';
import {USER_CLAIMS} from '../../user-management/components/constants/UserClaims';
import {CASE_TYPE} from '../constants/CaseTypeConstants';
import {
	CustomerCommunicationFeedBackTypeRequestModel,
	CustomerCommunicationSurveyQuestionRequestModel,
	UpSertCustomerServiceCaseCommunicationRequestModel,
} from '../models';
import {UpSertCustomerServiceCaseCommunication} from '../services/CustomerCaseApi';
import {
	CustomerCaseGenInfo,
	CustomerCaseInformation,
	CustomerCommunication,
	CustomerCommunicationFeedback,
	CustomerCommunicationSurvey,
} from '../shared/components';
import useCustomerCaseHooks from '../shared/hooks/UseCustomerCaseHooks';
import useCustomerCaseCommHooks from '../shared/hooks/useCustomerCaseCommHooks';
import useCaseManagementConstant from '../useCaseManagementConstant';

const CreateCustomerServiceCase: React.FC = () => {
	/**
	 *  ? States
	 */
	const {access, userId, fullName} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const createCSCaseUserAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	// General Informations
	const [servicePlayerUsername, setServicePlayerUsername] = useState<any>('');
	const [servicePlayerId, setServicePlayerId] = useState<any>('');
	const [serviceBrand, setServiceBrand] = useState<any>('');
	const [serviceCurrency, setServiceCurrency] = useState<string>('');
	const [serviceCaseTexStatus, setServiceCaseTexStatus] = useState<string>('');
	const [serviceCaseType, setServiceCaseType] = useState<any>('');
	const [serviceCaseOwner, setServiceCaseOwner] = useState<any>('');
	const [serviceVipLevel, setServiceVipLevel] = useState<string>('');
	const [servicePaymentGroup, setServicePaymentGroup] = useState<string>('');
	const [serviceCurrencyCode, setServiceCurrencyCode] = useState<string>('');
	const [campaignNames, setCampaignNames] = useState<Array<LookupModel>>([]);

	// Case Informations
	const [serviceSubject, setServiceSubject] = useState<string>('');
	const [serviceTopic, setServiceTopic] = useState<any>('');
	const [serviceSubtopic, setServiceSubtopic] = useState<any>('');
	const [serviceLanguage, setServiceLanguage] = useState<any>('');

	// Communications
	const [serviceSelectedPurpose, setServiceSelectedPurpose] = useState<any>('');
	const [serviceCommunicationOwner, setServiceCommunicationOwner] = useState<any>('');
	const [serviceSelectedMessageType, setServiceSelectedMessageType] = useState<any>('');
	const [serviceSelectedMessageStatus, setServiceSelectedMessageStatus] = useState<any>('');
	const [serviceSelectedMessageResponse, setServiceSelectedMessageResponse] = useState<any>('');
	const [serviceStartCommunicationDate, setServiceStartCommunicationDate] = useState<any>();
	const [serviceEndCommunicationDate, setServiceEndCommunicationDate] = useState<any>();
	const [serviceOpenStartCommunication, setServiceOpenStartCommunication] = useState<boolean>(false);
	const [openEndCommunication, setOpenEndCommunication] = useState<boolean>(false);
	const [startCommunicationDatePost, setStartCommunicationDatePost] = useState<string>('');
	const [endCommunicationDatePost, setEndCommunicationDatePost] = useState<any>('');
	const [convertedContent, setConvertedContent] = useState<any>();
	const [duration, setDuration] = useState<string>('');
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [playerPostId, setPlayerPostId] = useState<number>(0);
	const [surveyTemplateId, setSurveyTemplateId] = useState<number | null>(null);

	// Communication Feedback
	const [communicationFeedback, setCommunicationFeedback] = useState<Array<CustomerCommunicationFeedBackTypeRequestModel>>([]);

	// Communication Survey
	const [communicationSurvey, setCommunicationSurvey] = useState<Array<CustomerCommunicationSurveyQuestionRequestModel>>([]);

	/**
	 *  ? Hooks
	 */
	const {getAllMessageTypeOptions, messageTypeOptions} = useCustomerCaseCommHooks();
	const {getMessageStatusOptionById, messageStatusOptionList, getMessageResponseOptionById, messageResponseOptionList} = useCaseCommOptions();
	const {getBrandOptions, getCaseTypeOptions, caseTypeOptionList} = useSystemOptionHooks();
	const {
		caseStatus,
		successResponse,
		SwalFailedMessage,
		SwalConfirmMessage,
		messageTypes,
		SwalTransactionSuccessMessage,
		SwalGatewayErrorMessage,
		masterReferenceIds,
	} = useConstant();
	const {userList} = useUserOptionList();
	const {getMasterReference, masterReferenceOptions} = useSystemHooks();
	const history = useHistory();
	const {
		getPlayersByPlayerIdOptions,
		playerIdOptions,
		getPlayersByUsernameOptions,
		usernameOptions,
		validatePlayerCaseCommunication,
		playerGenInfo,
		setPlayerIdOptions,
		setUsernameOptions,
		validateParameterIsEmpty,
	} = useCustomerCaseHooks();

	const {convertCommunicationContentToPostRequest} = useCaseCommHooks();
	const {getLanguage, languageOptions, getTopicNameByCode, topicLanguage, getSubtopicLanguageNameById, subtopicLanguage} = useSystemHooks();
	const {pageActions} = useCaseManagementConstant();
	const brandOptions = useBrands(createCSCaseUserAccessId);

	/**
	 *  ? Page mounted
	 */
	useEffect(() => {
		// variable
		let defaultUser = {value: userId, label: fullName};

		// set default value
		setServiceCaseOwner(defaultUser);
		setServiceCommunicationOwner(defaultUser);
		getAllMessageTypeOptions(ChannelType.Communication);
		setServiceCaseTexStatus('Open');
		getBrandOptions();
		getCaseTypeOptions();
		getMasterReference('');
		setConvertedContent('-');
	}, []);

	/**
	 *  ? Effects
	 */
	useEffect(() => {
		if (serviceSelectedMessageType !== undefined) {
			const {value} = serviceSelectedMessageType;
			getMessageStatusOptionById(value);
		}
	}, [serviceSelectedMessageType]);

	useEffect(() => {
		if (serviceSelectedMessageStatus !== undefined) {
			const {value} = serviceSelectedMessageStatus;
			getMessageResponseOptionById(value);
		}
	}, [serviceSelectedMessageStatus]);

	useEffect(() => {
		if (caseTypeOptionList.length > 0) {
			//default value on create
			setServiceCaseType(caseTypeOptionList.find((x) => x.value === CASE_TYPE.service));
		}
	}, [caseTypeOptionList]);

	useEffect(() => {
		setServiceLanguage([]);
		setServiceTopic([]);
		setServiceSubtopic([]);
	}, [serviceCurrencyCode]);

	useEffect(() => {
		setServiceSelectedPurpose(
			masterReferenceOptions
				.filter((x: MasterReferenceOptionModel) => x.masterReferenceParentId === masterReferenceIds.parentId.Purpose)
				.map((x: MasterReferenceOptionModel) => x.options)
				.find((x) => parseInt(x.value) === masterReferenceIds.childId.AddCommunication)
		);
	}, [masterReferenceOptions]);

	useEffect(() => {
		if (serviceStartCommunicationDate !== undefined && serviceEndCommunicationDate !== undefined) {
			let createMinsDiff = differenceInMinutes(new Date(endCommunicationDatePost), new Date(startCommunicationDatePost));
			setDuration(createMinsDiff.toString());
		}
	}, [serviceStartCommunicationDate, serviceEndCommunicationDate]);

	useEffect(() => {
		if (playerGenInfo !== undefined) {
			const {currencyCode, vipLevelName, paymentGroupName, playerId, mlabPlayerId, username} = playerGenInfo;
			setServiceCurrency(currencyCode);
			setServiceCurrencyCode(currencyCode);
			setServiceVipLevel(vipLevelName);
			setServicePaymentGroup(paymentGroupName);
			setServicePlayerId({label: playerId, value: mlabPlayerId});
			setServicePlayerUsername({label: username, value: mlabPlayerId});
			setPlayerPostId(mlabPlayerId);
		}
	}, [playerGenInfo]);

	const PaddedDiv = <div style={{margin: 20}} />;
	/**
	 *  ? Events
	 */

	const onChangeUsername = useCallback(
		(event: any) => {
			setServicePlayerUsername(event);
			const {value} = event;
			validatePlayerCaseCommunication(value);
		},
		[servicePlayerId]
	);

	const onChangePlayerId = useCallback(
		(event: any) => {
			setServicePlayerId(event);
			const {value} = event;
			validatePlayerCaseCommunication(value);
		},
		[servicePlayerUsername]
	);

	const searchUserName = (input: string) => {
		if (input.length > 2 && serviceBrand !== '') {
			getPlayersByUsernameOptions(input, serviceBrand.value, createCSCaseUserAccessId);
		}
	};

	const searchPlayerId = (input: string) => {
		if (input.length > 2 && serviceBrand != '') {
			getPlayersByPlayerIdOptions(input, serviceBrand.value, createCSCaseUserAccessId);
		}
	};

	/**
	 *
	 *  ? Methods
	 */

	const submitCreateCaseRequest = async (_caseStatus: number) => {
		let serviceCaseCommContent = await convertCommunicationContentToPostRequest(convertedContent);

		const request: UpSertCustomerServiceCaseCommunicationRequestModel = {
			queueId: Guid.create().toString(),
			mlabPlayerId: playerPostId,
			userId: userId?.toString() ?? '0',
			caseInformationId: 0,
			caseCreatorId: parseInt(serviceCaseOwner.value),
			caseTypeId: parseInt(serviceCaseType.value),
			caseStatusId: _caseStatus,
			subtopicLanguageId: parseInt(serviceSubtopic.value),
			topicLanguageId: parseInt(serviceTopic.value),
			subject: serviceSubject,
			brandId: parseInt(serviceBrand.value),
			languageId: parseInt(serviceLanguage.value),
			campaignIds: campaignNames.map((i) => ({campaignId: parseInt(i.value ?? '')})),
			caseCommunication: {
				caseCommunicationId: 0,
				caseInformationId: 0,
				purposeId: parseInt(serviceSelectedPurpose.value),
				messageTypeId: parseInt(serviceSelectedMessageType.value),
				messageStatusId: parseInt(serviceSelectedMessageStatus.value),
				messageReponseId: parseInt(serviceSelectedMessageResponse.value) || 0,
				startCommunicationDate: startCommunicationDatePost,
				endCommunicationDate: endCommunicationDatePost,
				duration: parseInt(duration),
				communicationContent: serviceCaseCommContent,
				communicationOwner: serviceCommunicationOwner.value,
				surveyTemplateId: surveyTemplateId,
				communicationSurveyQuestion: communicationSurvey,
				communicationFeedBackType: communicationFeedback,
				createdBy: userId !== undefined ? parseInt(userId) : 0,
				updatedBy: 0,
			},
			createdBy: userId !== undefined ? parseInt(userId) : 0,
			updatedBy: 0,
		};

		return request;
	};

	const submitCreateCase = async (_caseStatus: number) => {
		const request = await submitCreateCaseRequest(_caseStatus);
		if (!isJsonSizeValid(request)) {
			swal(SwalDetails.ErrorTitle, 'Communication content should not exceed 3MB.', SwalDetails.ErrorIcon);
			return;
		}

		swal({
			title: SwalConfirmMessage.title,
			text: 'This action will save the record and update case status accordingly. Please confirm.',
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willSave) => {
			if (willSave) {
				setSubmitting(true);
				UpSertCustomerServiceCaseCommunication(request)
					.then((response) => {
						if (response.status === successResponse) {
							messageOnSuccess(response.data);
						}
					})
					.catch(() => {
						swal(SwalGatewayErrorMessage.title, SwalGatewayErrorMessage.textError, SwalGatewayErrorMessage.icon);
						setSubmitting(false);
					});
			}
		});
	};

	const messageOnSuccess = (_createCaseResponseData: any) => {
		if (_createCaseResponseData.caseStatus === 'Closed') {
			swal(SwalTransactionSuccessMessage.title, 'Case is saved with Closed Status', SwalTransactionSuccessMessage.icon).then((onSuccess) => {
				if (onSuccess) {
					history.push(`/case-management/service-case/${_createCaseResponseData.caseId}`);
					setSubmitting(false);
				}
			});
		}

		if (_createCaseResponseData.caseStatus === 'Open') {
			swal(
				SwalTransactionSuccessMessage.title,
				`Case is saved with Open Status \n Missing Main Attributes: \n ${_createCaseResponseData.caseMissingFields} \n \n Please contact the admin if this is incorrect.`,
				SwalTransactionSuccessMessage.icon
			).then((onSuccess) => {
				if (onSuccess) {
					history.push(`/case-management/service-case/${_createCaseResponseData.caseId}`);
					setSubmitting(false);
				}
			});
		}
	};

	const cancelCreateCase = () => {
		swal({
			title: SwalConfirmMessage.title,
			text: SwalConfirmMessage.textDiscard,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willSave) => {
			if (willSave) {
				history.block(() => {});
				history.push('/case-management/search-case-communication');
			}
		});
	};

	const validateFields = async (_caseStatus: number) => {
		// Validate General Information
		debugger;

		let validateCasePlayerParamters = [serviceBrand, serviceCaseType, serviceCaseOwner, servicePlayerUsername, servicePlayerId];
		let playerHasError = await validateParameterIsEmpty(validateCasePlayerParamters);

		if (playerHasError) {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
		}

		// Validate Case Information
		let validateCaseParameter = await validateParameterIsEmpty([serviceSubject, serviceTopic, serviceSubtopic]);
		if (validateCaseParameter || serviceTopic.length === 0 || serviceSubtopic.length === 0) {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
		}

		let _validateServiceCaseCommDetail = await validateParameterIsEmpty([
			serviceSelectedMessageType,
			serviceSelectedMessageStatus,
			startCommunicationDatePost,
			endCommunicationDatePost,
			convertedContent,
		]);

		// Validate Communication Detail
		if (_validateServiceCaseCommDetail || (serviceSelectedMessageType.value === messageTypes.Call && serviceSelectedMessageResponse === '')) {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
		}

		let isCreateDateAfter = isAfter(new Date(endCommunicationDatePost), new Date(startCommunicationDatePost));
		if (!isCreateDateAfter) {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textCommunicationDateValidation, SwalFailedMessage.icon);
		}

		//Validate Communication Survey required fields. Trigger Sonarcloud
		const invalidSurveyAnswers = communicationSurvey.filter((i) => i.isRequired && i.surveyAnswer.trim() == '' && i.surveyQuestionAnswersId == 0);
		if (invalidSurveyAnswers.length > 0) {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textSurveyTemplateMandatory, SwalFailedMessage.icon);
		}

		//Validate Campaign Names count
		if (campaignNames && campaignNames.length > 10) {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textCampaignNameCountExceeded, SwalFailedMessage.icon);
		}

		submitCreateCase(_caseStatus);
	};

	return (
		<div>
			<CustomerCaseGenInfo
				pageAction={pageActions.createCase}
				brand={serviceBrand}
				setBrand={setServiceBrand}
				brandOptions={brandOptions}
				currency={serviceCurrency}
				caseTexStatus={serviceCaseTexStatus}
				setCaseType={setServiceCaseType}
				caseType={serviceCaseType}
				caseOwner={serviceCaseOwner}
				setCaseOwner={setServiceCaseOwner}
				vipLevel={serviceVipLevel}
				playerId={servicePlayerId}
				setPlayerId={setServicePlayerId}
				username={servicePlayerUsername}
				setUsername={setServicePlayerUsername}
				userList={userList}
				onChangeUsername={onChangeUsername}
				onChangePlayerId={onChangePlayerId}
				searchPlayerId={searchPlayerId}
				searchUserName={searchUserName}
				paymentGroup={servicePaymentGroup}
				playerIdOptions={playerIdOptions}
				setPlayerIdOptions={setPlayerIdOptions}
				usernameOptions={usernameOptions}
				setUsernameOptions={setUsernameOptions}
				campaignNames={campaignNames}
				setCampaignNames={setCampaignNames}
			/>

			{PaddedDiv}

			<CustomerCaseInformation
				pageAction={pageActions.createCase}
				language={serviceLanguage}
				setLanguage={setServiceLanguage}
				subject={serviceSubject}
				setSubject={setServiceSubject}
				topic={serviceTopic}
				setTopic={setServiceTopic}
				subtopic={serviceSubtopic}
				setSubtopic={setServiceSubtopic}
				currencyCode={serviceCurrencyCode}
				getLanguage={getLanguage}
				getSubtopicLanguageNameById={getSubtopicLanguageNameById}
				getTopicNameByCode={getTopicNameByCode}
				languageOptions={languageOptions}
				subtopicLanguage={subtopicLanguage}
				topicLanguage={topicLanguage}
			/>

			{PaddedDiv}

			<CustomerCommunication
				selectedPurpose={serviceSelectedPurpose}
				communicationOwner={serviceCommunicationOwner}
				setCommunicationOwner={setServiceCommunicationOwner}
				setSelectedPurpose={setServiceSelectedPurpose}
				selectedMessageType={serviceSelectedMessageType}
				setSelectedMessageType={setServiceSelectedMessageType}
				selectedMessageStatus={serviceSelectedMessageStatus}
				setSelectedMessageStatus={setServiceSelectedMessageStatus}
				selectedMessageResponse={serviceSelectedMessageResponse}
				setSelectedMessageResponse={setServiceSelectedMessageResponse}
				messageTypeOptions={messageTypeOptions}
				messageStatusOptions={messageStatusOptionList}
				messageResponseOptions={messageResponseOptionList}
				endCommunicationDate={serviceEndCommunicationDate}
				openEndCommunication={openEndCommunication}
				openStartCommunication={serviceOpenStartCommunication}
				setEndCommunicationDate={setServiceEndCommunicationDate}
				setEndCommunicationDatePost={setEndCommunicationDatePost}
				setOpenEndCommunication={setOpenEndCommunication}
				setOpenStartCommunication={setServiceOpenStartCommunication}
				setStartCommunicationDate={setServiceStartCommunicationDate}
				setStartCommunicationDatePost={setStartCommunicationDatePost}
				startCommunicationDate={serviceStartCommunicationDate}
				setConvertedContent={setConvertedContent}
				convertedContent={convertedContent}
				userList={userList}
				masterReferenceOptions={masterReferenceOptions}
				duration={duration}
				setDuration={setDuration}
				isChatIntegrationCommunication={false}
			/>

			{PaddedDiv}

			<CustomerCommunicationFeedback setCommunicationFeedback={setCommunicationFeedback} />

			{PaddedDiv}

			<CustomerCommunicationSurvey
				surveyTemplateId={surveyTemplateId}
				setSurveyTemplateId={setSurveyTemplateId}
				communicationSurvey={communicationSurvey}
				setCommunicationSurvey={setCommunicationSurvey}
			/>

			{PaddedDiv}

			<MainContainer>
				<div style={{margin: 20}}>
					<MlabButton
						access={access?.includes(USER_CLAIMS.CreateCustomerCaseWrite) ?? access?.includes(USER_CLAIMS.CreateCaseonBehalfWrite)}
						size={'sm'}
						label={'Save'}
						style={ElementStyle.primary}
						type={'button'}
						weight={'solid'}
						onClick={() => validateFields(caseStatus.Open)}
						loading={submitting}
						loadingTitle={'Please wait ...'}
						disabled={submitting}
					/>
					<MlabButton
						loading={submitting}
						loadingTitle={'Please wait ...'}
						access={access?.includes(USER_CLAIMS.CreateCustomerCaseWrite) ?? access?.includes(USER_CLAIMS.CreateCaseonBehalfWrite)}
						size={'sm'}
						label={'Cancel'}
						style={ElementStyle.secondary}
						type={'button'}
						weight={'solid'}
						onClick={cancelCreateCase}
						disabled={submitting}
					/>
				</div>
			</MainContainer>
		</div>
	);
};

export default CreateCustomerServiceCase;
