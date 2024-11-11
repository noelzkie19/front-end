import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useFormik} from 'formik';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {ButtonGroup, Col, Container, InputGroup, Row} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../setup';
import {OptionListModel} from '../../../common/model';
import {
	BasicFieldLabel,
	ButtonsContainer,
	DangerButton,
	DefaultButton,
	DefaultSelect,
	DefaultTableButton,
	DefaultTextInput,
	FieldContainer,
	FormContainer,
	FormHeader,
	MainContainer,
	PaddedContainer,
	SuccessButton,
} from '../../../custom-components';
import {useCaseTypeOptions, useSubtopicOptions, useTopicOptions} from '../../../custom-functions';
import {PlayerModel} from '../../player-management/models/PlayerModel';
import {GetPlayerProfile} from '../../player-management/redux/PlayerManagementService';
import {USER_CLAIMS} from '../../user-management/components/constants/UserClaims';

import {AgGridReact} from 'ag-grid-react';
import {convertToHTML} from 'draft-convert';
import {convertToRaw} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import {CommunicationFeedBackResponse} from '../models';

import {useHistory} from 'react-router-dom';
import * as caseCommunication from '../redux/CaseCommunicationRedux';
import { ColDef, ColGroupDef } from 'ag-grid-community';

const formSchema = Yup.object().shape({
	// messageTypeName: Yup.string()
});

const initialValues = {
	feedbackDetails: '',
	solutionProvided: '',
};

const EditCase: React.FC = () => {
	// -----------------------------------------------------------------
	// GET REDUX STORE
	// -----------------------------------------------------------------
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userUsername = useSelector<RootState>(({auth}) => auth.user?.username, shallowEqual) as string;
	const caseCommunicationFeedbackData = useSelector<RootState>(
		({caseCommunication}) => caseCommunication.communicationFeedbackList,
		shallowEqual
	) as any;
	const dispatch = useDispatch();

	// -----------------------------------------------------------------
	// STATES WITH INTERFACE MODEL
	// -----------------------------------------------------------------
	const [playerInformation, setPlayerInformation] = useState<PlayerModel>();
	const [topicList, setTopicList] = useState<OptionListModel>();
	const [subtopicList, setSubtopicList] = useState<OptionListModel>();

	// -----------------------------------------------------------------
	// VARIABLES
	// -----------------------------------------------------------------
	const history = useHistory();

	// -----------------------------------------------------------------
	// STATES
	// -----------------------------------------------------------------
	const [contactMobileType, setContactMobileType] = useState<string>('password');
	const [contactEmail, setContactEmail] = useState<string>('password');
	const [isShowContactTypeMobile, setShowContactTypeMobile] = useState<boolean>(false);
	const [isShowEmailText, setIsShowEmailText] = useState<boolean>(false);

	const [selectedTopic, setSelectedTopic] = useState<string | any>('');
	const [selectedSubtopic, setSelectedSubtopic] = useState<string | any>('');
	const [selectedMessageType, setSelectedMessageType] = useState<string | any>('');
	const [selectedMessageStatus, setSelectedMessageStatus] = useState<string | any>('');
	const [selectedMessageResponse, setSelectedMessageResponse] = useState<string | any>('');
	const [selectedCaseType, setSelectedCaseType] = useState<string | any>('');
	const [selectedPurpose, setSelectedPurpose] = useState<string | any>('');
	const [selectedFeedbackType, setSelectedFeedbackType] = useState<string | any>('');
	const [selectedFeedbackCategory, setSelectedFeedbackCategory] = useState<string | any>('');
	const [selectedFeedbackAnswer, setSelectedFeedbackAnswer] = useState<string | any>('');

	const [startCommunicationDate, setStartCommunicationDate] = useState<any>();
	const [endCommunicationDate, setEndCommunicationDate] = useState<any>();

	const [topicId, setTopicId] = useState<number>(0);
	const [messageTypeId, setMessageTypeId] = useState<number>(0);
	const [messageStatusId, setMessageStatusId] = useState<number>(0);
	const [openStartCommunication, setOpenStartCommunication] = useState<boolean>(false);
	const [openEndCommunication, setOpenEndCommunication] = useState<boolean>(false);
	const [convertedContent, setConvertedContent] = useState<any>();
	const [feedbackTypeId, setFeedbackTypeId] = useState<number>(0);
	const [feedbackCategoryId, setFeedbackCategoryId] = useState<number>(0);

	const [editorState, setEditorState] = useState<any>();

	const [gridApi, setGridApi] = useState<any | null>(null);
	const [gridColumnApi, setGridColumnApi] = useState(null);
	const [rowData, setRowData] = useState<Array<CommunicationFeedBackResponse>>([]);

	// -- MOCKS ONLY -- //
	const [selectedCompetitor, setSelectedCompetitor] = useState<string | any>('');
	const [selectedPreffered, setSelectedPreffered] = useState<string | any>('');
	const [selectedSocial, setSelectedSocial] = useState<string | any>('');
	const [selectedOffered, setSelectedOffered] = useState<string | any>('');

	// -----------------------------------------------------------------
	// MOUNTED
	// -----------------------------------------------------------------

	useEffect(() => {
		getPlayerProfile(3206);
	}, []);

	useEffect(() => {
		// -- POPULATE PLAYER INFORMATION FIELDS -- //
		if (playerInformation !== undefined) {
			formik.setFieldValue('username', playerInformation.username);
			formik.setFieldValue('brand', playerInformation.brand);
			formik.setFieldValue('currency', playerInformation.currency);
			formik.setFieldValue('vipLevel', playerInformation.vipLevel);
			formik.setFieldValue('paymentGroup', playerInformation.paymentGroup);
			formik.setFieldValue('deposited', playerInformation.deposited);
			formik.setFieldValue('marketingChannel', playerInformation.marketingChannel);
			formik.setFieldValue('marketingSource', playerInformation.marketingSource);
			formik.setFieldValue('mobilePhone', playerInformation.mobilePhone);
			formik.setFieldValue('email', playerInformation.email);
			formik.setFieldValue('campaignName', playerInformation.campaignName);
			formik.setFieldValue('caseCreator', userUsername);
			formik.setFieldValue('caseId', '10011');
			formik.setFieldValue('caseStatus', 'Open');
		}
	}, [playerInformation]);

	const onGridReady = (params: any) => {
		setGridApi(params.api);
		setGridColumnApi(params.columnApi);
		params.api.paginationGoToPage(4);
		console.log(caseCommunicationFeedbackData);
		setRowData(caseCommunicationFeedbackData);
		params.api.sizeColumnsToFit();
	};

	async function getPlayerProfile(id: number) {
		await GetPlayerProfile({playerId: id})
			.then((response) => {
				console.log(response);
				if (response.status === 200) {
					let profile: PlayerModel = response.data?.data;
					setPlayerInformation(profile);
					console.log('---------profile-------------------');
					console.log(profile);
				} else {
					setPlayerInformation(undefined);
				}
			})
			.catch((ex) => {
				console.log('[ERROR] Player Profile: ' + ex);
				swal('Problem in getting profile');
			});
	}

	// -----------------------------------------------------------------
	// MOUNT OLD VALUES
	// -----------------------------------------------------------------
	useEffect(() => {
		setSelectedTopic({value: '56', label: 'TOPIC 1'});
		setSelectedSubtopic({value: '133', label: 'SUBTOPIC 6'});
		setSelectedCaseType({value: '1', label: 'Campaign'});
	}, []);

	// -----------------------------------------------------------------
	// METHODS
	// -----------------------------------------------------------------

	const onEditorStateChange = (editorState: any) => {
		if (editorState !== undefined) {
			let html = draftToHtml(convertToRaw(editorState.getCurrentContent()));
			console.log(html);
		}
		convertContentToHTML();
		setEditorState(editorState);
	};

	const convertContentToHTML = () => {
		if (editorState !== undefined) {
			let currentContentAsHTML = convertToHTML(editorState.getCurrentContent());
			setConvertedContent(currentContentAsHTML);
		}
	};

	const _setEndCommunicationNow = () => {
		// SETTING DATE TODAY //

		moment.defaultFormat = 'DD.MM.YYYY HH:mm';
		// format the date string with the new defaultFormat then parse
		let today = moment(moment(), moment.defaultFormat).toDate(); // Fri Jul 20 2018 09:19:00 GMT+0300
		setEndCommunicationDate(today);
	};

	const _setStartCommunicationNow = () => {
		// SETTING DATE TODAY
		moment.defaultFormat = 'DD.MM.YYYY HH:mm';
		// format the date string with the new defaultFormat then parse
		let today = moment(moment(), moment.defaultFormat).toDate(); // Fri Jul 20 2018 09:19:00 GMT+0300
		setStartCommunicationDate(today);
	};

	const onChangeSelectFeedbackType = (val: string | any) => {
		setSelectedFeedbackType(val);
		setSelectedFeedbackCategory('');
		setFeedbackTypeId(val.value);
	};

	const onChangeSelectFeedbackCategory = (val: string | any) => {
		setSelectedFeedbackCategory(val);
		setSelectedFeedbackAnswer('');
		setFeedbackCategoryId(val.value);
	};

	const onChangeSelectFeedbackAnswer = (val: string | any) => {
		setSelectedFeedbackAnswer(val);
	};

	const onChangeSelectPurpose = (val: string) => {
		setSelectedPurpose(val);
	};

	const onChangeStartCommunicationDate = (val: any) => {
		setOpenStartCommunication(!openStartCommunication);
		setStartCommunicationDate(val);
		console.log(val);
	};

	const onChangeEndCommunicationDate = (val: any) => {
		setEndCommunicationDate(val);
		setOpenEndCommunication(!openEndCommunication);
	};

	const onChangeSelectedTopic = (val: string | any) => {
		setSelectedTopic(val);
		setSelectedSubtopic('');
		setTopicId(val.value);
	};

	const onChangeSelectedSubTopic = (val: string) => {
		setSelectedSubtopic(val);
	};

	const onChangeMessageType = (val: string | any) => {
		setSelectedMessageType(val);
		setSelectedMessageStatus('');
		setSelectedMessageResponse('');
		setMessageTypeId(val.value);
	};

	const onChangeMessageStatus = (val: string | any) => {
		setSelectedMessageStatus(val);
		setSelectedMessageResponse('');
		setMessageStatusId(val.value);
	};

	const onChangeMessageResponse = (val: string) => {
		setSelectedMessageResponse(val);
	};

	const onChangeCaseType = (val: string) => {
		setSelectedCaseType(val);
	};

	const onClickContactMobile = () => {
		setShowContactTypeMobile(!isShowContactTypeMobile);
		setContactMobileType('password');

		if (!isShowContactTypeMobile) {
			setContactMobileType('text');
		}
	};

	const onClickShowEmail = () => {
		setIsShowEmailText(!isShowEmailText);
		setContactEmail('password');

		if (!isShowEmailText) {
			setContactEmail('text');
		}
	};

	const _dispatchFeedbackType = () => {
		let storedData = caseCommunicationFeedbackData ? caseCommunicationFeedbackData : [];

		// -- DIPATCH VALUE TO TABLE
		const request: CommunicationFeedBackResponse = {
			communicationFeedbackId: 1,
			caseCommunicationId: 1,
			communicationFeedbackNo: 1,
			feedbackTypeId: selectedFeedbackType.value,
			feedbackTypeName: selectedFeedbackType.label,
			feedbackCategoryId: selectedFeedbackCategory.value,
			feedbackCategoryName: selectedFeedbackCategory.label,
			feedbackAnswerId: selectedFeedbackAnswer.value,
			feedbackAnswerName: selectedFeedbackAnswer.label,
			communicationFeedbackDetails: formik.values.feedbackDetails,
			communicationSolutionProvided: formik.values.solutionProvided,
		};

		const newDataToStore = storedData.concat(request);

		dispatch(caseCommunication.actions.communicationFeedbackList(newDataToStore));
		// console.log(caseCommunicationFeedbackData)
		setRowData(caseCommunicationFeedbackData);
		_resetFeedbackForm();
	};

	const _resetFeedbackForm = () => {
		setSelectedFeedbackType('');
		setSelectedFeedbackCategory('');
		setSelectedFeedbackAnswer('');
		formik.setFieldValue('feedbackDetails', '');
		formik.setFieldValue('solutionProvided', '');
	};

	const _back = () => {
		swal({
			title: 'Confirmation',
			text: 'Any changes will be discarded, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				history.push('/campaign-workspace/');
			}
		});
	};

	// -----------------------------------------------------------------
	// TABLE CONTENT AND HEADERS
	// -----------------------------------------------------------------
	const columnDefs : (ColDef<CommunicationFeedBackResponse> | ColGroupDef<CommunicationFeedBackResponse>)[] =[
		{
			headerName: 'No',
			field: 'communicationFeedbackNo',
			sort: 'asc' as 'asc',
			cellRenderer: (params: any) => {<>{params ? <div>{params.data.communicationFeedbackNo}</div> : null}</> },
		},
		{headerName: 'Communication ID', field: 'feedbackTypeName'},
		{headerName: 'Message Type', field: 'feedbackCategoryName'},
		{headerName: 'Message Status', field: 'feedbackAnswerName'},
		{headerName: 'Created Date', field: 'communicationFeedbackDetails'},
		{headerName: 'Created by', field: 'communicationSolutionProvided'},
		{
			headerName: 'Action',
			cellRenderer: (params: any) => (
				<>
					{params.data.messageTypeId != 0 ? (
						<ButtonGroup aria-label='Basic example'>
							<div className='d-flex justify-content-center flex-shrink-0'>
								<DefaultTableButton
									access={userAccess.includes(USER_CLAIMS.MessageStatusWrite)}
									title={'View'}
									onClick={() => console.log('remove')}
								/>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},
	];

	// -----------------------------------------------------------------
	// FORMIK
	// -----------------------------------------------------------------
	const formik = useFormik({
		initialValues,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {},
	});

	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<MainContainer>
				<FormHeader headerLabel={'Player Information'} />
				<Container style={{marginTop: 40}}>
					<Row>
						<Col sm={3}>
							<BasicFieldLabel title={'Username'} />
							<DefaultTextInput ariaLabel={'username'} disabled={true} {...formik.getFieldProps('username')} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Brand'} />
							<DefaultTextInput ariaLabel={'brand'} disabled={true} {...formik.getFieldProps('brand')} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Currency'} />
							<DefaultTextInput ariaLabel={'currency'} disabled={true} {...formik.getFieldProps('currency')} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'VIP Level'} />
							<DefaultTextInput ariaLabel={'vipLevel'} disabled={true} {...formik.getFieldProps('vipLevel')} />
						</Col>
					</Row>

					<Row style={{marginTop: 20}}>
						<Col sm={3}>
							<BasicFieldLabel title={'Payment group'} />
							<DefaultTextInput ariaLabel={'paymentGroup'} disabled={true} {...formik.getFieldProps('paymentGroup')} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Deposited'} />
							<DefaultTextInput ariaLabel={'deposited'} disabled={true} {...formik.getFieldProps('deposited')} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Marketing  Channel'} />
							<DefaultTextInput ariaLabel={'marketingChannel'} disabled={true} {...formik.getFieldProps('marketingChannel')} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Marketing  Source'} />
							<DefaultTextInput ariaLabel={'marketingSource'} disabled={true} {...formik.getFieldProps('marketingSource')} />
						</Col>
					</Row>

					<Row style={{marginTop: 20, marginBottom: 20}}>
						<Col sm={3}>
							<BasicFieldLabel title={'Agent Notes'} />
							<DefaultTextInput ariaLabel={'agentNotes'} disabled={true} {...formik.getFieldProps('agentNotes')} />
						</Col>

						<Col sm={3}>
							<BasicFieldLabel title={'Mobile Number'} />
							<InputGroup>
								<div className='col-sm-10'>
									<input
										type={contactMobileType}
										className='form-control form-control-sm'
										disabled
										aria-label='Mobile Number'
										{...formik.getFieldProps('mobilePhone')}
									/>
								</div>
								{playerInformation?.mobilePhone !== undefined ? (
									<div
										className='btn btn-icon w-auto px-0 btn-active-color-primary'
										style={{right: '20px', bottom: '5px'}}
										onClick={onClickContactMobile}
									>
										<FontAwesomeIcon icon={isShowContactTypeMobile ? faEyeSlash : faEye} />
									</div>
								) : null}
							</InputGroup>
						</Col>

						<Col sm={3}>
							<BasicFieldLabel title={'Email Address'} />
							<InputGroup>
								<div className='col-sm-10'>
									<input
										type={contactEmail}
										className='form-control form-control-sm'
										disabled
										aria-label='Mobile Number'
										{...formik.getFieldProps('email')}
									/>
								</div>
								{playerInformation?.email !== undefined ? (
									<div
										className='btn btn-icon w-auto px-0 btn-active-color-primary'
										style={{right: '20px', bottom: '5px'}}
										onClick={onClickShowEmail}
									>
										<FontAwesomeIcon icon={isShowEmailText ? faEyeSlash : faEye} />
									</div>
								) : null}
							</InputGroup>
						</Col>
					</Row>
				</Container>
			</MainContainer>

			<div style={{margin: 20}}></div>

			<MainContainer>
				<FormHeader headerLabel={'Case Information'} />
				<Container style={{marginTop: 40}}>
					<Row>
						<Col sm={3}>
							<BasicFieldLabel title={'Case ID'} />
							<DefaultTextInput ariaLabel={'caseId'} disabled={true} {...formik.getFieldProps('caseId')} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Case Status'} />
							<DefaultTextInput ariaLabel={'caseStatus'} disabled={true} {...formik.getFieldProps('caseStatus')} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Case Creator'} />
							<DefaultTextInput ariaLabel={'caseCreator'} disabled={true} {...formik.getFieldProps('caseCreator')} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Case Type'} />
							<DefaultSelect
								data={useCaseTypeOptions()}
								onChange={onChangeCaseType}
								value={selectedCaseType}
								isSearchable={false}
								isDisabled={true}
							/>
						</Col>
					</Row>

					<Row style={{marginTop: 20, marginBottom: 20}}>
						<Col sm={3}>
							<BasicFieldLabel title={'Case Created Date'} />
							<DefaultTextInput ariaLabel={'createdDate'} disabled={true} {...formik.getFieldProps('createdDate')} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Last Modified By'} />
							<DefaultTextInput ariaLabel={'updatedBy'} disabled={true} {...formik.getFieldProps('updatedBy')} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Last Modified Date'} />
							<DefaultTextInput ariaLabel={'updatedDate'} disabled={true} {...formik.getFieldProps('updatedDate')} />
						</Col>
					</Row>

					<Row style={{marginTop: 20, marginBottom: 20}}>
						<Col sm={3}>
							<BasicFieldLabel title={'Topic'} />
							<DefaultSelect data={useTopicOptions()} onChange={onChangeSelectedTopic} value={selectedTopic} isDisabled={false} />
						</Col>
						<Col sm={3}>
							<BasicFieldLabel title={'Subtopic'} />
							<DefaultSelect data={useSubtopicOptions(topicId)} onChange={onChangeSelectedSubTopic} value={selectedSubtopic} isDisabled={false} />
						</Col>
					</Row>
				</Container>
			</MainContainer>

			<div style={{margin: 20}}></div>

			<MainContainer>
				<FormHeader headerLabel={'Communication Record'} />
				<Container style={{marginTop: 40}}>
					<Row>
						<Col sm={3} style={{display: 'flex', justifyContent: 'flex-start'}}>
							<Row style={{marginTop: 10, marginBottom: 20, marginLeft: 5}}>
								<DefaultButton
									access={userAccess.includes(USER_CLAIMS.MessageResponseWrite)}
									title={'Add Communication'}
									onClick={_dispatchFeedbackType}
								/>
							</Row>
						</Col>
					</Row>

					<div className='ag-theme-quartz' style={{height: 400, width: '100%', marginBottom: 20}}>
						<AgGridReact
							rowData={rowData}
							defaultColDef={{
								sortable: true,
								resizable: true,
							}}
							onGridReady={onGridReady}
							rowBuffer={0}
							enableRangeSelection={true}
							pagination={true}
							paginationPageSize={10}
							columnDefs={columnDefs}
						/>
					</div>
				</Container>
			</MainContainer>

			<MainContainer>
				<Container>
					<PaddedContainer>
						<FieldContainer>
							<ButtonsContainer>
								<SuccessButton
									access={userAccess.includes(USER_CLAIMS.MessageTypeWrite)}
									title={'Submit'}
									onClick={() => {
										console.log('post transaction');
									}}
								/>
								<DangerButton access={userAccess.includes(USER_CLAIMS.MessageTypeRead)} title={'Back'} onClick={_back} />
							</ButtonsContainer>
						</FieldContainer>
					</PaddedContainer>
				</Container>
			</MainContainer>
		</FormContainer>
	);
};

export default EditCase;
