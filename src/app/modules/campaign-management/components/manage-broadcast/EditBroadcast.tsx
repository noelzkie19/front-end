import {faInfoCircle, faMinusSquare, faPlusSquare} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {HubConnection} from '@microsoft/signalr';
import {AxiosResponse} from 'axios';
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
import {ElementStyle} from '../../../../constants/Constants';
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
	MlabButton,
	RequiredLabel,
} from '../../../../custom-components';
import CommonLookups from '../../../../custom-functions/CommonLookups';
import useFnsDateFormatter from '../../../../custom-functions/helper/useFnsDateFormatter';
import {getInvalidHtmlTags, isEmpty} from '../../../../custom-functions/helper/validationHelper';
import {LookupModel} from '../../../../shared-models/LookupModel';
import {IAuthState} from '../../../auth';
import {DefaultPageSetup} from '../../../system/components/constants/PlayerConfigEnums';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {BroadcastConfigurationModel} from '../../models/request/BroadcastConfigurationModel';
import {BroadcastConfigurationRequest} from '../../models/request/BroadcastConfigurationRequest';
import {GetBroadcastConfigurationByIdRequest} from '../../models/request/GetBroadcastConfigurationByIdRequest';
import {GetBroadcastConfigurationRecipientsStatusProgressByIdRequest} from '../../models/request/GetBroadcastConfigurationRecipientsStatusProgressByIdRequest';
import {BroadcastConfigurationRecipientModelResponse} from '../../models/response/BroadcastConfigurationRecipientModelResponse';
import {GetBroadcastConfigurationByIdResponse} from '../../models/response/GetBroadcastConfigurationByIdResponse';
import {GetBroadcastConfigurationRecipientsStatusProgressByIdResponse} from '../../models/response/GetBroadcastConfigurationRecipientsStatusProgressByIdResponse';
import {
	CancelBroadcast,
	GetBroadcastConfigurationById,
	GetBroadcastConfigurationByIdResult,
	GetBroadcastConfigurationRecipientsStatusProgressById,
	GetBroadcastConfigurationRecipientsStatusProgressByIdResult,
	UpsertBroadcastConfiguration,
} from '../../redux/ManageBroadcastApi';
import AllowedHtmlTagsModal from './AllowedHtmlTagsModal';
import DOMPurify from 'dompurify';

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

const EditBroadcast: React.FC = () => {
	const {access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;

	//custom
	const messageTypeOptions = CommonLookups('messageTypes');
	const {mlabFormatDate} = useFnsDateFormatter();
	//States
	const {id}: {id: string} = useParams();
	const [editPageSize, setEditPageSize] = useState<number>(DefaultPageSetup.pageSizeDefault);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('DESC');
	const [sortColumn, setSortColumn] = useState<string>('BroadcastConfigurationRecipientId');
	const [loading, setLoading] = useState(false);
	const {UpsertBroadcastConstants, successResponse, HubConnected, tinyMCEKey} = useConstant();
	const [editConvertedContent, setEditConvertedContent] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [imageEditData, setImageEditData] = useState<Upload>({
		base64textString: '',
		imageName: '',
		showImage: false,
	});
	const [editBroadcastName, setEditBroadcastName] = useState<string>('');
	const [editBroadcastId, setEditBroadcastId] = useState<any>();
	const [editBroadcastStatus, setEditBroadcastStatus] = useState<any>();
	const [broadcastStatusId, setBroadcastStatusId] = useState<any>();
	const [selectedEditBroadcastDate, setSelectedEditBroadcastDate] = useState<any>();
	const [editBroadcastConfigurationModel, setEditBroadcastConfigurationModel] = useState<BroadcastConfigurationModel>();
	const [editBroadcastConfigurationRecipients, setEditBroadcastConfigurationRecipients] = useState<
		Array<BroadcastConfigurationRecipientModelResponse>
	>([]);
	const [selectedEditMessageTypeOption, setSelectedEditMessageTypeOption] = useState<LookupModel>(UpsertBroadcastConstants.MessageTypeOptionDefault);
	const [recipientEditToggle, setRecipientEditToggle] = useState<boolean>(true);
	const [total, setTotal] = useState<number>(0);
	const [totalDelivered, setTotalDelivered] = useState<number>(0);
	const [totalNotDelivered, setTotalNotDelivered] = useState<number>(0);
	const [totalPending, setTotalPending] = useState<number>(0);
	const [isEnableCancelBroadcast, setIsEnableCancelBroadcast] = useState<boolean>(false);
	const [isFieldEditable, setIsFieldEditable] = useState<boolean>(false);
	const [showForm, setShowForm] = useState<boolean>(false);
	const gridRef: any = useRef();
	const history = useHistory();
	let interval: any;

	const customPlayerIdRender = (params: any) => {
		const {data} = params;
		if (data.playerId == 0) return '';
		else return data.playerId;
	};

	const editColumnDefs = [
		{headerName: 'Recipient ID', field: 'broadcastConfigurationRecipientId', flex: 1},
		{headerName: 'Recipient Type', field: 'recipientType', flex: 1},
		{headerName: 'Player ID', field: 'playerId', flex: 1, cellRenderer: customPlayerIdRender},
		{headerName: 'Username', field: 'username', flex: 1},
		{headerName: 'Brand', field: 'brand', flex: 1},
		{headerName: 'Currency', field: 'currency', flex: 1},
		{headerName: 'VIP Level', field: 'viP_Level', flex: 1},
		{headerName: 'Leads ID', field: 'leadId', flex: 1},
		{headerName: 'Leads Name', field: 'leadName', flex: 1},
		{headerName: 'Broadcast Result', field: 'broadcastResult', flex: 1},
		{headerName: 'Reason', field: 'broadcastResultReason', flex: 2},
	];
	const editStyleHideDetails = {
		display: 'none',
	};
	const handleBeforeUnload = (event: any) => {
		let isRedirecting = localStorage.getItem('isRedirecting');
		if (isRedirecting && isRedirecting === '0') {
			event.returnValue = '';
			const confirmationMessage = 'Are you sure you want to leave?'; // Confirmation message

			event.preventDefault(); // Cancel the event to prevent the browser from closing immediately
			event.returnValue = confirmationMessage; // Set a custom confirmation message (supported by most browsers)
			return confirmationMessage; // Return the confirmation message (supported by some older browsers)
		}
	};
	//useEffects
	useEffect(() => {
		if (!access?.includes(USER_CLAIMS.BroadcastWrite)) history.push('/error/401');

		localStorage.setItem('isRedirecting', '0');
		getAllRecipientByFilter();
		getRecipientStatusProgressEdit();

		window.addEventListener('beforeunload', handleBeforeUnload);

		interval = setInterval(getRecipientStatusProgressEdit, 5000); // Polling every 5 seconds

		// Clean up by removing the event listener when the component unmounts
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, []);

	useEffect(() => {
		if (messageTypeOptions.length > 0) {
			let telegram = messageTypeOptions.find((d) => d.value.toString() === UpsertBroadcastConstants.MessageTypeOptionDefault.value);
			if (telegram) {
				setSelectedEditMessageTypeOption(telegram);
			}
		}
	}, [messageTypeOptions]);

	useEffect(() => {
		if (
			broadcastStatusId == UpsertBroadcastConstants.BroadcastStatusInProgressId ||
			broadcastStatusId == UpsertBroadcastConstants.BroadcastStatusId
		) {
			setIsEnableCancelBroadcast(true);
		} else {
			setIsEnableCancelBroadcast(false);
		}

		if (broadcastStatusId == UpsertBroadcastConstants.BroadcastStatusId) {
			setIsFieldEditable(true);
		} else {
			setIsFieldEditable(false);
		}
	}, [broadcastStatusId]);

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			paginationLoadList(editPageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			paginationLoadList(editPageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const paginationLoadList = (_editPageSize: number, _currentPage: number, _sortColumn: string, _sortOrder: string) => {
		getAllRecipientByFilter(_sortColumn, _sortOrder, (_currentPage - 1) * _editPageSize, _editPageSize);
	};
	const onPageSizeChanged = () => {
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setEditPageSize(Number(value));
		setCurrentPage(1);
		if (editBroadcastConfigurationRecipients != undefined && editBroadcastConfigurationRecipients.length > 0) {
			paginationLoadList(Number(value), 1, sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / editPageSize) | 0;
	};
	const onSortEdit = (e: any) => {
		if (editBroadcastConfigurationRecipients != undefined && editBroadcastConfigurationRecipients.length > 0) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				getAllRecipientByFilter(sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
				getAllRecipientByFilter();
			}
		}
	};

	const onPaginationClickPreviousEdit = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			paginationLoadList(editPageSize, currentPage - 1, sortColumn, sortOrder);
		}
	};

	const onPaginationClickFirstEdit = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			paginationLoadList(editPageSize, 1, sortColumn, sortOrder);
		}
	};

	const convertToBase64 = (event: any) => {
		const file = event.target.files[0];
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			if (typeof reader.result === 'string') {
				setImageEditData({
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
		const cleanHtmlContentEditBroadcast = DOMPurify.sanitize(_content, {ALLOWED_TAGS: UpsertBroadcastConstants.AllowedHtmlTags});
		setEditConvertedContent(cleanHtmlContentEditBroadcast);
	}, []);
	const handleMessageTypeOptionChange = (data: any) => {
		console.log(data);
		setSelectedEditMessageTypeOption(data);
	};
	const formik = useFormik({
		initialValues,
		onSubmit: async () => {
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
			} else if (new Date(selectedEditBroadcastDate) <= new Date()) {
				swal(
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.broadcastDateValidation,
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
				);
			} else if (imageEditData.imageName != '' && isAllowedAttachment()) {
				swal(
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.attachmentValidation,
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
				);
			} else {
				setIsSubmitting(true);
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
						setIsSubmitting(false);
					}
				});
			}
		},
	});
	const upsertBroadcast = async () => {
		const broadcast: BroadcastConfigurationModel = {
			attachment: imageEditData.base64textString,
			broadcastDate: selectedEditBroadcastDate,
			broadcastId: editBroadcastConfigurationModel ? editBroadcastConfigurationModel?.broadcastId : 0,
			broadcastConfigurationId: editBroadcastConfigurationModel ? editBroadcastConfigurationModel?.broadcastConfigurationId : 0,
			broadcastName: editBroadcastName,
			broadcastStatusId: editBroadcastConfigurationModel ? editBroadcastConfigurationModel?.broadcastStatusId : 0,
			message: htmlDecode(editConvertedContent),
			messageTypeId: +UpsertBroadcastConstants.MessageTypeOptionDefault.value,
			createdDate: new Date(),
			botId: editBroadcastConfigurationModel?.botId ?? 0,
		};
		const addBroadcastRequest: BroadcastConfigurationRequest = {
			broadcastConfiguration: broadcast,
			broadcastConfigurationRecipients: editBroadcastConfigurationRecipients,
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};

		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				if (messagingHub.state !== HubConnected) {
					setIsSubmitting(false);
					return;
				}
				UpsertBroadcastConfiguration(addBroadcastRequest)
					.then((response) => {
						processUpsertBroadcastConfiguration(response, messagingHub, addBroadcastRequest);
					})
					.catch((ex) => {
						swal(
							UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
							UpsertBroadcastConstants.SwalUpsertBroadcastMessage.textFailed,
							UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
						);
						setIsSubmitting(false);
					});
			});
		}, 1000);
	};
	const processUpsertBroadcastConfiguration = (
		response: AxiosResponse<any>,
		messagingHub: HubConnection,
		newBOTDetailAutoReplyRequest: BroadcastConfigurationRequest
	) => {
		if (response.status === successResponse) {
			messagingHub.on(newBOTDetailAutoReplyRequest.queueId.toString(), (message) => {
				setIsSubmitting(false);
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
			setIsSubmitting(false);
		}
	};
	const isValid = () => {
		if (isEmpty(selectedEditBroadcastDate)) return false;
		if (isEmpty(editConvertedContent)) return false;
		if (isEmpty(editBroadcastName)) return false;
		return true;
	};
	const isAllowedHtmlTags = () => {
		const invalidTags = getInvalidHtmlTags(editConvertedContent, UpsertBroadcastConstants.AllowedHtmlTags);
		if (invalidTags.length == 0) {
			return true;
		}
		return false;
	};
	const isAllowedAttachment = () => {
		if (!UpsertBroadcastConstants.AllowedAttachment.test(imageEditData.imageName)) {
			return true;
		}

		return false;
	};
	const onCreateClickEligibilityToggle = () => {
		setRecipientEditToggle(!recipientEditToggle);
	};
	const getAllRecipientByFilter = async (_sortColumn?: string, _sortOrder?: string, _offsetValue?: number, _editPageSize?: number) => {
		let request: GetBroadcastConfigurationByIdRequest = {
			broadcastConfigurationId: Number(id),
			pageSize: editPageSize,
			offsetValue: (currentPage - 1) * editPageSize,
			sortColumn: _sortColumn ?? sortColumn,
			sortOrder: _sortOrder ?? sortOrder,

			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};

		setLoading(true);
		setEditBroadcastConfigurationRecipients([]);
		setTimeout(() => {
			const messagingHubEdit = hubConnection.createHubConnenction();
			messagingHubEdit.start().then(() => {
				if (messagingHubEdit.state !== HubConnected) {
					return;
				}
				processGetBroadcastConfigurationByIdEdit(request, messagingHubEdit);
			});
		}, 1000);
	};
	const processGetBroadcastConfigurationByIdEdit = async (request: GetBroadcastConfigurationByIdRequest, messagingHubEdit: any) => {
		try {
			const responseGetBroadcastConfigurationById = await GetBroadcastConfigurationById(request);

			if (responseGetBroadcastConfigurationById.status === successResponse) {
				messagingHubEdit.on(request.queueId.toString(), async (message: any) => {
					try {
						const returnData = await GetBroadcastConfigurationByIdResult(message.cacheId);

						if (returnData.status !== successResponse) {
							swal(
								UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
								UpsertBroadcastConstants.SwalUpsertBroadcastMessage.getBroadcastError,
								UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
							);
						} else {
							let resultData = returnData.data as GetBroadcastConfigurationByIdResponse;
							console.log(resultData);
							setEditBroadcastConfigurationModel(resultData.broadcastConfiguration);
							setEditBroadcastConfigurationRecipients(resultData.broadcastConfigurationRecipients);
							setEditBroadcastId(resultData.broadcastConfiguration.broadcastConfigurationId);
							setEditBroadcastName(resultData.broadcastConfiguration.broadcastName);
							setEditBroadcastStatus(resultData.broadcastConfiguration.broadcastStatus);
							setBroadcastStatusId(resultData.broadcastConfiguration.broadcastStatusId);

							setSelectedEditBroadcastDate(new Date(mlabFormatDate(resultData.broadcastConfiguration.broadcastDate, 'MM/d/yyyy HH:mm:ss')));
							if (imageEditData.base64textString == '')
								setImageEditData({base64textString: resultData.broadcastConfiguration.attachment, imageName: '', showImage: true});

							if (editConvertedContent == '') {
								setEditConvertedContent(resultData.broadcastConfiguration.message);
							}

							setRecordCount(resultData.recordCount);
						}

						messagingHubEdit.off(request.queueId.toString());
						messagingHubEdit.stop();
						setLoading(false);
					} catch {
						setLoading(false);
						swal(
							UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
							UpsertBroadcastConstants.SwalUpsertBroadcastMessage.getBroadcastError,
							UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
						);
					}
				});
			} else {
				setLoading(false);
				swal(
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.getBroadcastError,
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
				);
			}
		} catch {
			setLoading(false);
			swal(
				UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
				UpsertBroadcastConstants.SwalUpsertBroadcastMessage.getBroadcastError,
				UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
			);
		}
	};
	const getRecipientStatusProgressEdit = async () => {
		let request: GetBroadcastConfigurationRecipientsStatusProgressByIdRequest = {
			broadcastConfigurationId: Number(id),

			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};

		setTimeout(() => {
			const messagingHubEdit = hubConnection.createHubConnenction();
			messagingHubEdit.start().then(() => {
				if (messagingHubEdit.state !== HubConnected) {
					return;
				}
				processGetRecipientStatusProgressEdit(request, messagingHubEdit);
			});
		}, 1000);
	};
	const processGetRecipientStatusProgressEdit = async (
		request: GetBroadcastConfigurationRecipientsStatusProgressByIdRequest,
		messagingHubEdit: any
	) => {
		try {
			const responseGetBroadcastConfigurationRecipientsStatusProgressById = await GetBroadcastConfigurationRecipientsStatusProgressById(request);

			if (responseGetBroadcastConfigurationRecipientsStatusProgressById.status === successResponse) {
				messagingHubEdit.on(request.queueId.toString(), async (message: any) => {
					try {
						const result = await GetBroadcastConfigurationRecipientsStatusProgressByIdResult(message.cacheId);

						if (result.status !== successResponse) {
							swal(
								UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
								UpsertBroadcastConstants.SwalUpsertBroadcastMessage.getBroadcastProgressError,
								UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
							);
						} else {
							let resultData = result.data as GetBroadcastConfigurationRecipientsStatusProgressByIdResponse;
							setTotal(resultData.total);
							setTotalDelivered(resultData.totalDelivered);
							setTotalNotDelivered(resultData.totalNotDelivered);
							setTotalPending(resultData.totalPending);
							setBroadcastStatusId(resultData.broadcastStatusId);
							setEditBroadcastStatus(resultData.broadcastStatus);
							if (resultData.totalPending == 0) clearInterval(interval);
						}

						messagingHubEdit.off(request.queueId.toString());
						messagingHubEdit.stop();
						setLoading(false);
					} catch {
						setLoading(false);
						swal(
							UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
							UpsertBroadcastConstants.SwalUpsertBroadcastMessage.getBroadcastProgressError,
							UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
						);
					}
				});
			} else {
				setLoading(false);
				swal(
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.getBroadcastProgressError,
					UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
				);
			}
		} catch {
			setLoading(false);
			swal(
				UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
				UpsertBroadcastConstants.SwalUpsertBroadcastMessage.getBroadcastProgressError,
				UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
			);
		}
	};
	const onChangeBroadcastDateEdit = (val: any) => {
		setSelectedEditBroadcastDate(val);
	};
	const onCancelEditClick = () => {
		swal({
			title: UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleConfirmation,
			text: UpsertBroadcastConstants.SwalUpsertBroadcastMessage.cancelConfirmation, //'',
			icon: UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconWarning,
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				window.close();
			}
		});
	};
	const onCancelBroadcastEditClick = () => {
		swal({
			title: UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleConfirmation,
			text: UpsertBroadcastConstants.SwalUpsertBroadcastMessage.cancelBroadcast, //'',
			icon: UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconWarning,
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then(async (willUpdate) => {
			if (willUpdate) {
				const isSuccess = await cancelBroadcast(+id, userAccessId);
				if (isSuccess) {
					setBroadcastStatusId(UpsertBroadcastConstants.BroadcastStatusInCanceledId);
				} else {
					swal(
						UpsertBroadcastConstants.SwalUpsertBroadcastMessage.titleFailed,
						UpsertBroadcastConstants.SwalUpsertBroadcastMessage.cancelBroadcastError,
						UpsertBroadcastConstants.SwalUpsertBroadcastMessage.iconError
					);
				}
			}
		});
	};
	const cancelBroadcast = async (broadcastConfigurationId: number, userId: number) => {
		let isSuccess = true;
		await CancelBroadcast(broadcastConfigurationId, userId).then((response) => {
			if (response.status === successResponse) {
				isSuccess = response.data;
			} else isSuccess = false;
		});
		return isSuccess;
	};
	const cancelButton = (
		<>
			{isEnableCancelBroadcast && (
				<MlabButton
					access={userAccess.includes(USER_CLAIMS.UpdateTelegramBotWrite)}
					size='sm'
					label='Cancel Broadcast'
					style={ElementStyle.danger}
					type='button'
					weight='solid'
					disabled={false}
					onClick={onCancelBroadcastEditClick}
				/>
			)}
		</>
	);
	const onShowModal = () => {
		setShowForm(true);
	};

	const toolbarOptions = [['bold', 'italic', 'underline', 'strike'], ['blockquote'], ['emoji']];

	return (
		<MainContainer>
			<FormHeader headerLabel={UpsertBroadcastConstants.HeaderEdit} additionalElements={cancelButton} additionalElementPlacement={'left'} />
			<ContentContainer>
				<FormContainer onSubmit={formik.handleSubmit}>
					<MainContainer>
						<FormGroupContainer>
							<div className='row' style={{zIndex: 2}}>
								<div className='col-lg-2 mt-1'>
									<RequiredLabel title={'Broadcast Name'} />
									<input type='textbox' className='form-control form-control-sm' aria-label='Trigger' value={editBroadcastName} disabled={true} />
								</div>
								<div className='col-lg-2 mt-1'>
									<RequiredLabel title={'Broadcast ID'} />
									<input type='textbox' className='form-control form-control-sm' aria-label='Trigger' value={editBroadcastId} disabled={true} />
								</div>
								<div className='col-lg-2 mt-1'>
									<RequiredLabel title={'Broadcast Status'} />
									<input type='textbox' className='form-control form-control-sm' aria-label='Trigger' value={editBroadcastStatus} disabled={true} />
								</div>
								<div className='col-lg-2 mt-1'>
									<RequiredLabel title={'Broadcast Date'} />
									<DatePicker
										dateFormat='yyyy-MM-dd HH:mm:ss'
										selected={selectedEditBroadcastDate}
										onChange={onChangeBroadcastDateEdit}
										className='form-control form-control-sm'
										timeFormat='HH:mm'
										placeholderText='Broadcast Date'
										disabled={!isEnableCancelBroadcast || !isFieldEditable}
										minDate={moment().toDate()}
										timeIntervals={1}
										showTimeSelect
									/>
								</div>
								<div className='col-lg-2 mt-1'>
									<BasicFieldLabel title={'Message Type'} />
									<Select
										style={{width: '100%'}}
										options={messageTypeOptions}
										onChange={handleMessageTypeOptionChange}
										value={selectedEditMessageTypeOption}
										isDisabled={true}
									/>
								</div>
							</div>
							<div className='row'>
								<div className='col-lg-12 mt-1'>
									<BasicFieldLabel title={'Attachment'} />
									{isEnableCancelBroadcast && isFieldEditable && <input type='file' onChange={convertToBase64} accept='image/*' />}
									<br />
									<img src={imageEditData.base64textString} alt={imageEditData.imageName} width='10%' />
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
									<br />
									<div className='mt-5'>
										<MLabQuillEditor
											isUploadToMlabStorage={false}
											uploadToMlabStorage={undefined}
											isReadOnly={!isEnableCancelBroadcast || !isFieldEditable}
											quillValue={editConvertedContent}
											setQuillValue={(content: string) => {
												handleMessageEditorChange(content);
											}}
											hasImageToEditor={false}
											toolbarPropsOptions={toolbarOptions}
											formatProps={['bold', 'italic', 'underline', 'strike', 'blockquote', 'emoji']}
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
										icon={recipientEditToggle ? faMinusSquare : faPlusSquare}
										onClick={onCreateClickEligibilityToggle}
									/>
								</div>
							</div>
							<div className='row pb-15' style={recipientEditToggle ? {} : editStyleHideDetails}>
								<div className='row pb-15'>
									<div className='col-lg-1 mt-1'>
										<BasicFieldLabel title={'Total Recipient'} />
										<h6>{total}</h6>
									</div>
									<div className='col-lg-1 mt-1'>
										<BasicFieldLabel title={'Total Pending'} />
										<h6>{totalPending}</h6>
									</div>
									<div className='col-lg-1 mt-1'>
										<BasicFieldLabel title={'Total Delivered'} />
										<h6>{totalDelivered}</h6>
									</div>
									<div className='col-lg-2 mt-1'>
										<BasicFieldLabel title={'Total Not Delivered'} />
										<h6>{totalNotDelivered}</h6>
									</div>
								</div>

								<GridWithLoaderAndPagination
									gridRef={gridRef}
									rowData={editBroadcastConfigurationRecipients}
									columnDefs={editColumnDefs}
									sortColumn={sortColumn}
									sortOrder={sortOrder}
									isLoading={loading}
									height={500}
									onSortChanged={(e: any) => onSortEdit(e)}
									//pagination details
									recordCount={recordCount}
									currentPage={currentPage}
									pageSize={editPageSize}
									onClickFirst={onPaginationClickFirstEdit}
									onClickPrevious={onPaginationClickPreviousEdit}
									onClickNext={onClickNext}
									onClickLast={onClickLast}
									onPageSizeChanged={onPageSizeChanged}
								></GridWithLoaderAndPagination>
								<AllowedHtmlTagsModal showForm={showForm} closeModal={() => setShowForm(false)} />
							</div>
						</FormGroupContainer>
						<FormGroupContainer>
							<div className='row'>
								<div className='col-lg-12 mt-1'>
									<LoaderButton
										access={true}
										loading={isSubmitting}
										title={'Submit'}
										loadingTitle={' Please wait...'}
										disabled={formik.isSubmitting || isSubmitting || !isEnableCancelBroadcast || !isFieldEditable}
									/>
									<button type='button' className='btn btn-secondary btn-sm me-2' onClick={onCancelEditClick}>
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
export default EditBroadcast;
