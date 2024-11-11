import moment from 'moment';
import React, {useCallback, useEffect, useState} from 'react';
import {Col, Row} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import {RootState} from '../../../../../setup';
import useConstant from '../../../../constants/useConstant';
import {
	BasicDateTimePicker,
	BasicFieldLabel,
	BasicTextInput,
	DefaultPrimaryButton,
	MLabQuillEditor,
	MainContainer,
	RequiredLabel,
} from '../../../../custom-components';
import {IAuthState} from '../../../auth';
import UseCaseCommConstant from '../../../case-communication/UseCaseCommConstant';
import {useCaseCommHooks} from '../../../case-communication/components/shared/hooks';
import '../../../case-communication/styles/Editor.css';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import '../../css/CaseManagement.css';
import Props from '../../models/CustomerCommunicationProps';
import {getCaseCommAnnotationByCaseCommId} from '../../services/CustomerCaseApi';
import {HttpStatusCodeEnum} from '../../../../constants/Constants';
import swal from 'sweetalert';

const CustomerCommunication: React.FC<Props> = (Props) => {
	/**
	 *  ? Props
	 */
	const {
		selectedPurpose,
		setSelectedPurpose,
		communicationOwner,
		setCommunicationOwner,
		messageTypeOptions,
		selectedMessageType,
		setSelectedMessageType,
		messageStatusOptions,
		selectedMessageStatus,
		setSelectedMessageStatus,
		messageResponseOptions,
		selectedMessageResponse,
		setSelectedMessageResponse,
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
		setConvertedContent,
		convertedContent,
		userList,
		masterReferenceOptions,
		duration,
		externalId,
		communicationId,
		isChatIntegrationCommunication,
		setCommAnnotationUpdated,
		isEdit,
		reportedDate,
	} = Props;

	/**
	 *  ? States
	 */
	const [isAnnotated, setIsAnnotated] = useState(false);
	const [allowUpdates, setAllowUpdates] = useState(false);

	/**
	 *  ? Redux
	 */
	const {access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	/**
	 *  ? Hooks
	 */
	const {momentFormat, postDateFormat} = UseCaseCommConstant();
	const {properFormatDateHourMinSecDashed, messageTypes, message} = useConstant();
	const {UploadCaseCommContentImageToMlabStorage} = useCaseCommHooks();

	/**
	 *  ? Events
	 */

	const onChangePurpose = useCallback(
		(event: any) => {
			setSelectedPurpose(event);
		},
		[selectedPurpose]
	);

	const onChangeMessageType = useCallback(
		(event: any) => {
			setSelectedMessageType({value: parseInt(event.value), label: event.label});
			setSelectedMessageStatus('');
			setSelectedMessageResponse('');
		},
		[selectedMessageType]
	);

	const onChangeMessageStatus = useCallback(
		(event: any) => {
			setSelectedMessageStatus(event);
			setSelectedMessageResponse('');
		},
		[selectedMessageType]
	);

	const onChangeMessageResponse = useCallback(
		(event: any) => {
			setSelectedMessageResponse(event);
		},
		[selectedMessageResponse]
	);

	const handleEditorChange = useCallback((event: any) => {
		setConvertedContent(event);
		if (setCommAnnotationUpdated) {
			setCommAnnotationUpdated(event);
		}
	}, []);

	const onChangeCaseOwner = useCallback(
		(event: any) => {
			setCommunicationOwner(event);
		},
		[communicationOwner]
	);

	const onChangeStartCommunicationDate = (val: any) => {
		setOpenStartCommunication(!openStartCommunication);
		setStartCommunicationDate(val);
		let formatedStartCommunicationDate = moment(val).format(postDateFormat);
		setStartCommunicationDatePost(formatedStartCommunicationDate.toString());
	};

	const onChangeEndCommunicationDate = (val: any) => {
		setEndCommunicationDate(val);
		setOpenEndCommunication(!openEndCommunication);

		let formatedEndCommunicationDate = moment(val).format(postDateFormat);
		setEndCommunicationDatePost(formatedEndCommunicationDate.toString());
	};

	const setEndCommunicationNow = () => {
		moment.defaultFormat = momentFormat;
		let today = moment(moment(), moment.defaultFormat).toDate();
		setEndCommunicationDate(today);

		let formatedEndCommunicationDate = moment(today).format(postDateFormat);
		setEndCommunicationDatePost(formatedEndCommunicationDate.toString());
	};

	const setStartCommunicationNow = () => {
		moment.defaultFormat = momentFormat;
		let today = moment(moment(), moment.defaultFormat).toDate();
		setStartCommunicationDate(today);
		let formatedStartCommunicationDate = moment(today).format(postDateFormat);
		setStartCommunicationDatePost(formatedStartCommunicationDate.toString());
	};

	// handlers for annotation
	useEffect(() => {
		hasCaseCommAnnotationOnEdit();
		if (setCommAnnotationUpdated) {
			setCommAnnotationUpdated('');
		}
	}, []);

	const hasCaseCommAnnotationOnEdit = () => {
		getCaseCommAnnotationByCaseCommId(parseInt(communicationId?.toString() ?? '0'))
			.then((response) => {
				if (response.status === HttpStatusCodeEnum.Ok && response.data.length > 0) {
					setIsAnnotated(true);
				} else {
					setIsAnnotated(false);
				}
			})
			.catch((err) => {
				console.log('Problem in case communication annotation details' + err);
			});
	};

	const handleEditorOnPress = (content: any) => {
		if (isAnnotated && !allowUpdates) {
			swal({
				title: 'Confirmation',
				text: message.communicationContentEditWarning,
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			}).then((response) => {
				if (response) {
					setAllowUpdates(true);
				}
			});
		}
	};

	return (
		<MainContainer>
			<div style={{margin: 20}}>
				<Row>
					<Col sm='6'>
						<p className='fw-bolder'>Communication ID: {communicationId}</p>
					</Col>
					<Col sm='6'>
						<p className='fw-bolder'>External ID: {externalId}</p>
					</Col>
				</Row>
				<Row>
					<Col sm='12'>
						<h5 className='fw-bolder m-0'>{'Communication Detail'}</h5>
					</Col>
				</Row>
				<Row>
					<Col sm={6}>
						<BasicFieldLabel title={'Purpose'} />
						<Select
							size='small'
							style={{width: '100%'}}
							options={masterReferenceOptions.filter((obj) => obj.masterReferenceParentId === 4).map((x) => x.options)}
							onChange={onChangePurpose}
							value={selectedPurpose}
							isDisabled={true}
						/>
					</Col>
					<Col sm={6}>
						<BasicFieldLabel title={'Communication Owner'} />
						<Select
							size='small'
							style={{width: '100%'}}
							options={userList}
							onChange={onChangeCaseOwner}
							value={communicationOwner}
							isDisabled={!access?.includes(USER_CLAIMS.CreateCaseonBehalfWrite) || isChatIntegrationCommunication}
						/>
					</Col>
				</Row>
				<Row>
					<Col sm={4}>
						<RequiredLabel title={'Message Type'} />
						<Select
							size='small'
							style={{width: '100%'}}
							options={messageTypeOptions}
							onChange={onChangeMessageType}
							value={selectedMessageType}
							isDisabled={isChatIntegrationCommunication}
						/>
					</Col>
					<Col sm={4}>
						<RequiredLabel title={'Message Status'} />
						<Select
							size='small'
							style={{width: '100%'}}
							options={messageStatusOptions}
							onChange={onChangeMessageStatus}
							value={selectedMessageStatus}
							isDisabled={isChatIntegrationCommunication}
						/>
					</Col>
					<Col sm={4}>
						{selectedMessageType.value === messageTypes.Call ? (
							<>
								<RequiredLabel title={'Message Response'} />
								<Select
									size='small'
									style={{width: '100%'}}
									options={messageResponseOptions}
									onChange={onChangeMessageResponse}
									value={selectedMessageResponse}
									isDisabled={isChatIntegrationCommunication}
								/>
							</>
						) : null}
					</Col>
				</Row>
				<Row style={isEdit ? {marginTop: 20} : {marginTop: 20, marginBottom: 20}}>
					<Col sm={4}>
						<RequiredLabel title={'Start Communication'} />
						<div style={{display: 'flex'}}>
							<BasicDateTimePicker
								format={properFormatDateHourMinSecDashed}
								onChange={onChangeStartCommunicationDate}
								onOpenCalendar={() => setOpenStartCommunication(!openStartCommunication)}
								onBlur={() => setOpenStartCommunication(!openStartCommunication)}
								onInputClick={() => setOpenStartCommunication(!openStartCommunication)}
								value={startCommunicationDate}
								open={openStartCommunication}
								isDisable={isChatIntegrationCommunication}
							/>
							<div className='col-sm-10'>
								<DefaultPrimaryButton
									isDisable={isChatIntegrationCommunication}
									access={access?.includes(USER_CLAIMS.CreateCustomerCaseWrite)}
									title={'Now'}
									onClick={setStartCommunicationNow}
								/>
							</div>
						</div>
					</Col>
					<Col sm={4}>
						<RequiredLabel title={'End Communication'} />
						<div style={{display: 'flex'}}>
							<BasicDateTimePicker
								format={properFormatDateHourMinSecDashed}
								onChange={onChangeEndCommunicationDate}
								onInputClick={() => setOpenEndCommunication(!openEndCommunication)}
								value={endCommunicationDate}
								open={openEndCommunication}
								onBlur={() => setOpenEndCommunication(!openEndCommunication)}
								onOpenCalendar={() => setOpenEndCommunication(!openEndCommunication)}
								isDisable={isChatIntegrationCommunication}
							/>
							<div className='col-sm-10'>
								<DefaultPrimaryButton
									isDisable={isChatIntegrationCommunication}
									access={access?.includes(USER_CLAIMS.CreateCustomerCaseWrite)}
									title={'Now'}
									onClick={setEndCommunicationNow}
								/>
							</div>
						</div>
					</Col>
					<Col sm={4}>
						<BasicFieldLabel title={'Duration'} />
						<BasicTextInput ariaLabel={'currency'} colWidth={'col-sm-12'} value={duration} onChange={(e) => {}} disabled={true} />
					</Col>
				</Row>
				{isEdit && (
					<Row>
						<Col sm={4} className='reported-date'>
							<RequiredLabel title={'Reported Date'} />
							<BasicTextInput ariaLabel={'currency'} colWidth={'col-sm-12'} value={reportedDate} onChange={(e) => {}} disabled={true} />
						</Col>
					</Row>
				)}

				<Row>
					<RequiredLabel title={'Communication Content'} />
				</Row>
				<Row>
					<Col sm={12}>
						<div style={{width: '100%', height: 'auto', marginBottom: 20, zIndex: 'auto'}} className='border'>
							<MLabQuillEditor
								isUploadToMlabStorage={true}
								uploadToMlabStorage={UploadCaseCommContentImageToMlabStorage}
								isReadOnly={isChatIntegrationCommunication}
								quillValue={convertedContent}
								setQuillValue={handleEditorChange}
								onKeyPress={handleEditorOnPress}
								onKeyDown={handleEditorOnPress}
								hasImageToEditor={true}
							/>
						</div>
					</Col>
				</Row>
			</div>
		</MainContainer>
	);
};

export default CustomerCommunication;
