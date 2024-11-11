import {faCopy} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {addHours, addSeconds, subMinutes} from 'date-fns';
import React, {useCallback, useEffect, useState} from 'react';
import {Col, Row} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import {RootState} from '../../../../../../setup';
import {ElementStyle, MessageGroupEnum, MessageStatusEnum, MessageTypeEnum} from '../../../../../constants/Constants';
import useConstant from '../../../../../constants/useConstant';
import {
	BasicDateTimePicker,
	BasicFieldLabel,
	DefaultPrimaryButton,
	FormHeader,
	MainContainer,
	MlabButton,
	RequiredLabel,
} from '../../../../../custom-components';
import {MLabQuillEditor} from '../../../../../custom-components/wysiwyg/MLabQuillEditor';
import useFnsDateFormatter from '../../../../../custom-functions/helper/useFnsDateFormatter';
import {IAuthState} from '../../../../auth';
import {CloudTalkCdrResponseModel} from '../../../../case-management/models';
import {FlyFoneOutboundCallRequestModel} from '../../../../case-management/models/request/FlyFoneOutboundCallRequestModel';
import {SamespaceGetCallResponseModel} from '../../../../case-management/models/response/SamespaceGetCallResponseModel';
import {USER_CLAIMS} from '../../../../user-management/components/constants/UserClaims';
import {CommunicationProviderAccountUdt} from '../../../../user-management/models';
import UseCaseCommConstant from '../../../UseCaseCommConstant';
import {ICaseCommunicationProps} from '../../../interface';
import {CloudTalkMakeACallRequestModel, FormattedFlyFoneCdrUdt} from '../../../models';
import {SamespaceMakeACallRequestModel} from '../../../models/request/SamespaceMakeACallRequestModel';
import {useCaseCommHooks} from '../hooks';
import {CaseCommTooltip} from './CaseCommTooltip';

const CaseCommunication: React.FC<ICaseCommunicationProps> = ({
	masterReferenceOptions,
	selectedMessageType,
	setSelectedMessageType,
	selectedMessageStatus,
	setSelectedMessageStatus,
	selectedMessageResponse,
	setSelectedMessageResponse,
	setIsContactable,
	setStartCommunicationDate,
	setStartCommunicationDatePost,
	setEndCommunicationDate,
	setEndCommunicationDatePost,
	openStartCommunication,
	setOpenStartCommunication,
	startCommunicationDate,
	setOpenEndCommunication,
	openEndCommunication,
	endCommunicationDate,
	editorKey,
	setConvertedContent,
	messageStatusOptionList,
	selectedPurpose,
	setSelectedPurpose,
	hasCallingOnCreateCase,
	getMessageResponseOptionById,
	messageResponseOptionList,
	getMessageStatusOptionById,
	convertedContent,
	setHasCdr,
	isDisableCreateCaseWhenHasCdr,
	dialID,
	setDialID,
	mobilePhone,
	paramPlayerId,
	setIsDisableCreateCaseWhenHasCdr,
	setHasCallingOnCreateCase,
	disableCall,
	retrievedFlyfoneCdrData,
	retrievedCloudTalkCdrData,
	retrievedSamespaceCdrData,
	commProviderProps,
	caseMlabPlayerId,
}) => {
	/**
	 * ? Redux
	 */
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	/**
	 *  ? Hooks
	 */
	const {postDateHourMinSecFormat} = UseCaseCommConstant();
	const {properFormatDateHourMinSec, InvalidNumberLowerCase, ContactableLowerCase, UncontactableLowerCase, message} = useConstant();
	const {
		campaignCallPlayer,
		isCalling,
		callingCode,
		setIsCalling,
		isFetching,
		flyfoneCdrData,
		cloudTalkCall,
		cloudTalkCdr,
		samespaceCall,
		samespaceCdrData,
		UploadCaseCommContentImageToMlabStorage,
	} = useCaseCommHooks();
	
	const [isStartCallClick, setIsStartCallClick] = useState<boolean>(false);
	const {mlabFormatDate} = useFnsDateFormatter();
	/**
	 *  ? Watchers
	 */
	const [caseToolTipShow, setCaseToolTipShow] = useState<boolean>(false);

	useEffect(() => {
		if (commProviderProps && commProviderProps.filter((obj) => obj.messageGroupId === MessageGroupEnum.Call).length > 0) {
			let commProvObj = commProviderProps.filter((obj) => obj.messageGroupId === MessageGroupEnum.Call).find((obj) => obj.messageTypeName !== '');
			setSelectedMessageType({label: commProvObj?.messageTypeName, value: commProvObj?.messageTypeId});
		}
	}, [commProviderProps]);

	useEffect(() => {
		setSelectedPurpose(masterReferenceOptions.flatMap((x) => x.options).find((x) => x.label.toLowerCase() === 'add communication'));
	}, [masterReferenceOptions]);

	useEffect(() => {
		if (messageStatusOptionList.length === 1) setSelectedMessageStatus(messageStatusOptionList.find((x) => x.label !== ''));
	}, [messageStatusOptionList]);

	useEffect(() => {
		if (messageResponseOptionList.length === 1) setSelectedMessageResponse(messageResponseOptionList.find((x) => x.label !== ''));
	}, [messageResponseOptionList]);

	useEffect(() => {
		if (selectedMessageType !== undefined) {
			const {value} = selectedMessageType;
			getMessageStatusOptionById(value);
		}
	}, [selectedMessageType]);

	useEffect(() => {
		if (callingCode !== '0') setDialID(callingCode);
	}, [callingCode]);

	useEffect(() => {
		if (flyfoneCdrData !== undefined) {
			populateCaseCommunicationFromFlyfoneCdr(flyfoneCdrData);
		}
	}, [flyfoneCdrData]);

	useEffect(() => {
		if (cloudTalkCdr !== undefined) populateCaseCommFromCloudTalkCdr(cloudTalkCdr);
	}, [cloudTalkCdr]);

	useEffect(() => {
		if (samespaceCdrData !== undefined) populateCaseCommFromSamespaceCdr(samespaceCdrData);
	}, [samespaceCdrData]);

	useEffect(() => {
		setHasCallingOnCreateCase(isCalling);
	}, [isCalling]);

	useEffect(() => {
		setIsCalling(hasCallingOnCreateCase);
	}, [hasCallingOnCreateCase]);

	useEffect(() => {
		if (retrievedFlyfoneCdrData !== undefined) populateCaseCommunicationFromFlyfoneCdr(retrievedFlyfoneCdrData);
	}, [retrievedFlyfoneCdrData]);

	useEffect(() => {
		if (retrievedCloudTalkCdrData !== undefined) populateCaseCommFromCloudTalkCdr(retrievedCloudTalkCdrData);
	}, [retrievedCloudTalkCdrData]);

	useEffect(() => {
		if (retrievedSamespaceCdrData !== undefined) populateCaseCommFromSamespaceCdr(retrievedSamespaceCdrData);
	}, [retrievedSamespaceCdrData]);

	/**
	 *  ? Events
	 */
	const handleEditorChange = useCallback((_content: string) => {
		setConvertedContent(_content);
	}, []);

	const onChangeMessageType = (val: any) => {
		setSelectedMessageType(val);
		setSelectedMessageStatus('');
		setSelectedMessageResponse('');
	};

	const onChangeMessageStatus = (val: any) => {
		setSelectedMessageStatus(val);
		setSelectedMessageResponse('');
		const {label, value} = val;

		getMessageResponseOptionById(value);

		if (label.toLocaleLowerCase() === ContactableLowerCase) {
			setIsContactable(true);
		} else {
			setIsContactable(false);
		}

		if (label.toLocaleLowerCase() === InvalidNumberLowerCase || label.toLocaleLowerCase() === UncontactableLowerCase) {
			setHasCdr(true);

			// -- start communication date
			let startToday = subMinutes(new Date(), 1);
			let formatedStartCommunicationDate = mlabFormatDate(startToday, postDateHourMinSecFormat);
			setStartCommunicationDate(startToday);
			setStartCommunicationDatePost(formatedStartCommunicationDate);

			// -- end communication date
			setEndCommunicationDate(new Date());
			setEndCommunicationDatePost(mlabFormatDate(new Date(), postDateHourMinSecFormat));
		}
	};

	const onChangeEndCommunicationDate = (val: any) => {
		setEndCommunicationDate(val);
		setOpenEndCommunication(!openEndCommunication);
		let formatedEndCommunicationDate = mlabFormatDate(val, postDateHourMinSecFormat);
		setEndCommunicationDatePost(formatedEndCommunicationDate.toString());
	};

	const onChangeMessageResponse = (val: any) => {
		setSelectedMessageResponse(val);
	};

	const onChangeStartCommunicationDate = (val: any) => {
		setOpenStartCommunication(!openStartCommunication);
		setStartCommunicationDate(val);

		let formatedStartCommunicationDate = mlabFormatDate(val, postDateHourMinSecFormat);
		setStartCommunicationDatePost(formatedStartCommunicationDate.toString());
	};

	const setEndCommunicationNow = () => {
		setEndCommunicationDate(new Date());
		setEndCommunicationDatePost(mlabFormatDate(new Date(), 'MM/d/yyyy HH:mm:ss'));
	};

	const onChangeSelectPurpose = (val: string) => {
		setSelectedPurpose(val);
	};

	const setStartCommunicationNow = () => {
		setStartCommunicationDate(new Date());
		setStartCommunicationDatePost(mlabFormatDate(new Date(), 'MM/d/yyyy HH:mm:ss'));
	};
	const onClickDialId = async () => {
		navigator.clipboard.writeText(dialID);
		setCaseToolTipShow(!caseToolTipShow);
	};
	const createCaseCallPlayer = () => {
		setIsCalling(true);
		let request: FlyFoneOutboundCallRequestModel = {
			department:
				commProviderProps?.find((commDepartment) => commDepartment.messageTypeId === MessageTypeEnum.FlyFoneCall.toString())?.department ?? '',
			ext: commProviderProps?.find((commAccountId) => commAccountId.messageTypeId === MessageTypeEnum.FlyFoneCall.toString())?.accountID ?? '',
			outnumber: mobilePhone.replace(/\D/, ''),
			userId: userId?.toString() ?? '0',
			mlabPlayerId: Number(caseMlabPlayerId),
		};

		setStartCommunicationNow();
		setIsCalling(false);
		campaignCallPlayer(request);
	};

	const createCaseCloudTalkPlayer = () => {
		setIsCalling(true);
		let request: CloudTalkMakeACallRequestModel = {
			agentId: commProviderProps?.find((commAccountId) => commAccountId.messageTypeId === MessageTypeEnum.CloudTalk.toString())?.accountID ?? '',
			mlabPlayerId: Number(caseMlabPlayerId),
			userId: userId !== undefined ? parseInt(userId) : 0,
		};

		setStartCommunicationNow();
		setIsCalling(false);
		cloudTalkCall(request);
	};

	const createCaseSameSpacePlayer = () => {
		setIsCalling(true);

		let _sameSpaceParams: CommunicationProviderAccountUdt | undefined = commProviderProps?.find(
			(commAccountId) => commAccountId.messageTypeId === MessageTypeEnum.Samespace.toString()
		);

		if (_sameSpaceParams) {
			let request: SamespaceMakeACallRequestModel = {
				agentId: _sameSpaceParams.accountID,
				mlabPlayerId: Number(caseMlabPlayerId),
				userId: userId !== undefined ? parseInt(userId) : 0,
				subscriptionId: _sameSpaceParams.subscriptionId,
			};

			setStartCommunicationNow();
			samespaceCall(request);
		}
	};

	const callPlayer = () => {
		setIsStartCallClick(true);
		if (selectedMessageType.label !== undefined && selectedMessageType.value === MessageTypeEnum.FlyFoneCall.toString()) createCaseCallPlayer();
		if (selectedMessageType.label !== undefined && selectedMessageType.value === MessageTypeEnum.CloudTalk.toString()) createCaseCloudTalkPlayer();
		if (selectedMessageType.label !== undefined && selectedMessageType.value === MessageTypeEnum.Samespace.toString()) createCaseSameSpacePlayer();
	};
	const hasNoCommunicationProviderAccount = () => {
		const hasCaseCommunicationProvider = commProviderProps?.some((str) => str.messageGroupId === MessageGroupEnum.Call);
		return !hasCaseCommunicationProvider;
	};

	const disableCreateCaseCallBtn = () =>
		hasNoCommunicationProviderAccount() || isCalling || isFetching || disableCall || selectedMessageType.value === undefined;

	const caseCommContentChecker = async (_contentParam: string) => {
		if (convertedContent === '' || convertedContent === '<p>-</p>') {
			return _contentParam;
		} else if (_contentParam === convertedContent) {
			return convertedContent;
		} else {
			return convertedContent + _contentParam;
		}
	};

	const populateCaseCommunicationFromFlyfoneCdr = async (_flyfoneCdrData: FormattedFlyFoneCdrUdt) => {
		const {callDate, callRecording, duration} = _flyfoneCdrData;
		let flyfoneCallDateToGMT8 = addHours(Date.parse(callDate), 1);
		let flyfoneStartDateAddedDuration = addSeconds(flyfoneCallDateToGMT8, parseInt(duration));
		let callRecordingHtmlContent = `<a href="${callRecording}"> ${callRecording}</a>`;
		let flyfoneCaseCommunicationStartDate = mlabFormatDate(flyfoneCallDateToGMT8, 'MM/d/yyyy HH:mm:ss');
		let flyfoneCaseCommunicationEndDate = mlabFormatDate(flyfoneStartDateAddedDuration, 'MM/d/yyyy HH:mm:ss');
		let autoPopulateMessageStatus = messageStatusOptionList.find((x) => x.label === MessageStatusEnum.Contactable);
		let caseCommValidContent = await caseCommContentChecker(callRecordingHtmlContent);

		setStartCommunicationDate(flyfoneCallDateToGMT8);
		setEndCommunicationDate(flyfoneStartDateAddedDuration);
		setStartCommunicationDatePost(flyfoneCaseCommunicationStartDate.toString());
		setEndCommunicationDatePost(flyfoneCaseCommunicationEndDate.toString());
		setSelectedMessageStatus(autoPopulateMessageStatus);
		clearMessageResponse(autoPopulateMessageStatus)
		getMessageResponseOptionById(parseInt(autoPopulateMessageStatus?.value ?? '0'));
		setIsContactable(true);
		setHasCdr(true);
		setConvertedContent(caseCommValidContent);
		setIsDisableCreateCaseWhenHasCdr(true);
	};

	const clearMessageResponse = (autoPopulateMessageStatus: any) => {
		const messageResponse = autoPopulateMessageStatus !== selectedMessageStatus ? '' : selectedMessageResponse
		setSelectedMessageResponse(messageResponse)
	}

	const populateCaseCommFromCloudTalkCdr = async (_cloudTalkCdr: CloudTalkCdrResponseModel) => {
		const {endedAt, recordingLink, startedAt} = _cloudTalkCdr;
		let cloudTalkRecording =
			recordingLink !== null ? `<a href="${recordingLink}"> ${recordingLink}</a>` : `<p>${message.customerCase.cloudtalkHasNoRecordingLinkError}</p>`;
		let cloudTalkStartDate = mlabFormatDate(startedAt, 'MM/d/yyyy HH:mm:ss');
		let cloudTalkEndDate = mlabFormatDate(endedAt, 'MM/d/yyyy HH:mm:ss');
		let autoPopulateCloudTalkMessageStatus = messageStatusOptionList.find((x) => x.label === MessageStatusEnum.Contactable);
		let cloudTalkCallFormatContent = await caseCommContentChecker(cloudTalkRecording);
		let caseCloudTalkHasRecordingLink: boolean = recordingLink !== null;

		setStartCommunicationDate(new Date(cloudTalkStartDate));
		setEndCommunicationDate(new Date(cloudTalkEndDate));
		setStartCommunicationDatePost(cloudTalkStartDate.toString());
		setEndCommunicationDatePost(cloudTalkEndDate.toString());
		setSelectedMessageStatus(autoPopulateCloudTalkMessageStatus);
		clearMessageResponse(autoPopulateCloudTalkMessageStatus)
		getMessageResponseOptionById(parseInt(autoPopulateCloudTalkMessageStatus?.value ?? '0'));
		setIsContactable(true);
		setHasCdr(caseCloudTalkHasRecordingLink);
		setConvertedContent(cloudTalkCallFormatContent);
		setIsDisableCreateCaseWhenHasCdr(true);
	};

	function setCaseCommSamespaceRecordingURL(status: string, recordingURL: string) {
		let recordingLink = '';
		if (status === 'answered') {
			recordingLink =
				recordingURL !== null && recordingURL !== ''
					? `<a href="${recordingURL}"> ${recordingURL}</a>`
					: `<p>${message.customerCase.samespaceHasNoRecordingLinkError}</p>`;
		} else {
			recordingLink = convertedContent;
		}

		return recordingLink;
	}

	function setCaseCommMessageStatus(status: string) {
		if (status == 'answered') {
			let autoPopulateSamespaceCaseCommMessageStatus = messageStatusOptionList.find((x) => x.label === MessageStatusEnum.Contactable);
			return autoPopulateSamespaceCaseCommMessageStatus;
		} else {
			let autoPopulateSamespaceCaseCommMessageStatus = messageStatusOptionList.find((x) => x.label === MessageStatusEnum.Uncontactable);
			return autoPopulateSamespaceCaseCommMessageStatus;
		}
	}

	const populateCaseCommFromSamespaceCdr = async (_samespaceCdr: SamespaceGetCallResponseModel) => {
		const {recordingURL, startTime, endTime, status} = _samespaceCdr;
		let samespaceRecording = setCaseCommSamespaceRecordingURL(status, recordingURL);

		let samespaceCaseCommCallFormatContent = await caseCommContentChecker(samespaceRecording);
		let caseSamespaceCaseCommHasRecordingLink: boolean = status === 'answered' && recordingURL !== null && recordingURL !== '';
		let autoCaseCommMessageStatus = setCaseCommMessageStatus(status);

		if (startTime !== '') {
			let samespaceCaseCommStartDate = mlabFormatDate(startTime, 'MM/d/yyyy HH:mm:ss');
			setStartCommunicationDate(new Date(samespaceCaseCommStartDate));
			setStartCommunicationDatePost(samespaceCaseCommStartDate.toString());
		}

		if (endTime !== '' && status === 'answered') {
			let samespaceCaseCommEndDate = mlabFormatDate(endTime, 'MM/d/yyyy HH:mm:ss');
			setEndCommunicationDate(new Date(samespaceCaseCommEndDate));
			setEndCommunicationDatePost(samespaceCaseCommEndDate.toString());
		}

		setSelectedMessageStatus(autoCaseCommMessageStatus);
		clearMessageResponse(autoCaseCommMessageStatus)
		getMessageResponseOptionById(parseInt(autoCaseCommMessageStatus?.value ?? '0'));
		if (autoCaseCommMessageStatus?.label === MessageStatusEnum.Contactable) {
			setIsContactable(true);
		} else {
			setIsContactable(false);
		}
		setHasCdr(caseSamespaceCaseCommHasRecordingLink);
		setConvertedContent(samespaceCaseCommCallFormatContent);
		setIsDisableCreateCaseWhenHasCdr(caseSamespaceCaseCommHasRecordingLink);
	};

	return (
		<MainContainer>
			<FormHeader headerLabel={'Communication Detail'} />
			<div style={{margin: 40}}>
				<Row>
					<Col sm={3}>
						<BasicFieldLabel title={'Purpose'} />
					</Col>
					<Col sm={3}>
						<BasicFieldLabel title={'Message Type'} />
					</Col>
					<Col sm={3}></Col>
					<Col sm={3}>
						<BasicFieldLabel title={'Dial ID'} />
					</Col>
				</Row>
				<Row>
					<Col sm={3}>
						<Select
							size='small'
							style={{width: '100%'}}
							options={masterReferenceOptions}
							onChange={onChangeSelectPurpose}
							value={selectedPurpose}
							isDisabled={true}
						/>
					</Col>
					<Col sm={3}>
						<Select
							size='small'
							isDisabled={isStartCallClick}
							style={{width: '100%'}}
							options={commProviderProps
								?.filter((comObj) => comObj.messageGroupId === MessageGroupEnum.Call)
								.map((d) => {
									return {label: d.messageTypeName, value: d.messageTypeId};
								})}
							onChange={onChangeMessageType}
							value={selectedMessageType}
						/>
					</Col>
					<Col sm={3}>
						<div className='float-end'>
							<MlabButton
								access={true}
								type={'button'}
								weight={'solid'}
								size={'sm'}
								label={'Start Call'}
								customStyle={{backgroundColor: '#198754'}}
								style={ElementStyle.success}
								onClick={callPlayer}
								loadingTitle={' Calling ...'}
								loading={isCalling}
								disabled={disableCreateCaseCallBtn()}
							/>
						</div>
					</Col>
					<Col sm={3} style={{position: 'relative'}}>
						<input type='textbox' className='form-control form-control-sm' disabled aria-label='Mobile Number' value={dialID} />
						<div
							className='btn btn-icon w-auto px-0 btn-active-color-primary'
							style={{position: 'absolute', right: '20px', bottom: '-5px'}}
							onClick={onClickDialId}
						>
							<CaseCommTooltip showCaseCommToolTip={caseToolTipShow} message={'Copied'} />
							<FontAwesomeIcon role='button' icon={faCopy} />
						</div>
					</Col>
				</Row>
				<Row style={{marginTop: 20, marginBottom: 20}}>
					<Col sm={3}>
						<RequiredLabel title={'Start Communication'} />
						<div style={{display: 'flex'}}>
							<BasicDateTimePicker
								format={properFormatDateHourMinSec}
								onChange={onChangeStartCommunicationDate}
								onOpenCalendar={() => setOpenStartCommunication(!openStartCommunication)}
								onBlur={() => setOpenStartCommunication(!openStartCommunication)}
								onInputClick={() => setOpenStartCommunication(!openStartCommunication)}
								value={startCommunicationDate}
								open={false}
								timeFormat={'HH:mm:ss'}
								isDisable={true}
							/>
							<div className='col-sm-10'>
								<DefaultPrimaryButton
									isDisable={hasCallingOnCreateCase || isFetching || isDisableCreateCaseWhenHasCdr}
									access={access?.includes(USER_CLAIMS.CaseAndCommunicationWrite)}
									title={'Now'}
									onClick={setStartCommunicationNow}
								/>
							</div>
						</div>
					</Col>
					<Col sm={3}>
						<RequiredLabel title={'End Communication'} />
						<div style={{display: 'flex'}}>
							<BasicDateTimePicker
								format={properFormatDateHourMinSec}
								onChange={onChangeEndCommunicationDate}
								onInputClick={() => setOpenEndCommunication(!openEndCommunication)}
								value={endCommunicationDate}
								open={isDisableCreateCaseWhenHasCdr ? false : openEndCommunication}
								onBlur={() => setOpenEndCommunication(!openEndCommunication)}
								onOpenCalendar={() => setOpenEndCommunication(!openEndCommunication)}
								timeFormat={'HH:mm:ss'}
								isDisable={isDisableCreateCaseWhenHasCdr}
							/>
							<div className='col-sm-10'>
								<DefaultPrimaryButton
									isDisable={hasCallingOnCreateCase || isFetching || isDisableCreateCaseWhenHasCdr}
									access={access?.includes(USER_CLAIMS.CaseAndCommunicationWrite)}
									title={'Now'}
									onClick={setEndCommunicationNow}
								/>
							</div>
						</div>
					</Col>
					<Col sm={3}>
						<RequiredLabel title={'Message Status'} />
						<Select
							size='small'
							isDisabled={false}
							style={{width: '100%'}}
							options={messageStatusOptionList}
							onChange={onChangeMessageStatus}
							value={selectedMessageStatus}
						/>
					</Col>
					<Col sm={3}>
						<RequiredLabel title={'Message Response'} />
						<Select
							size='small'
							isDisabled={false}
							style={{width: '100%'}}
							options={messageResponseOptionList}
							onChange={onChangeMessageResponse}
							value={selectedMessageResponse}
						/>
					</Col>
				</Row>
				<Row>
					<RequiredLabel title={'Communication Content'} />
				</Row>
				<Row>
					<Col sm={12}>
						<div style={{width: '100%', height: 'auto', marginBottom: 20, zIndex: 'auto'}} className='border'>
							<MLabQuillEditor
								isUploadToMlabStorage={true}
								uploadToMlabStorage={UploadCaseCommContentImageToMlabStorage}
								isReadOnly={isDisableCreateCaseWhenHasCdr}
								quillValue={convertedContent}
								setQuillValue={(content: string) => {
									handleEditorChange(content);
								}}
								hasImageToEditor={true}
							/>
						</div>
					</Col>
				</Row>
			</div>
		</MainContainer>
	);
};

export default CaseCommunication;
