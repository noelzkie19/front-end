import {Guid} from 'guid-typescript';
import React, {useCallback, useEffect, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../setup';
import {LookupModel} from '../../../common/model';
import {ElementStyle} from '../../../constants/Constants';
import useConstant from '../../../constants/useConstant';
import {MainContainer, MlabButton} from '../../../custom-components';
import {useUserOptionList} from '../../../custom-functions';
import useSystemHooks from '../../../custom-functions/system/useSystemHooks';
import {IAuthState} from '../../auth';
import {useSystemOptionHooks} from '../../system/shared';
import {USER_CLAIMS} from '../../user-management/components/constants/UserClaims';
import {UpSertCustomerServiceCaseCommunicationRequestModel, UpsertCaseResponse} from '../models';
import {UpSertCustomerServiceCaseCommunication} from '../services/CustomerCaseApi';
import {CustomerCaseGenInfo, CustomerCaseInformation} from '../shared/components';
import CommunicationList from '../shared/components/CommunicationList';
import useCustomerCaseHooks from '../shared/hooks/UseCustomerCaseHooks';
import useCustomerCaseCommHooks from '../shared/hooks/useCustomerCaseCommHooks';
import useCaseManagementConstant from '../useCaseManagementConstant';

const EditCustomerServiceCase: React.FC = () => {
	/**
	 *  ? Redux
	 */
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const editCSCaseUserAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	/**
	 *  ? States
	 */
	const [submitting, setSubmitting] = useState<boolean>(false);

	// General Informations
	const [username, setUsername] = useState<any>('');
	const [playerId, setPlayerId] = useState<any>('');
	const [brand, setBrand] = useState<any>('');
	const [currency, setCurrency] = useState<string>('');
	const [caseTexStatus, setCaseTexStatus] = useState<string>('');
	const [caseType, setCaseType] = useState<any>('');
	const [caseOwner, setCaseOwner] = useState<any>('');
	const [vipLevel, setVipLevel] = useState<string>('');
	const [currencyCode, setCurrencyCode] = useState<string>('');
	const [playerPostId, setPlayerPostId] = useState<number>(0);
	const [paymentGroup, setPaymentGroup] = useState<string>('');
	const [campaignNames, setCampaignNames] = useState<Array<LookupModel>>([]);

	// Case Informations
	const [subject, setSubject] = useState<string>('');
	const [topic, setTopic] = useState<any>('');
	const [subtopic, setSubtopic] = useState<any>('');
	const [language, setLanguage] = useState<any>('');

	/**
	 *  ? Hooks
	 */
	const {caseId}: {caseId: number} = useParams();
	const {getBrandOptions, brandOptionList, getCaseTypeOptions} = useSystemOptionHooks();
	const {getCustomerServiceCaseInformationById, caseInformations} = useCustomerCaseCommHooks();
	const {userList} = useUserOptionList();
	const {
		getPlayersByPlayerIdOptions,
		playerIdOptions,
		getPlayersByUsernameOptions,
		usernameOptions,
		validatePlayerCaseCommunication,
		setPlayerIdOptions,
		setUsernameOptions,
		playerGenInfo,
	} = useCustomerCaseHooks();
	const {getLanguage, languageOptions, getTopicNameByCode, topicLanguage, getSubtopicLanguageNameById, subtopicLanguage} = useSystemHooks();
	const PaddedDiv = <div style={{margin: 20}} />;
	const {caseStatus, successResponse, SwalFailedMessage, SwalConfirmMessage, SwalTransactionSuccessMessage, SwalGatewayErrorMessage} = useConstant();
	const {pageActions} = useCaseManagementConstant();

	const history = useHistory();

	/**
	 *  ? Mounted
	 */
	useEffect(() => {
		getBrandOptions();
		getCaseTypeOptions();
		getCustomerServiceCaseInformationById(caseId, editCSCaseUserAccessId);
	}, []);

	/**
	 *  ? Effects
	 */

	useEffect(() => {
		if (caseInformations !== undefined) {
			const {
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
				languageId,
				languageCode,
				playerId,
				username,
				caseTypeName,
				caseStatusName,
				brandId,
				brandName,
				campaignList,
				mlabPlayerId,
			} = caseInformations;
			setCaseOwner({label: caseCreatorName, value: caseCreatorId});
			setCaseType({label: caseTypeName, value: caseTypeId});
			setTopic({label: topicLanguageTranslation, value: topicLanguageId});
			setSubtopic({label: subtopicLanguageTranslation, value: subtopicLanguageId});
			setSubject(subject);
			setCurrency(currencyCode);
			setCurrencyCode(currencyCode);
			setVipLevel(vipLevelName);
			setPaymentGroup(paymentGroupName);
			setLanguage({label: languageCode, value: languageId});
			setPlayerId({label: playerId, value: username});
			setUsername({label: username, value: playerId});
			setCaseTexStatus(caseStatusName);
			getTopicNameByCode(languageCode, currencyCode);
			setBrand({label: brandName, value: brandId});
			setPlayerPostId(mlabPlayerId);
			setCampaignNames(
				campaignList.map((i) => {
					return {value: i.campaignId.toString(), label: i.campaignName ?? ''};
				})
			);
		}
	}, [caseInformations]);

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

	/**
	 *  ? Events
	 */
	const onChangeEditServiceCaseUsername = useCallback(
		(event: any) => {
			setUsername(event);
			const {value} = event;
			validatePlayerCaseCommunication(value);
		},
		[username]
	);

	const onChangeEditServiceCasePlayerId = useCallback(
		(event: any) => {
			setPlayerId(event);
			const {label} = event;
			validatePlayerCaseCommunication(label);
		},
		[playerId]
	);

	const searchUserName = (input: string) => {
		if (input.length > 2 && brand != '') {
			getPlayersByUsernameOptions(input, brand.value, editCSCaseUserAccessId);
		}
	};

	const searchPlayerId = (input: string) => {
		if (input.length > 2 && brand != '') {
			getPlayersByPlayerIdOptions(input, brand.value, editCSCaseUserAccessId);
		}
	};

	const validateUpdateCase = (_caseStatus: number) => {
		// Validate Case Information
		if (
			brand.value === undefined ||
			brand.value === 0 ||
			username.value === undefined ||
			username.value === 0 ||
			playerId.value === undefined ||
			playerId.value === 0 ||
			subject === undefined ||
			subject === '' ||
			topic.value === undefined ||
			topic.value === 0 ||
			subtopic.value === undefined ||
			subtopic.value === 0 ||
			caseOwner.value === undefined ||
			caseOwner === ''
		) {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon);
		}

		//Validate Campaign Names count
		if (campaignNames && campaignNames.length > 10) {
			return swal(SwalFailedMessage.title, SwalFailedMessage.textCampaignNameCountExceeded, SwalFailedMessage.icon);
		}

		swal({
			title: SwalConfirmMessage.title,
			text: 'This action will save the record and update case status accordingly. Please confirm.',
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willSave) => {
			if (willSave) {
				submitUpdateCase(_caseStatus);
			}
		});
	};

	const submitUpdateCase = (_caseStatus: number) => {
		const request: UpSertCustomerServiceCaseCommunicationRequestModel = {
			queueId: Guid.create().toString(),
			mlabPlayerId: playerPostId,
			userId: userId?.toString() ?? '0',
			caseInformationId: parseInt(caseId.toString()),
			caseCreatorId: parseInt(caseOwner.value),
			caseTypeId: parseInt(caseType.value),
			caseStatusId: _caseStatus,
			subtopicLanguageId: parseInt(subtopic.value),
			topicLanguageId: parseInt(topic.value),
			subject: subject,
			brandId: parseInt(brand.value),
			languageId: parseInt(language.value),
			caseCommunication: undefined,
			campaignIds: campaignNames.map((i) => ({campaignId: parseInt(i.value ?? '')})),
			createdBy: parseInt(userId ?? '0'),
			updatedBy: 0,
		};
		setSubmitting(true);
		UpsertCustomerServiceEditCase(request);
	};

	const UpsertCustomerServiceEditCase = (_request: UpSertCustomerServiceCaseCommunicationRequestModel) => {
		UpSertCustomerServiceCaseCommunication(_request)
			.then((response) => {
				if (response.status === successResponse) {
					messageOnSuccessEditServiceCase(response.data);
				} else {
					mesageOnFailEditServiceCase();
				}
			})
			.catch(() => {
				mesageOnFailEditServiceCase();
			});
	};

	const messageOnSuccessEditServiceCase = (_caseData: UpsertCaseResponse) => {
		if (_caseData.caseStatus === 'Closed') {
			swal(SwalTransactionSuccessMessage.title, 'Case is saved with Closed Status', SwalTransactionSuccessMessage.icon).then((onSuccess) => {
				if (onSuccess) {
					history.push(`/case-management/service-case/${_caseData.caseId}`);
					setSubmitting(false);
				}
			});
		}

		if (_caseData.caseStatus === 'Open') {
			swal(
				SwalTransactionSuccessMessage.title,
				`Case is saved with Open Status \n Missing Main Attributes: \n ${_caseData.caseMissingFields} \n \n Please contact the admin if this is incorrect.`,
				SwalTransactionSuccessMessage.icon
			).then((onSuccess) => {
				if (onSuccess) {
					history.push(`/case-management/service-case/${_caseData.caseId}`);
					setSubmitting(false);
				}
			});
		}
	};

	const mesageOnFailEditServiceCase = () => {
		swal(SwalGatewayErrorMessage.title, SwalGatewayErrorMessage.textError, SwalGatewayErrorMessage.icon);
		setSubmitting(false);
	};

	const cancelEditCustomerServiceCase = () => {
		swal({
			title: SwalConfirmMessage.title,
			text: SwalConfirmMessage.textDiscard,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willSave) => {
			if (willSave) {
				history.push(`/case-management/service-case/${caseId}`);
			}
		});
	};

	return (
		<>
			<CustomerCaseGenInfo
				pageAction={pageActions.editCase}
				brand={brand}
				setBrand={setBrand}
				brandOptions={brandOptionList}
				caseId={caseId}
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
				onChangePlayerId={onChangeEditServiceCasePlayerId}
				onChangeUsername={onChangeEditServiceCaseUsername}
				paymentGroup={paymentGroup}
				searchPlayerId={searchPlayerId}
				searchUserName={searchUserName}
				playerIdOptions={playerIdOptions}
				usernameOptions={usernameOptions}
				setPlayerIdOptions={setPlayerIdOptions}
				setUsernameOptions={setUsernameOptions}
				campaignNames={campaignNames}
				setCampaignNames={setCampaignNames}
			/>

			{PaddedDiv}

			<CustomerCaseInformation
				pageAction={pageActions.editCase}
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
			<CommunicationList caseId={caseId} />

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
						onClick={() => validateUpdateCase(caseStatus.Open)}
						loading={submitting}
						loadingTitle={'Please wait ...'}
						disabled={submitting}
					/>
					<MlabButton
						loading={submitting}
						loadingTitle={'Please wait ...'}
						access={true}
						size={'sm'}
						label={'Cancel'}
						style={ElementStyle.secondary}
						type={'button'}
						weight={'solid'}
						onClick={cancelEditCustomerServiceCase}
						disabled={submitting}
					/>
				</div>
			</MainContainer>
		</>
	);
};

export default EditCustomerServiceCase;
