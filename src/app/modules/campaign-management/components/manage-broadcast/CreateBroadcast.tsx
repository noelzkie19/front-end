import {faInfoCircle, faMinusSquare, faPlusSquare} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {HubConnection} from '@microsoft/signalr';
import {AxiosResponse} from 'axios';
import DOMPurify from 'dompurify';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import {htmlDecode} from 'js-htmlencode';
import moment from 'moment';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import DatePicker from 'react-datepicker';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import useConstant from '../../../../constants/useConstant';
import {
	BasicFieldLabel,
	ContentContainer,
	FormContainer,
	FormGroupContainer,
	FormHeader,
	GridWithLoaderAndPagination,
	LoaderButton,
	MLabQuillEditor,
	MainContainer,
	RequiredLabel,
} from '../../../../custom-components';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import {getInvalidHtmlTags, isEmpty} from '../../../../custom-functions/helper/validationHelper';
import {LookupModel} from '../../../../shared-models/LookupModel';
import {IAuthState} from '../../../auth';
import {DefaultPageSetup} from '../../../system/components/constants/PlayerConfigEnums';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {BroadcastConfigurationModel} from '../../models/request/BroadcastConfigurationModel';
import {BroadcastConfigurationRecipientModel} from '../../models/request/BroadcastConfigurationRecipientModel';
import {BroadcastConfigurationRequest} from '../../models/request/BroadcastConfigurationRequest';
import {UpsertBroadcastConfiguration} from '../../redux/ManageBroadcastApi';
import AllowedHtmlTagsModal from './AllowedHtmlTagsModal';
interface Upload {
	base64textString: string;
	imageName: string;
	showImage: boolean;
}

const initialValues = {
	attachment: '',
	botDetailId: 0,
	message: '',
	queueId: '',
	userId: '',
	botDetailsAutoReplyId: 0,
	telegramBotAutoReplyTriggerId: 0,
};

const CreateBroadcast: React.FC = () => {
	const {access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	//custom
	const messageTypeOptions = CommonLookups('messageTypes');
	//States
	const {id}: {id: string} = useParams();
	const editorKey: number = 4;
	const [pageSizeCreate, setPageSizeCreate] = useState<number>(DefaultPageSetup.pageSizeDefault);
	const [currentPageCreate, setCurrentPageCreate] = useState<number>(1);
	const [recordCountCreate, setRecordCountCreate] = useState<number>(0);
	const [sortOrderCreate, setSortOrderCreate] = useState<string>('DESC');
	const [sortColumnCreate, setSortColumnCreate] = useState<string>('CreatedDate');
	const [loadingCreate, setLoadingCreate] = useState(false);
	const {UpsertBroadcastConstants, successResponse, HubConnected, tinyMCEKey} = useConstant();
	const [convertedContentCreate, setConvertedContentCreate] = useState<string>('');
	const [isSubmittingCreate, setIsSubmittingCreate] = useState<boolean>(false);
	const [imageDataCreate, setImageDataCreate] = useState<Upload>({
		base64textString: '',
		imageName: '',
		showImage: false,
	});
	const [createBroadcastName, setCreateBroadcastName] = useState<string>('');
	const [selectedCreateBroadcastDate, setSelectedCreateBroadcastDate] = useState<any>();
	const [createBroadcastConfigurationRecipients, setCreateBroadcastConfigurationRecipients] = useState<Array<BroadcastConfigurationRecipientModel>>(
		[]
	);
	let broadcastConfigurationRecipientsTemp: Array<BroadcastConfigurationRecipientModel>;

	const [selectedCreateMessageTypeOption, setSelectedCreateMessageTypeOption] = useState<LookupModel>({label: 'Telegram', value: '7'});
	const [recipientCreateToggle, setRecipientCreateToggle] = useState<boolean>(true);
	const [showForm, setShowForm] = useState<boolean>(false);

	const gridRef: any = useRef();
	const history = useHistory();

	const customPlayerIdRender = (params: any) => {
		const {data} = params;
		if (data.playerId == 0) return '';
		else return data.playerId;
	};

	const createColumnDefs = [
		{headerName: 'Recipient Type', field: 'recipientType', flex: 1},
		{headerName: 'Player ID', field: 'playerId', flex: 1, cellRenderer: customPlayerIdRender},
		{headerName: 'Username', field: 'username', flex: 1},
		{headerName: 'Brand', field: 'brand', flex: 1},
		{headerName: 'Currency', field: 'currency', flex: 1},
		{headerName: 'VIP Level', field: 'vipLevel', flex: 1},
		{headerName: 'Leads ID', field: 'leadId', flex: 1},
		{headerName: 'Leads Name', field: 'leadName', flex: 1},
	];
	const createStyleHideDetails = {
		display: 'none',
	};

	const handleBeforeUnload = (event: any) => {
		let isRedirecting = localStorage.getItem('isRedirecting');
		if (isRedirecting && isRedirecting === '0') {
			const confirmationMessage = 'Are you sure you want to leave?'; // Confirmation message

			event.preventDefault(); // Cancel the event to prevent the browser from closing immediately
			event.returnValue = confirmationMessage; // Set a custom confirmation message (supported by most browsers)
			localStorage.removeItem(id);
			return confirmationMessage; // Return the confirmation message (supported by some older browsers)
		}
	};
	//useEffects
	useEffect(() => {
		localStorage.setItem('isRedirecting', '0');

		if (!access?.includes(USER_CLAIMS.BroadcastRead) || !access?.includes(USER_CLAIMS.BroadcastWrite)) history.push('/error/401');

		getAllRecipientByFilter();
		window.addEventListener('beforeunload', handleBeforeUnload);

		// Clean up by removing the event listener when the component unmounts
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, []);

	useEffect(() => {
		if (messageTypeOptions.length > 0) {
			let telegram = messageTypeOptions.find((d) => d.value.toString() === UpsertBroadcastConstants.MessageTypeOptionDefault.value);
			if (telegram) {
				setSelectedCreateMessageTypeOption(telegram);
			}
		}
	}, [messageTypeOptions]);

	const onClickNextCreate = () => {
		if (totalPageCreate() > currentPageCreate) {
			setCurrentPageCreate(currentPageCreate + 1);
			paginationLoadListCreate(pageSizeCreate, currentPageCreate + 1, sortColumnCreate, sortOrderCreate);
		}
	};

	const onClickLastCreate = () => {
		if (totalPageCreate() > currentPageCreate) {
			setCurrentPageCreate(totalPageCreate());
			paginationLoadListCreate(pageSizeCreate, totalPageCreate(), sortColumnCreate, sortOrderCreate);
		}
	};

	const paginationLoadListCreate = (_pageSize: number, _currentPage: number, _sortColumn: string, _sortOrder: string) => {
		getAllRecipientByFilter(_sortColumn, _sortOrder, (_currentPage - 1) * _pageSize, _pageSize);
	};
	const onPageSizeChangedCreate = () => {
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSizeCreate(Number(value));
		setCurrentPageCreate(1);
		if (broadcastConfigurationRecipientsTemp != undefined && broadcastConfigurationRecipientsTemp.length > 0) {
			paginationLoadListCreate(Number(value), 1, sortColumnCreate, sortOrderCreate);
		}
	};

	const totalPageCreate = () => {
		return Math.ceil(recordCountCreate / pageSizeCreate) | 0;
	};
	const onSortCreate = (e: any) => {
		if (broadcastConfigurationRecipientsTemp != undefined && broadcastConfigurationRecipientsTemp.length > 0) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumnCreate(sortDetail[0]?.colId);
				setSortOrderCreate(sortDetail[0]?.sort);
				getAllRecipientByFilter(sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				setSortColumnCreate('');
				setSortOrderCreate('');
				getAllRecipientByFilter();
			}
		}
	};

	const onPaginationClickPreviousCreate = () => {
		if (currentPageCreate > 1) {
			setCurrentPageCreate(currentPageCreate - 1);
			paginationLoadListCreate(pageSizeCreate, currentPageCreate - 1, sortColumnCreate, sortOrderCreate);
		}
	};

	const onPaginationClickFirstCreate = () => {
		if (currentPageCreate > 1) {
			setCurrentPageCreate(1);
			paginationLoadListCreate(pageSizeCreate, 1, sortColumnCreate, sortOrderCreate);
		}
	};

	const convertToBase64Create = (event: any) => {
		const file = event.target.files[0];
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			if (typeof reader.result === 'string') {
				setImageDataCreate({
					base64textString: reader.result,
					imageName: file.name,
					showImage: true,
				});
			} else {
				// Handle the case where reader.result is not a string (possibly an object)
				console.error('Error: Unexpected reader.result type:', typeof reader.result);
			}
		};
	};
	const handleMessageEditorChange = useCallback((_content: string) => {
		const cleanHtmlContentBroadcast = DOMPurify.sanitize(_content, {ALLOWED_TAGS: UpsertBroadcastConstants.AllowedHtmlTags});

		setConvertedContentCreate(cleanHtmlContentBroadcast);
	}, []);

	const onCreateMessageTypeOptionChange = (data: any) => {
		setSelectedCreateMessageTypeOption(data);
	};
	const onCreateChangeBroadcastName = (data: any) => {
		setCreateBroadcastName(data.target.value);
	};
	const createFormik = useFormik({
		initialValues,
		onSubmit: async () => {
			debugger;
			console.log(convertedContentCreate);
			if (!isValid()) {
				swal(
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.requiredAllFields,
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
				);
			} else if (!isAllowedHtmlTags()) {
				swal(
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.htmlTagsValidation,
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
				);
			} else if (new Date(selectedCreateBroadcastDate) <= new Date()) {
				swal(
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.broadcastDateValidation,
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
				);
			} else if (imageDataCreate.imageName != '' && isAllowedAttachment()) {
				swal(
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.attachmentValidation,
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
				);
			} else {
				setIsSubmittingCreate(true);
				swal({
					title: UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleConfirmation,
					text: UpsertBroadcastConstants.SwalUpsertBroadcastMessage.saveConfirmation, //'',
					icon: UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconWarning,
					buttons: ['No', 'Yes'],
					dangerMode: true,
				}).then((willUpdate) => {
					if (willUpdate) {
						upsertBroadcast();
					} else {
						setIsSubmittingCreate(false);
					}
				});
			}
		},
	});
	const upsertBroadcast = async () => {
		const broadcast: BroadcastConfigurationModel = {
			attachment: imageDataCreate.base64textString,
			broadcastDate: selectedCreateBroadcastDate,
			broadcastId: 0,
			broadcastConfigurationId: 0,
			broadcastName: createBroadcastName,
			broadcastStatusId: UpsertBroadcastConstants.BroadcastStatusId,
			message: htmlDecode(convertedContentCreate),
			messageTypeId: +UpsertBroadcastConstants.MessageTypeOptionDefault.value,
			createdDate: new Date(),
			botId: createBroadcastConfigurationRecipients[0].botId,
		};
		const addBroadcastRequest: BroadcastConfigurationRequest = {
			broadcastConfiguration: broadcast,
			broadcastConfigurationRecipients: createBroadcastConfigurationRecipients,
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};

		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				if (messagingHub.state !== HubConnected) {
					setIsSubmittingCreate(false);
					return;
				}
				UpsertBroadcastConfiguration(addBroadcastRequest)
					.then((response) => {
						processUpSertBotDetailAutoReplyResponse(response, messagingHub, addBroadcastRequest);
					})
					.catch((ex) => {
						swal(
							UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
							UpsertBroadcastConstants.SwalUpsertBroadcastMessage.textFailed,
							UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
						);
						setIsSubmittingCreate(false);
					});
			});
		}, 1000);
	};
	const processUpSertBotDetailAutoReplyResponse = (
		response: AxiosResponse<any>,
		messagingHub: HubConnection,
		newBOTDetailAutoReplyRequest: BroadcastConfigurationRequest
	) => {
		if (response.status === successResponse) {
			messagingHub.on(newBOTDetailAutoReplyRequest.queueId.toString(), (message) => {
				let resultData = JSON.parse(message.remarks).data as BroadcastConfigurationModel;
				localStorage.setItem('isRedirecting', '1');
				window.location.href = `/campaign-management/view-broadcast/${resultData.broadcastConfigurationId}`;
			});
		} else {
			swal(
				UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
				UpsertBroadcastConstants.SwalUpsertBroadcastMessage.textFailed,
				UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
			);
			setIsSubmittingCreate(false);
		}
	};
	const isValid = () => {
		if (isEmpty(selectedCreateBroadcastDate)) return false;
		if (isEmpty(convertedContentCreate)) return false;
		if (isEmpty(createBroadcastName)) return false;
		return true;
	};

	const isAllowedHtmlTags = () => {
		debugger;
		console.log(convertedContentCreate);
		const invalidTags = getInvalidHtmlTags(convertedContentCreate, UpsertBroadcastConstants.AllowedHtmlTags);
		if (invalidTags.length == 0) {
			return true;
		}
		return false;
	};

	const isAllowedAttachment = () => {
		if (!UpsertBroadcastConstants.AllowedAttachment.test(imageDataCreate.imageName)) {
			return true;
		}

		return false;
	};

	const onCreateClickEligibilityToggle = () => {
		setRecipientCreateToggle(!recipientCreateToggle);
	};
	const getAllRecipientByFilter = async (_sortColumn?: string, _sortOrder?: string, _offsetValue?: number, _pageSize?: number) => {
		const recipientFromStorageJSON = localStorage.getItem(id);
		if (recipientFromStorageJSON && (!broadcastConfigurationRecipientsTemp || broadcastConfigurationRecipientsTemp.length == 0)) {
			const data = JSON.parse(recipientFromStorageJSON);
			broadcastConfigurationRecipientsTemp = data;
		}
		setTimeout(() => {
			setLoadingCreate(true);
			const pageNumber = _offsetValue ?? 0;
			const startIndex = pageNumber;
			const endIndex = pageNumber + pageSizeCreate;
			const filteredArray = broadcastConfigurationRecipientsTemp?.slice(startIndex, endIndex) ?? [];
			setCreateBroadcastConfigurationRecipients(filteredArray);
			setLoadingCreate(false);
			setRecordCountCreate(broadcastConfigurationRecipientsTemp?.length);
		}, 1000);
	};
	const onCreateChangeBroadcastDate = (val: any) => {
		setSelectedCreateBroadcastDate(val);
	};
	const onCancelClick = () => {
		swal({
			title: UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleConfirmation,
			text: UpsertBroadcastConstants.SwalUpsertBroadcastMessage.cancelConfirmation, //'',
			icon: UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconWarning,
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				localStorage.setItem('isRedirecting', '1');
				window.close();
			}
		});
	};
	const onShowModal = () => {
		setShowForm(true);
	};

	const toolbarOptions = [['bold', 'italic', 'underline', 'strike'], ['blockquote'], ['emoji'], ['link']];

	return (
		<MainContainer>
			<FormHeader headerLabel={'Create Broadcast'} additionalElementPlacement={'left'} />
			<ContentContainer>
				<FormContainer onSubmit={createFormik.handleSubmit}>
					<MainContainer>
						<FormGroupContainer>
							<div className='row' style={{zIndex: 2}}>
								<div className='col-lg-4 mt-1'>
									<RequiredLabel title={'Broadcast Name'} />
									<input
										type='textbox'
										className='form-control form-control-sm'
										aria-label='Trigger'
										value={createBroadcastName}
										onChange={onCreateChangeBroadcastName}
									/>
								</div>
								<div className='col-lg-4 mt-1'>
									<RequiredLabel title={'Broadcast Date'} />
									<DatePicker
										dateFormat='yyyy-MM-dd HH:mm:ss'
										selected={selectedCreateBroadcastDate}
										onChange={onCreateChangeBroadcastDate}
										className='form-control form-control-sm'
										timeFormat='HH:mm'
										placeholderText='Broadcast Date'
										disabled={false}
										minDate={moment().toDate()}
										timeIntervals={1}
										showTimeSelect
									/>
								</div>
								<div className='col-lg-4 mt-1'>
									<RequiredLabel title={'Message Type'} />
									<Select
										style={{width: '100%'}}
										options={messageTypeOptions}
										onChange={onCreateMessageTypeOptionChange}
										value={selectedCreateMessageTypeOption}
										isDisabled={true}
									/>
								</div>
							</div>
							<div className='row'>
								<div className='col-lg-12 mt-1'>
									<BasicFieldLabel title={'Attachment'} />
									<input type='file' onChange={convertToBase64Create} accept='.png, .jpg, .svg, .gif' />
									<br />
									<img src={imageDataCreate.base64textString} alt={imageDataCreate.imageName} width='10%' />
								</div>
							</div>
							<div className='row'>
								<div className='col-lg-12 mt-1'>
									<RequiredLabel title={'Message'} />
									<FontAwesomeIcon icon={faInfoCircle} className='fa-1x' style={{marginLeft: 12, cursor: 'hand'}} onClick={onShowModal} />
								</div>
							</div>
							<div className='row mt-1'>
								<div className='col-lg-6 mt-1'>
									<div className='mt-5'>
										<MLabQuillEditor
											isUploadToMlabStorage={false}
											uploadToMlabStorage={undefined}
											isReadOnly={false}
											quillValue={convertedContentCreate}
											setQuillValue={(content: string) => {
												handleMessageEditorChange(content);
											}}
											hasImageToEditor={false}
											toolbarPropsOptions={toolbarOptions}
											formatProps={['bold', 'italic', 'underline', 'strike', 'blockquote', 'emoji', 'link']}
										/>
									</div>
								</div>
							</div>
							<div className='row mt-5' style={{border: '1px solid #e9ecef', marginLeft: '10px', marginRight: '10px'}}>
								<div className='col-lg-4 mt-3'>
									<h6>Recipients</h6>
								</div>

								<div className='col-lg-8 mt-3'>
									<FontAwesomeIcon
										style={{float: 'right', cursor: 'hand'}}
										icon={recipientCreateToggle ? faMinusSquare : faPlusSquare}
										onClick={onCreateClickEligibilityToggle}
									/>
								</div>
							</div>
							<div className='row pb-15' style={recipientCreateToggle ? {} : createStyleHideDetails}>
								<BasicFieldLabel title={'Total Recipient'} />
								<h6>{recordCountCreate}</h6>
								<GridWithLoaderAndPagination
									gridRef={gridRef}
									rowData={createBroadcastConfigurationRecipients}
									columnDefs={createColumnDefs}
									sortColumn={sortColumnCreate}
									sortOrder={sortOrderCreate}
									isLoading={loadingCreate}
									height={500}
									onSortChanged={(e: any) => onSortCreate(e)}
									//pagination details
									recordCount={recordCountCreate}
									currentPage={currentPageCreate}
									pageSize={pageSizeCreate}
									onClickFirst={onPaginationClickFirstCreate}
									onClickPrevious={onPaginationClickPreviousCreate}
									onClickNext={onClickNextCreate}
									onClickLast={onClickLastCreate}
									onPageSizeChanged={onPageSizeChangedCreate}
								></GridWithLoaderAndPagination>
								<AllowedHtmlTagsModal showForm={showForm} closeModal={() => setShowForm(false)} />
							</div>
						</FormGroupContainer>
						<FormGroupContainer>
							<div className='row'>
								<div className='col-lg-12 mt-1'>
									<LoaderButton
										access={true}
										loading={isSubmittingCreate}
										title={'Submit'}
										loadingTitle={' Please wait...'}
										disabled={createFormik.isSubmitting || isSubmittingCreate}
									/>
									<button type='button' className='btn btn-secondary btn-sm me-2' onClick={onCancelClick}>
										Cancel
									</button>
								</div>
							</div>
						</FormGroupContainer>
					</MainContainer>
				</FormContainer>
			</ContentContainer>
		</MainContainer>
	);
};
export default CreateBroadcast;
