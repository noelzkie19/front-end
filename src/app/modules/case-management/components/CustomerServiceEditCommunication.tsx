import {differenceInMinutes, isAfter} from 'date-fns';
import {Guid} from 'guid-typescript';
import {htmlDecode} from 'js-htmlencode';
import moment from 'moment';
import React, {useCallback, useEffect, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import swal from 'sweetalert';
import {CustomerServiceEditCommunicationFeedback, CustomerServiceEditCommunicationSurvey} from '.';
import {RootState} from '../../../../setup';
import {LookupModel, MasterReferenceOptionModel} from '../../../common/model';
import {ChannelType, ElementStyle} from '../../../constants/Constants';
import useConstant from '../../../constants/useConstant';
import {MainContainer, MlabButton} from '../../../custom-components';
import {useUserOptionList} from '../../../custom-functions';
import useFnsDateFormatter from '../../../custom-functions/helper/useFnsDateFormatter';
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
import {ValidateCaseCommunicationAnnotationRequestModel} from '../models/request/ValidateCaseCommunicationAnnotationRequestModel';
import {UpSertCustomerServiceCaseCommunication, validateCaseCommunicationAnnotation} from '../services/CustomerCaseApi';
import {CustomerCaseGenInfo, CustomerCaseInformation, CustomerCommunication} from '../shared/components';
import useCustomerCaseHooks from '../shared/hooks/UseCustomerCaseHooks';
import useCustomerCaseCommHooks from '../shared/hooks/useCustomerCaseCommHooks';
import useCaseManagementConstant from '../useCaseManagementConstant';

const CustomerServiceEditCommunication: React.FC = () => {
	/**
	 *  ? States
	 */
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const editCSCommUserAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	// General Informations
	const [username, setUsername] = useState<any>('');
	const [playerId, setPlayerId] = useState<any>('');
	const [brand, setBrand] = useState<any>('');
	const [currency, setCurrency] = useState<string>('');
	const [caseTexStatus, setCaseTexStatus] = useState<string>('');
	const [caseType, setCaseType] = useState<any>('');
	const [caseOwner, setCaseOwner] = useState<any>('');
	const [vipLevel, setVipLevel] = useState<string>('');
	const [paymentGroup, setPaymentGroup] = useState<string>('');
	const [currencyCode, setCurrencyCode] = useState<string>('');
	const [editCommCampaignNames, setEditCommCampaignNames] = useState<Array<LookupModel>>([]);

	// Case Informations
	const [subject, setSubject] = useState<string>('');
	const [topic, setTopic] = useState<any>('');
	const [subtopic, setSubtopic] = useState<any>('');
	const [language, setLanguage] = useState<any>('');

	// Communications
	const [externalId, setExternalId] = useState<string>('');

	const [selectedPurpose, setSelectedPurpose] = useState<any>('');
	const [communicationOwner, setCommunicationOwner] = useState<any>('');
	const [selectedMessageType, setSelectedMessageType] = useState<any>('');
	const [selectedMessageStatus, setSelectedMessageStatus] = useState<any>('');
	const [selectedMessageResponse, setSelectedMessageResponse] = useState<any>('');
	const [startCommunicationDate, setStartCommunicationDate] = useState<any>();
	const [endCommunicationDate, setEndCommunicationDate] = useState<any>();
	const [openStartCommunication, setOpenStartCommunication] = useState<boolean>(false);
	const [openEndCommunication, setOpenEndCommunication] = useState<boolean>(false);
	const [startCommunicationDatePost, setStartCommunicationDatePost] = useState<string>('');
	const [endCommunicationDatePost, setEndCommunicationDatePost] = useState<any>('');
	const [convertedContent, setConvertedContent] = useState<any>();
	const [duration, setDuration] = useState<string>('');
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [playerPostId, setPlayerPostId] = useState<number>(0);
	const [caseId, setCaseId] = useState<number>(0);
	const [surveyTemplateId, setSurveyTemplateId] = useState<number | null>(null);
	const [isChatIntegrationCommunication, setIsChatIntegrationCommunication] = useState<boolean>(false);

	const [reportedDate, setReportedDate] = useState<any>();

	// Survey and Feedback
	const [customerCaseCommunicationFeedback, setCustomerCaseCommunicationFeedback] = useState<Array<CustomerCommunicationFeedBackTypeRequestModel>>(
		[]
	);
	const [customerCaseCommunicationSurvey, setCustomerCaseCommunicationSurvey] = useState<Array<CustomerCommunicationSurveyQuestionRequestModel>>([]);

	// Comm Annotation
	const [commAnnotationUpdated, setCommAnnotationUpdated] = useState<string>('');
	/**
	 *  ? Hooks
	 */
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	const {communicationId}: {communicationId: number} = useParams();
	const {getMessageStatusOptionById, messageStatusOptionList, getMessageResponseOptionById, messageResponseOptionList} = useCaseCommOptions();
	const {getBrandOptions, brandOptionList, getCaseTypeOptions, caseTypeOptionList} = useSystemOptionHooks();
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
		properFormatDateHourMinSecDashed,
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
	} = useCustomerCaseHooks();
	const {getLanguage, languageOptions, getTopicNameByCode, topicLanguage, getSubtopicLanguageNameById, subtopicLanguage} = useSystemHooks();
	const {pageActions, postDateFormat} = useCaseManagementConstant();
	const {
		getCustomerServiceCaseInformationById,
		caseInformations,
		getAllMessageTypeOptions,
		messageTypeOptions,
		getCaseCommunicationInfo,
		caseCommunication,
		chatIntegrationMessageTypeOptions,
		getChatIntegrationMessageTypeOptions,
	} = useCustomerCaseCommHooks();

	const {mlabFormatDate} = useFnsDateFormatter();
	const {convertCommunicationContentToPostRequest} = useCaseCommHooks();

	/**
	 *  ? Page mounted
	 */
	useEffect(() => {
		// variable
		getAllMessageTypeOptions(ChannelType.Communication);
		getChatIntegrationMessageTypeOptions();
		setCaseTexStatus('Open');
		getBrandOptions();
		getCaseTypeOptions();
		getMasterReference('');
		getCaseCommunicationInfo(communicationId, userAccessId);
	}, []);

	/**
	 *  ? Effects
	 */
	useEffect(() => {
		if (selectedMessageType !== undefined) {
			const {value} = selectedMessageType;
			getMessageStatusOptionById(value);
		}
	}, [selectedMessageType]);

	useEffect(() => {
		if (selectedMessageStatus !== undefined) {
			const {value} = selectedMessageStatus;
			getMessageResponseOptionById(value);
		}
	}, [selectedMessageStatus]);

	useEffect(() => {
		if (caseTypeOptionList.length > 0) {
			//default value on create
			setCaseType(caseTypeOptionList.find((x) => x.value === CASE_TYPE.service));
		}
	}, [caseTypeOptionList]);

	useEffect(() => {
		setSelectedPurpose(
			masterReferenceOptions
				.filter((x: MasterReferenceOptionModel) => x.masterReferenceParentId === 4)
				.map((x: MasterReferenceOptionModel) => x.options)
				.find((x) => x.label.toLowerCase() === 'add communication')
		);
	}, [masterReferenceOptions]);

	useEffect(() => {
		if (startCommunicationDate !== undefined && endCommunicationDate !== undefined) {
			let editCommMinsDiff = differenceInMinutes(new Date(endCommunicationDatePost), new Date(startCommunicationDatePost));
			setDuration(editCommMinsDiff.toString());
		}
	}, [startCommunicationDate, endCommunicationDate]);

	useEffect(() => {
		if (caseInformations !== undefined) {
			const {
				languageId,
				languageCode,
				playerId,
				username,
				caseTypeName,
				caseStatusName,
				brandId,
				brandName,
				caseCreatorId,
				caseCreatorName,
				caseTypeId,
				topicLanguageId,
				topicLanguageTranslation,
				subtopicLanguageId,
				subtopicLanguageTranslation,
				subject,
				currencyCode,
				vipLevelName,
				paymentGroupName,
				campaignList,
				mlabPlayerId,
			} = caseInformations;
			setSubtopic({label: subtopicLanguageTranslation, value: subtopicLanguageId});
			setSubject(subject);
			setCurrency(currencyCode);
			setCurrencyCode(currencyCode);
			setCaseType({label: caseTypeName, value: caseTypeId});
			setCaseOwner({label: caseCreatorName, value: caseCreatorId});
			setTopic({label: topicLanguageTranslation, value: topicLanguageId});
			setVipLevel(vipLevelName);
			setPaymentGroup(paymentGroupName);
			setLanguage({label: languageCode, value: languageId});
			setPlayerId({label: playerId, value: mlabPlayerId});
			setUsername({label: username, value: mlabPlayerId});
			setCaseTexStatus(caseStatusName);
			getTopicNameByCode(languageCode, currencyCode);
			setBrand({label: brandName, value: brandId});
			setPlayerPostId(mlabPlayerId);
			setEditCommCampaignNames(
				campaignList.map((i) => {
					return {value: i.campaignId.toString(), label: i.campaignName ?? ''};
				})
			);
		}
	}, [caseInformations]);

	useEffect(() => {
		if (caseCommunication !== undefined) {
			const {
				caseInformationId,
				communicationOwner,
				communicationOwnerName,
				duration,
				messageTypeId,
				messageType,
				messageStatusId,
				messageStatus,
				messageResponse,
				messageResponseId,
				startCommunicationDate,
				endCommunicationDate,
				communicationContent,
				externalCommunicationId,
				surveyTemplateId,
				reportedDate,
			} = caseCommunication;
			getCustomerServiceCaseInformationById(caseInformationId, editCSCommUserAccessId);
			setCommunicationOwner({label: communicationOwnerName, value: communicationOwner});
			setDuration(duration);
			setSelectedMessageType({label: messageType, value: messageTypeId});
			setSelectedMessageStatus({label: messageStatus, value: messageStatusId});
			setSelectedMessageResponse({label: messageResponse, value: messageResponseId});
			let communicationStartDate = startCommunicationDate === null ? '' : moment(startCommunicationDate).toDate();
			let communicationEndDate = endCommunicationDate === null ? '' : moment(endCommunicationDate).toDate();
			let formatedStartCommunicationDatePost = startCommunicationDate === null ? '' : moment(startCommunicationDate).format(postDateFormat);
			let formatedEndCommunicationDatePost = endCommunicationDate === null ? '' : moment(endCommunicationDate).format(postDateFormat);
			setStartCommunicationDate(communicationStartDate);
			setStartCommunicationDatePost(formatedStartCommunicationDatePost);
			setEndCommunicationDate(communicationEndDate);
			setEndCommunicationDatePost(formatedEndCommunicationDatePost);
			setCommAnnotationUpdated(htmlDecode(communicationContent ?? ''));
			setConvertedContent(htmlDecode(communicationContent ?? ''));
			setCaseId(caseInformationId);
			setExternalId(externalCommunicationId !== null ? externalCommunicationId.toString() : '');
			setSurveyTemplateId(surveyTemplateId);
			let chatIntegrationType = chatIntegrationMessageTypeOptions.find((i) => i.value === messageTypeId.toString());
			setIsChatIntegrationCommunication(chatIntegrationType !== undefined);
			setReportedDate(mlabFormatDate(reportedDate, properFormatDateHourMinSecDashed));
		}
	}, [caseCommunication]);

	useEffect(() => {
		if (playerGenInfo !== undefined) {
			const {currencyCode, vipLevelName, paymentGroupName, playerId, mlabPlayerId, username} = playerGenInfo;
			setCurrency(currencyCode);
			setCurrencyCode(currencyCode);
			setVipLevel(vipLevelName);
			setPaymentGroup(paymentGroupName);
			setPlayerId({label: playerId, value: mlabPlayerId});
			setUsername({label: username, value: mlabPlayerId});
			setPlayerPostId(mlabPlayerId);
		}
	}, [playerGenInfo]);

	const PaddedDiv = <div style={{margin: 20}} />;

	/**
	 *  ? Events
	 */
	const onChangePlayerId = useCallback(
		(event: any) => {
			const {label} = event;
			validatePlayerCaseCommunication(label);
		},
		[username]
	);

	const onChangeUsername = useCallback(
		(event: any) => {
			const {value} = event;
			validatePlayerCaseCommunication(value);
		},
		[username]
	);

	const searchUserName = (input: string) => {
		if (input.length > 2 && brand != '') {
			getPlayersByUsernameOptions(input, brand.value, editCSCommUserAccessId);
		}
	};

	const searchPlayerId = (input: string) => {
		if (input.length > 2 && brand != '') {
			getPlayersByPlayerIdOptions(input, brand.value, editCSCommUserAccessId);
		}
	};

	/**
	 *
	 *  ? Methods
	 */

	const submitEditCommunication = async (_caseStatus: number) => {
		setSubmitting(true);

		let serviceEditCaseCommContent = await convertCommunicationContentToPostRequest(convertedContent);

		const request: UpSertCustomerServiceCaseCommunicationRequestModel = {
			queueId: Guid.create().toString(),
			mlabPlayerId: playerPostId,
			userId: userId?.toString() ?? '0',
			caseInformationId: caseId,
			caseCreatorId: parseInt(caseOwner.value),
			caseTypeId: parseInt(caseType.value),
			caseStatusId: _caseStatus,
			subtopicLanguageId: parseInt(subtopic.value),
			topicLanguageId: parseInt(topic.value),
			subject: subject,
			brandId: parseInt(brand.value),
			languageId: parseInt(language.value),
			caseCommunication: {
				caseCommunicationId: communicationId,
				caseInformationId: caseId,
				purposeId: parseInt(selectedPurpose.value),
				messageTypeId: parseInt(selectedMessageType.value),
				messageStatusId: parseInt(selectedMessageStatus.value),
				messageReponseId: parseInt(selectedMessageResponse.value) || 0,
				startCommunicationDate: startCommunicationDatePost,
				endCommunicationDate: endCommunicationDatePost,
				duration: parseInt(duration),
				communicationContent: serviceEditCaseCommContent,
				surveyTemplateId: surveyTemplateId,
				communicationFeedBackType: customerCaseCommunicationFeedback,
				communicationSurveyQuestion: customerCaseCommunicationSurvey,
				communicationOwner: parseInt(communicationOwner.value),
				createdBy: parseInt(communicationOwner.value),
				updatedBy: parseInt(communicationOwner.value),
			},
			campaignIds: editCommCampaignNames.map((i) => ({campaignId: parseInt(i.value ?? '')})),
			createdBy: parseInt(userId ?? '0'),
			updatedBy: parseInt(userId ?? '0'),
		};
		setSubmitting(true);
		updateCustomerServiceCommunication(request);
	};

	const cancelEdiCommunication = () => {
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

		let isEditCommDateAfter = isAfter(new Date(endCommunicationDatePost), new Date(startCommunicationDatePost));
		if (!isEditCommDateAfter) {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textCommunicationDateValidation, SwalFailedMessage.icon);
		}

		const invalidSurveyAnswers = customerCaseCommunicationSurvey.filter(
			(i) => i.isRequired && i.surveyAnswer.trim() == '' && i.surveyQuestionAnswersId == 0
		);
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
				submitEditCommunication(_caseStatus);
				validateContentAnnotation();
			}
		});
	};

	const extractBaseWords = (word: string) => {
		const parser = new DOMParser();
		const doc = parser.parseFromString(word, 'text/html');

		const baseWords = doc.body.textContent ?? '';

		const finalResult = baseWords.replace(/[\n\r]/g, '');

		return finalResult;
	};

	const validateContentAnnotation = () => {
		const contentBefore = extractBaseWords(convertedContent);
		const contentAfter = extractBaseWords(commAnnotationUpdated);

		const parsedCommunicationId: number = communicationId ?? 0;

		const validationRequest: ValidateCaseCommunicationAnnotationRequestModel = {
			caseCommunicationId: parsedCommunicationId ?? 0,
			contentBefore: contentBefore,
			contentAfter: contentAfter,
		};

		validateCaseCommunicationAnnotation(validationRequest)
			.then((response) => {
				if (response.status === successResponse) {
					return true;
				} else return false;
			})
			.catch(() => {
				swal(SwalGatewayErrorMessage.title, 'Problem encountered validating the communication content', SwalGatewayErrorMessage.icon);
				return false;
			});
	};

	const updateCustomerServiceCommunication = (_request: UpSertCustomerServiceCaseCommunicationRequestModel) => {
		UpSertCustomerServiceCaseCommunication(_request)
			.then((response) => {
				if (response.status === successResponse) {
					onSuccessEditCustomerServiceCommunication(response.data);
				} else {
					swal(SwalTransactionErrorMessage.title, SwalTransactionErrorMessage.textError, SwalTransactionErrorMessage.icon);
					setSubmitting(false);
				}
			})
			.catch(() => {
				swal(SwalGatewayErrorMessage.title, SwalGatewayErrorMessage.textError, SwalGatewayErrorMessage.icon);
				setSubmitting(false);
			});
	};

	const onSuccessEditCustomerServiceCommunication = (_editCommDataResponse: any) => {
		if (_editCommDataResponse.caseStatus === 'Closed') {
			swal(SwalTransactionSuccessMessage.title, 'Case is saved with Closed Status', SwalTransactionSuccessMessage.icon).then((onSuccess) => {
				if (onSuccess) {
					history.push(`/case-management/service-case/${_editCommDataResponse.caseId}`);
					setSubmitting(false);
				}
			});
		}

		if (_editCommDataResponse.caseStatus === 'Open') {
			swal(
				SwalTransactionSuccessMessage.title,
				`Case is saved with Open Status \n Missing Main Attributes: \n ${_editCommDataResponse.caseMissingFields} \n \n Please contact the admin if this is incorrect.`,
				SwalTransactionSuccessMessage.icon
			).then((onSuccess) => {
				if (onSuccess) {
					history.push(`/case-management/service-case/${_editCommDataResponse.caseId}`);
					setSubmitting(false);
				}
			});
		}
	};

	return (
		<div>
			<CustomerCaseGenInfo
				pageAction={pageActions.editCommunication}
				brand={brand}
				setBrand={setBrand}
				brandOptions={brandOptionList}
				currency={currency}
				caseTexStatus={caseTexStatus}
				setCaseType={setCaseType}
				caseType={caseType}
				caseOwner={caseOwner}
				setCaseOwner={setCaseOwner}
				vipLevel={vipLevel}
				playerId={playerId}
				setPlayerId={setPlayerId}
				username={username}
				setUsername={setUsername}
				userList={userList}
				onChangeUsername={onChangeUsername}
				onChangePlayerId={onChangePlayerId}
				searchPlayerId={searchPlayerId}
				searchUserName={searchUserName}
				paymentGroup={paymentGroup}
				playerIdOptions={playerIdOptions}
				usernameOptions={usernameOptions}
				setPlayerIdOptions={setPlayerIdOptions}
				setUsernameOptions={setUsernameOptions}
				campaignNames={editCommCampaignNames}
				setCampaignNames={setEditCommCampaignNames}
			/>

			{PaddedDiv}

			<CustomerCaseInformation
				pageAction={pageActions.editCommunication}
				language={language}
				setLanguage={setLanguage}
				subject={subject}
				setSubject={setSubject}
				topic={topic}
				setTopic={setTopic}
				subtopic={subtopic}
				setSubtopic={setSubtopic}
				currencyCode={currencyCode}
				getLanguage={getLanguage}
				getSubtopicLanguageNameById={getSubtopicLanguageNameById}
				getTopicNameByCode={getTopicNameByCode}
				languageOptions={languageOptions}
				subtopicLanguage={subtopicLanguage}
				topicLanguage={topicLanguage}
			/>

			{PaddedDiv}

			<CustomerCommunication
				selectedPurpose={selectedPurpose}
				communicationOwner={communicationOwner}
				setCommunicationOwner={setCommunicationOwner}
				setSelectedPurpose={setSelectedPurpose}
				selectedMessageType={selectedMessageType}
				setSelectedMessageType={setSelectedMessageType}
				selectedMessageStatus={selectedMessageStatus}
				setSelectedMessageStatus={setSelectedMessageStatus}
				selectedMessageResponse={selectedMessageResponse}
				setSelectedMessageResponse={setSelectedMessageResponse}
				messageTypeOptions={messageTypeOptions}
				messageStatusOptions={messageStatusOptionList}
				messageResponseOptions={messageResponseOptionList}
				endCommunicationDate={endCommunicationDate}
				openEndCommunication={openEndCommunication}
				openStartCommunication={openStartCommunication}
				setEndCommunicationDate={setEndCommunicationDate}
				setEndCommunicationDatePost={setEndCommunicationDatePost}
				setOpenEndCommunication={setOpenEndCommunication}
				setOpenStartCommunication={setOpenStartCommunication}
				setStartCommunicationDate={setStartCommunicationDate}
				setStartCommunicationDatePost={setStartCommunicationDatePost}
				startCommunicationDate={startCommunicationDate}
				setConvertedContent={setConvertedContent}
				convertedContent={convertedContent}
				userList={userList}
				masterReferenceOptions={masterReferenceOptions}
				duration={duration}
				setDuration={setDuration}
				communicationId={communicationId.toString()}
				externalId={externalId}
				isChatIntegrationCommunication={isChatIntegrationCommunication}
				setCommAnnotationUpdated={setCommAnnotationUpdated}
				isEdit={true}
				reportedDate={reportedDate}
				setReportedDate={setReportedDate}
			/>

			{PaddedDiv}

			<CustomerServiceEditCommunicationFeedback communicationId={communicationId} setCommunicationFeedback={setCustomerCaseCommunicationFeedback} />

			{PaddedDiv}

			<CustomerServiceEditCommunicationSurvey
				surveyTemplateId={surveyTemplateId}
				setSurveyTemplateId={setSurveyTemplateId}
				communicationId={communicationId}
				setCommunicationSurvey={setCustomerCaseCommunicationSurvey}
			/>

			{PaddedDiv}

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
						onClick={cancelEdiCommunication}
						disabled={submitting}
					/>
				</div>
			</MainContainer>
		</div>
	);
};

export default CustomerServiceEditCommunication;
