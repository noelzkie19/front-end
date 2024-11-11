import {differenceInMinutes, isAfter} from 'date-fns';
import {Guid} from 'guid-typescript';
import React, {useCallback, useEffect, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../setup';
import {LookupModel, MasterReferenceOptionModel} from '../../../common/model';
import {ChannelType, ElementStyle} from '../../../constants/Constants';
import useConstant from '../../../constants/useConstant';
import {MainContainer, MlabButton} from '../../../custom-components';
import {useUserOptionList} from '../../../custom-functions';
import useSystemHooks from '../../../custom-functions/system/useSystemHooks';
import {IAuthState} from '../../auth';
import {useCaseCommHooks, useCaseCommOptions} from '../../case-communication/components/shared/hooks';
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

const CustomerServiceAddCommunication: React.FC = () => {
	/**
	 *  ? States
	 */
	const {access, userId, fullName} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const addCSCommUserAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	// General Informations
	const [serviceUsername, setServiceUsername] = useState<any>('');
	const [serviceAddCommCurrency, setServiceAddCommCurrency] = useState<string>('');
	const [serviceAddCaseTexStatus, setServiceAddCaseTexStatus] = useState<string>('');
	const [serviceAddCaseType, setServiceAddCaseType] = useState<any>('');
	const [serviceAddCaseOwner, setServiceAddCaseOwner] = useState<any>('');
	const [serviceAddCurrencyCode, setServiceAddCurrencyCode] = useState<string>('');
	const [serviceAddPlayerId, setServiceAddPlayerId] = useState<any>('');
	const [serviceAddBrand, setServiceAddBrand] = useState<any>('');
	const [serviceAddVipLevel, setServiceAddVipLevel] = useState<string>('');
	const [serviceAddPaymentGroup, setServiceAddPaymentGroup] = useState<string>('');
	const [addCommCampaignNames, setAddCommCampaignNames] = useState<Array<LookupModel>>([]);

	// Communications
	const [communicationOwner, setCommunicationOwner] = useState<any>('');
	const [convertedContent, setConvertedContent] = useState<any>();
	const [duration, setDuration] = useState<string>('');
	const [endCommunicationDate, setEndCommunicationDate] = useState<any>();
	const [endCommunicationDatePost, setEndCommunicationDatePost] = useState<any>('');
	const [openEndCommunication, setOpenEndCommunication] = useState<boolean>(false);
	const [openStartCommunication, setOpenStartCommunication] = useState<boolean>(false);
	const [playerPostId, setPlayerPostId] = useState<number>(0);
	const [selectedMessageResponse, setSelectedMessageResponse] = useState<any>('');
	const [selectedMessageType, setSelectedMessageType] = useState<any>('');
	const [selectedMessageStatus, setSelectedMessageStatus] = useState<any>('');
	const [selectedPurpose, setSelectedPurpose] = useState<any>('');
	const [startCommunicationDate, setStartCommunicationDate] = useState<any>();
	const [startCommunicationDatePost, setStartCommunicationDatePost] = useState<string>('');
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [surveyTemplateId, setSurveyTemplateId] = useState<number | null>(null);

	// Case Informations
	const [serviceAddLanguage, setServiceAddLanguage] = useState<any>('');
	const [serviceAddSubtopic, setServiceAddSubtopic] = useState<any>('');
	const [serviceAddSubject, setServiceAddSubject] = useState<string>('');
	const [serviceAddTopic, setServiceAddTopic] = useState<any>('');

	// Communication Feedback
	const [communicationFeedback, setCommunicationFeedback] = useState<Array<CustomerCommunicationFeedBackTypeRequestModel>>([]);

	// Communication Survey
	const [communicationSurvey, setCommunicationSurvey] = useState<Array<CustomerCommunicationSurveyQuestionRequestModel>>([]);

	/**
	 *  ? Hooks
	 */
	const {caseId}: {caseId: number} = useParams();
	const history = useHistory();
	const {
		caseStatus,
		successResponse,
		SwalFailedMessage,
		SwalConfirmMessage,
		message,
		messageTypes,
		SwalTransactionSuccessMessage,
		SwalTransactionErrorMessage,
		SwalGatewayErrorMessage,
	} = useConstant();
	const {convertCommunicationContentToPostRequest} = useCaseCommHooks();
	const {userList} = useUserOptionList();
	const {pageActions} = useCaseManagementConstant();
	const {getMessageStatusOptionById, messageStatusOptionList, getMessageResponseOptionById, messageResponseOptionList} = useCaseCommOptions();
	const {getBrandOptions, brandOptionList, getCaseTypeOptions, caseTypeOptionList} = useSystemOptionHooks();
	const {getMasterReference, masterReferenceOptions} = useSystemHooks();
	const {
		getPlayersByPlayerIdOptions,
		playerIdOptions,
		getPlayersByUsernameOptions,
		usernameOptions,
		validatePlayerCaseCommunication,
		setPlayerIdOptions,
		setUsernameOptions,
	} = useCustomerCaseHooks();
	const {getLanguage, languageOptions, getTopicNameByCode, topicLanguage, getSubtopicLanguageNameById, subtopicLanguage} = useSystemHooks();

	const {getCustomerServiceCaseInformationById, caseInformations, getAllMessageTypeOptions, messageTypeOptions} = useCustomerCaseCommHooks();

	/**
	 *  ? Page mounted
	 */
	useEffect(() => {
		// variable
		let defaultUser = {value: userId, label: fullName};
		// set default value
		setCommunicationOwner(defaultUser);
		getAllMessageTypeOptions(ChannelType.Communication);
		setServiceAddCaseTexStatus('Open');
		getBrandOptions();
		getCaseTypeOptions();
		getMasterReference('');
		getCustomerServiceCaseInformationById(caseId, addCSCommUserAccessId);
		setConvertedContent('-');
	}, []);

	/**
	 *  ? Effects
	 */
	useEffect(() => {
		if (selectedMessageStatus !== undefined) {
			const {value} = selectedMessageStatus;
			getMessageResponseOptionById(value);
		}
	}, [selectedMessageStatus]);

	useEffect(() => {
		if (selectedMessageType !== undefined) {
			const {value} = selectedMessageType;
			getMessageStatusOptionById(value);
		}
	}, [selectedMessageType]);

	useEffect(() => {
		if (caseTypeOptionList.length > 0) {
			//default value on create
			setServiceAddCaseType(caseTypeOptionList.find((x) => x.value === CASE_TYPE.service));
		}
	}, [caseTypeOptionList]);

	useEffect(() => {
		if (startCommunicationDate !== undefined && endCommunicationDate !== undefined) {
			let addCommMinsDiff = differenceInMinutes(new Date(endCommunicationDatePost), new Date(startCommunicationDatePost));
			setDuration(addCommMinsDiff.toString());
		}
	}, [startCommunicationDate, endCommunicationDate]);

	useEffect(() => {
		setSelectedPurpose(
			masterReferenceOptions
				.filter((x: MasterReferenceOptionModel) => x.masterReferenceParentId === 4)
				.map((x: MasterReferenceOptionModel) => x.options)
				.find((x) => x.label.toLowerCase() === 'add communication')
		);
	}, [masterReferenceOptions]);

	useEffect(() => {
		if (caseInformations !== undefined) {
			const {
				brandId,
				brandName,
				currencyCode,
				caseCreatorId,
				caseCreatorName,
				caseStatusName,
				caseTypeId,
				caseTypeName,
				languageCode,
				languageId,
				subject,
				subtopicLanguageId,
				subtopicLanguageTranslation,
				paymentGroupName,
				playerId,
				topicLanguageId,
				topicLanguageTranslation,
				username,
				vipLevelName,
				campaignList,
				mlabPlayerId,
			} = caseInformations;
			setServiceAddLanguage({label: languageCode, value: languageId});
			setServiceAddPlayerId({label: playerId, value: username});
			setServiceUsername({label: username, value: playerId});
			setServiceAddCaseTexStatus(caseStatusName);
			getTopicNameByCode(languageCode, currencyCode);
			setServiceAddBrand({label: brandName, value: brandId});
			setServiceAddCaseOwner({label: caseCreatorName, value: caseCreatorId});
			setServiceAddCaseType({label: caseTypeName, value: caseTypeId});
			setServiceAddTopic({label: topicLanguageTranslation, value: topicLanguageId});
			setServiceAddSubtopic({label: subtopicLanguageTranslation, value: subtopicLanguageId});
			setServiceAddSubject(subject);
			setServiceAddCommCurrency(currencyCode);
			setServiceAddCurrencyCode(currencyCode);
			setServiceAddVipLevel(vipLevelName);
			setServiceAddPaymentGroup(paymentGroupName);
			setPlayerPostId(mlabPlayerId);
			setAddCommCampaignNames(
				campaignList.map((i) => {
					return {value: i.campaignId.toString(), label: i.campaignName ?? ''};
				})
			);
		}
	}, [caseInformations]);

	const PaddedDiv = <div style={{margin: 20}} />;

	/**
	 *  ? Events
	 */

	const onChangePlayerId = useCallback(
		(event: any) => {
			const {value, label} = event;
			setServiceAddPlayerId(event);
			setServiceUsername({label: value, value: label});
			validatePlayerCaseCommunication(label);
			setPlayerPostId(label);
		},
		[serviceUsername]
	);

	const searchPlayerId = (input: string) => {
		if (input.length > 2 && serviceAddBrand != '') {
			getPlayersByPlayerIdOptions(input, serviceAddBrand.value, addCSCommUserAccessId);
		}
	};

	const searchUserName = (input: string) => {
		if (input.length > 2 && serviceAddBrand != '') {
			getPlayersByUsernameOptions(input, serviceAddBrand.value, addCSCommUserAccessId);
		}
	};

	const onChangeUsername = useCallback(
		(event: any) => {
			const {value} = event;
			setServiceUsername(event);
			setServiceAddPlayerId({label: value, value: value});
			validatePlayerCaseCommunication(value);
			setPlayerPostId(value);
		},
		[serviceUsername]
	);

	/**
	 *
	 *  ? Methods
	 */

	const submitAddCommunication = async (_caseStatus: number) => {
		setSubmitting(true);
		let serviceAddCaseCommContent = await convertCommunicationContentToPostRequest(convertedContent);
		const request: UpSertCustomerServiceCaseCommunicationRequestModel = {
			queueId: Guid.create().toString(),
			mlabPlayerId: playerPostId,
			userId: userId?.toString() ?? '0',
			caseInformationId: parseInt(caseId.toString()),
			caseCreatorId: parseInt(serviceAddCaseOwner.value),
			caseTypeId: parseInt(serviceAddCaseType.value),
			caseStatusId: _caseStatus,
			subtopicLanguageId: parseInt(serviceAddSubtopic.value),
			topicLanguageId: parseInt(serviceAddTopic.value),
			subject: serviceAddSubject,
			brandId: parseInt(serviceAddBrand.value),
			languageId: parseInt(serviceAddLanguage.value),
			caseCommunication: {
				caseCommunicationId: 0,
				caseInformationId: caseId,
				purposeId: parseInt(selectedPurpose.value),
				messageTypeId: parseInt(selectedMessageType.value),
				messageStatusId: parseInt(selectedMessageStatus.value),
				messageReponseId: parseInt(selectedMessageResponse.value) || 0,
				startCommunicationDate: startCommunicationDatePost,
				endCommunicationDate: endCommunicationDatePost,
				duration: parseInt(duration),
				communicationContent: serviceAddCaseCommContent,
				surveyTemplateId: surveyTemplateId,
				communicationSurveyQuestion: communicationSurvey,
				communicationFeedBackType: communicationFeedback,
				createdBy: userId !== undefined ? parseInt(userId) : 0,
				communicationOwner: parseInt(communicationOwner.value),
				updatedBy: 0,
			},
			campaignIds: addCommCampaignNames.map((i) => ({campaignId: parseInt(i.value ?? '')})),
			createdBy: userId !== undefined ? parseInt(userId) : 0,
			updatedBy: 0,
		};
		upsertCustomerServiceAddCommunication(request);
	};

	const messageOnSuccessAddCommunication = (_addCommResponseData: any) => {
		if (_addCommResponseData.caseStatus === 'Closed') {
			swal(SwalTransactionSuccessMessage.title, 'Case is saved with Closed Status', SwalTransactionSuccessMessage.icon).then((onSuccess) => {
				if (onSuccess) {
					history.push(`/case-management/service-case/${_addCommResponseData.caseId}`);
					setSubmitting(false);
				}
			});
		}

		if (_addCommResponseData.caseStatus === 'Open') {
			swal(
				SwalTransactionSuccessMessage.title,
				`Case is saved with Open Status \n Missing Main Attributes: \n ${_addCommResponseData.caseMissingFields} \n \n Please contact the admin if this is incorrect.`,
				SwalTransactionSuccessMessage.icon
			).then((onSuccess) => {
				if (onSuccess) {
					history.push(`/case-management/service-case/${_addCommResponseData.caseId}`);
					setSubmitting(false);
				}
			});
		}
	};

	const upsertCustomerServiceAddCommunication = (_request: UpSertCustomerServiceCaseCommunicationRequestModel) => {
		UpSertCustomerServiceCaseCommunication(_request)
			.then((response) => {
				if (response.status === successResponse) {
					messageOnSuccessAddCommunication(response.data);
				} else {
					setSubmitting(false);
					swal(SwalTransactionErrorMessage.title, SwalTransactionErrorMessage.textError, SwalTransactionErrorMessage.icon);
				}
			})
			.catch(() => {
				setSubmitting(false);
				swal(SwalGatewayErrorMessage.title, SwalGatewayErrorMessage.textError, SwalGatewayErrorMessage.icon);
			});
	};

	const validateFields = (_caseStatus: number) => {
		// Validate Communication Detail
		if (
			selectedMessageType === '' ||
			selectedMessageStatus === '' ||
			(selectedMessageType.value === messageTypes.Call && selectedMessageResponse === '') ||
			startCommunicationDatePost === '' ||
			endCommunicationDatePost === '' ||
			convertedContent === ''
		) {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
		}

		let isAddCommDateAfter = isAfter(new Date(endCommunicationDatePost), new Date(startCommunicationDatePost));
		if (!isAddCommDateAfter) {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textCommunicationDateValidation, SwalFailedMessage.icon);
		}

		//Validate Communication Survey required fields
		const invalidSurveyAnswers = communicationSurvey.filter((i) => i.isRequired && i.surveyAnswer.trim() == '' && i.surveyQuestionAnswersId == 0);
		if (invalidSurveyAnswers.length > 0) {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textSurveyTemplateMandatory, SwalFailedMessage.icon);
		}

		swal({
			title: SwalConfirmMessage.title,
			text: _caseStatus === caseStatus.Open ? message.genericSaveConfirmation : message.caseSaveAndClose,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willSave) => {
			if (willSave) {
				submitAddCommunication(_caseStatus);
			}
		});
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

	return (
		<div>
			<CustomerCaseGenInfo
				pageAction={pageActions.addCommunication}
				brand={serviceAddBrand}
				setBrand={setServiceAddBrand}
				brandOptions={brandOptionList}
				currency={serviceAddCommCurrency}
				caseTexStatus={serviceAddCaseTexStatus}
				caseType={serviceAddCaseType}
				setCaseType={setServiceAddCaseType}
				setCaseOwner={setServiceAddCaseOwner}
				caseOwner={serviceAddCaseOwner}
				vipLevel={serviceAddVipLevel}
				playerId={serviceAddPlayerId}
				setPlayerId={setServiceAddPlayerId}
				username={serviceUsername}
				setUsername={setServiceUsername}
				userList={userList}
				onChangeUsername={onChangeUsername}
				onChangePlayerId={onChangePlayerId}
				searchPlayerId={searchPlayerId}
				searchUserName={searchUserName}
				paymentGroup={serviceAddPaymentGroup}
				playerIdOptions={playerIdOptions}
				setPlayerIdOptions={setPlayerIdOptions}
				usernameOptions={usernameOptions}
				setUsernameOptions={setUsernameOptions}
				campaignNames={addCommCampaignNames}
				setCampaignNames={setAddCommCampaignNames}
			/>

			{PaddedDiv}

			<CustomerCaseInformation
				pageAction={pageActions.addCommunication}
				setLanguage={setServiceAddLanguage}
				language={serviceAddLanguage}
				subject={serviceAddSubject}
				setSubject={setServiceAddSubject}
				setTopic={setServiceAddTopic}
				topic={serviceAddTopic}
				setSubtopic={setServiceAddSubtopic}
				subtopic={serviceAddSubtopic}
				currencyCode={serviceAddCurrencyCode}
				getLanguage={getLanguage}
				getSubtopicLanguageNameById={getSubtopicLanguageNameById}
				getTopicNameByCode={getTopicNameByCode}
				languageOptions={languageOptions}
				topicLanguage={topicLanguage}
				subtopicLanguage={subtopicLanguage}
			/>

			{PaddedDiv}

			<CustomerCommunication
				communicationOwner={communicationOwner}
				selectedPurpose={selectedPurpose}
				setCommunicationOwner={setCommunicationOwner}
				selectedMessageType={selectedMessageType}
				setSelectedPurpose={setSelectedPurpose}
				setSelectedMessageType={setSelectedMessageType}
				selectedMessageStatus={selectedMessageStatus}
				selectedMessageResponse={selectedMessageResponse}
				setSelectedMessageStatus={setSelectedMessageStatus}
				setSelectedMessageResponse={setSelectedMessageResponse}
				messageTypeOptions={messageTypeOptions}
				messageStatusOptions={messageStatusOptionList}
				messageResponseOptions={messageResponseOptionList}
				endCommunicationDate={endCommunicationDate}
				openEndCommunication={openEndCommunication}
				openStartCommunication={openStartCommunication}
				setEndCommunicationDate={setEndCommunicationDate}
				setEndCommunicationDatePost={setEndCommunicationDatePost}
				setOpenStartCommunication={setOpenStartCommunication}
				setOpenEndCommunication={setOpenEndCommunication}
				setStartCommunicationDate={setStartCommunicationDate}
				setStartCommunicationDatePost={setStartCommunicationDatePost}
				startCommunicationDate={startCommunicationDate}
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

			<MainContainer>
				<div style={{margin: 20}}>
					<MlabButton
						access={access?.includes(USER_CLAIMS.CreateCustomerCaseWrite)}
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
						access={access?.includes(USER_CLAIMS.CreateCustomerCaseWrite)}
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

export default CustomerServiceAddCommunication;
