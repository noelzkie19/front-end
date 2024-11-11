import {AgGridReact} from 'ag-grid-react';
import {Guid} from 'guid-typescript';
import {useEffect, useState} from 'react';
import {Col, Row} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {ElementStyle, PROMPT_MESSAGES} from '../../../../constants/Constants';
import {
	BasicFieldLabel,
	ButtonsContainer,
	ContentContainer,
	DefaultButton,
	DefaultSecondaryButton,
	DefaultTableButton,
	FooterContainer,
	FormGroupContainer,
	FormHeader,
	MainContainer,
	MlabButton,
	PaddedContainer,
} from '../../../../custom-components';
import ReorderListModal from '../../../../custom-components/modals/ReorderListModal';
import {useFormattedDate} from '../../../../custom-functions';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {
	AddFeedbackAnswerRequestModel,
	CodeListModel,
	FeedbackAnswerFilterModel,
	FeedbackAnswerModel,
	FeedbackCategoryFilterModel,
	FeedbackCategoryModel,
	OptionsSelectedModel,
} from '../../models';
import * as systemManagement from '../../redux/SystemRedux';
import {
	addFeedbackAnswerList,
	getFeedbackAnswerList,
	getFeedbackAnswerListResult,
	getFeedbackCategoryList,
	getFeedbackCategoryListResult,
} from '../../redux/SystemService';
import {STATUS_OPTIONS} from '../constants/SelectOptions';
import AddEditFeedbackAnswerModal from './modals/AddEditFeedbackAnswerModal';
import useConstant from '../../../../constants/useConstant';
import { useSystemOptionHooks } from '../../shared';
import useSystemHooks from '../../../../custom-functions/system/useSystemHooks';
import { HubConnection } from '@microsoft/signalr';
import { AxiosResponse } from 'axios';
import { ColDef, ColGroupDef } from 'ag-grid-community';


const EditFeedbackAnswer: React.FC = () => {
	// STATES
	const {id}: {id: string} = useParams();

	const feedbackId: number = 8;
	const history = useHistory();
	const dispatch = useDispatch();
	const {successResponse, HubConnected, SwalSuccessMessage, SwalServerErrorMessage, SwalFailedMessage, SwalFeedbackMessage, SwalConfirmMessage} =
		useConstant();
	const {getFeedbackCategoryListInfo} = useSystemHooks();
	const { getSystemCodelist, codeListInfo	} = useSystemOptionHooks();

	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [feedbackAnswerInfo, setFeedbackAnswerInfo] = useState<FeedbackAnswerModel | undefined>();
	const [feedbackAnswerList, setFeedbackAnswerList] = useState<Array<FeedbackAnswerModel>>([]);
	const [feedbackAnswerStatus, setFeedbackAnswerStatus] = useState<string>('');
	const [feedbackAnswerNameFilter, setFeedbackAnswerNameFilter] = useState<string>('');
	const [feedbackAnswerStatusFilter, setFeedbackAnswerStatusFilter] = useState<any>('');
	const [feedbackAnswerCategoryIdFilter, setFeedbackAnswerCategoryIdFilter] = useState<any>([{label: '', value: id}]);
	const [feedbackAnswerCodeListInfo, setFeedbackAnswerCodeListInfo] = useState<CodeListModel>();
	const [addCount, setAddCount] = useState(0);
	const [reorderFlag, setReorderFlag] = useState(false);
	const [categoryOption, setCategoryOption] = useState<Array<OptionsSelectedModel>>([]);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const [editMode, setEditMode] = useState(false);
	const [addModal, setAddModal] = useState(false);
	const [reorderModal, setReorderModal] = useState(false);

	const feedbackAnswerListState = useSelector<RootState>(({system}) => system.feedbackAnswerList, shallowEqual) as FeedbackAnswerModel[];
	// EFFECTS
	useEffect(() => {
		getSystemCodelist(feedbackId);
		_getCategoryListOption();
		_feedbackCategoryList();
	}, []);

	useEffect(() => {
		setFeedbackAnswerList(feedbackAnswerListState);
		if (feedbackAnswerListState) {
			setAddCount(feedbackAnswerListState.filter((i) => i.feedbackAnswerId === 0).length);
		}
	}, [feedbackAnswerListState]);

	useEffect(() =>{
		if(codeListInfo){
			setFeedbackAnswerCodeListInfo(codeListInfo);
			setFeedbackAnswerStatus(codeListInfo.isActive.toString());
		}
	}, [codeListInfo]);

	// -- GET FEEDBACK CATEGORY TO BE USED ON DROPDOWN -- //
	const _feedbackCategoryList = (callback?: any) => {
		const searchRequest: FeedbackCategoryFilterModel = {
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
			feedbackCategoryName: null,
			feedbackCategoryStatus: null,
			feedbackTypeIds: null,
		};

		getFeedbackCategoryListInfo(searchRequest, callback);
	};

	// -- CLEAR DISPATCHED STORAGE -- //
	const _clearStorage = () => {
		dispatch(systemManagement.actions.getFeedbackAnswerList([]));
	};

	// -- GET CATEGORY LIST DROPDOWN -- //
	const _getCategoryListOption = () => {
		const messagingHub = hubConnection.createHubConnenction();
		messagingHub.start().then(() => {
			const searchRequest: FeedbackCategoryFilterModel = {
				userId: userAccessId.toString(),
				queueId: Guid.create().toString(),
				feedbackCategoryName: null,
				feedbackCategoryStatus: null,
				feedbackTypeIds: null,
			};

			getFeedbackCategoryList(searchRequest).then((response) => {
				if (response.status === successResponse) {
					messagingHub.on(searchRequest.queueId.toString(), (message) => {
						getFeedbackCategoryListResult(message.cacheId)
							.then((returnData) => {
								let feedbackData = Object.assign(new Array<FeedbackCategoryModel>(), returnData.data);

								let TempList = Array<OptionsSelectedModel>();
								feedbackData.forEach((item) => {
									const Options: OptionsSelectedModel = {
										value: item.feedbackCategoryId.toString(),
										label: item.feedbackCategoryName,
									};
									TempList.push(Options);
								});

								setCategoryOption(TempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));

								if (id !== '') {
									setFeedbackAnswerCategoryIdFilter(
										TempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value && t.value === id) === i)
									);
								}

								loadFeedbackAnswerList();

								messagingHub.off(searchRequest.queueId.toString());
							})
							.catch(() => {
								swal(SwalFailedMessage.title, SwalFeedbackMessage.textErrorFeedbackList('feedback category'), SwalFailedMessage.icon);
							});
					});
				} else {
					swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
				}
			});
		});
	};

	async function _createLoadFeedbackAnswerListRequest() {
		let feedbackAnswerCategory = Object.assign(Array<OptionsSelectedModel>(), feedbackAnswerCategoryIdFilter)
			.map((el: any) => el.value)
			.join(',');
		let feedbackAnswerStatuses = Object.assign(Array<OptionsSelectedModel>(), feedbackAnswerStatusFilter)
			.map((el: any) => el.value)
			.join(',');

		let finalStatuses: string | null = null;

		if (feedbackAnswerStatuses === '0') {
			finalStatuses = '0';
		} else if (feedbackAnswerStatuses === '1') {
			finalStatuses = '1';
		}

		const searchRequest: FeedbackAnswerFilterModel = {
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
			feedbackAnswerName: feedbackAnswerNameFilter === '' ? null : feedbackAnswerNameFilter,
			feedbackCategoryIds: feedbackAnswerCategory === '' ? null : feedbackAnswerCategory,
			feedbackAnswerStatuses: finalStatuses,
		};

		return searchRequest;
	}

	const loadFeedbackAnswerList = (callback?: any) => {
		const messagingHub = hubConnection.createHubConnenction();
		messagingHub.start().then( async () => {
			const searchRequest = await _createLoadFeedbackAnswerListRequest()
			getFeedbackAnswerList(searchRequest).then((response) => {
				if (response.status === successResponse) {
					messagingHub.on(searchRequest.queueId.toString(), (message) => {
						getFeedbackAnswerListResult(message.cacheId)
							.then((returnData) => {
								let feedbackData = Object.assign(new Array<FeedbackAnswerModel>(), returnData.data);
								dispatch(systemManagement.actions.getFeedbackAnswerList(feedbackData));
								messagingHub.off(searchRequest.queueId.toString());
								if (callback) {
									callback();
								}
							})
							.catch(() => {
								swal(SwalFailedMessage.title, SwalFeedbackMessage.textErrorFeedbackList('feedback answer'), SwalFailedMessage.icon);
							});
						messagingHub.off(searchRequest.queueId.toString());
						messagingHub.stop();
					});
					setTimeout(() => {
						if (messagingHub.state === HubConnected) {
							messagingHub.stop();
						}
					}, 30000);
				} else {
					swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
				}
			});
		});
	};

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	const handleFeedbackAnswerStatusOnChange = (event: any) => {
		setFeedbackAnswerStatus(event.target.value);
	};

	const handleFeedbackAnswerNameFilterOnChange = (event: any) => {
		setFeedbackAnswerNameFilter(event.target.value);
	};

	const handleFeedbackAnswerStatusFilterOnChange = (event: any) => {
		setFeedbackAnswerStatusFilter(event);
	};

	const handleFeedbackAnswerTypeIdFilterOnChange = (event: any) => {
		setFeedbackAnswerCategoryIdFilter(event);
	};

	const handleSearchEditFeedAnswer = () => {
		loadFeedbackAnswerList();
	};

	const handleAddNew = () => {
		if (reorderFlag) {
			swal({
				title: PROMPT_MESSAGES.ConfirmCloseTitle,
				text: PROMPT_MESSAGES.ConfirmCloseMessage,
				icon: SwalConfirmMessage.icon,
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			}).then((willRedirect) => {
				if (willRedirect) {
					setFeedbackAnswerCategoryIdFilter('');
					loadFeedbackAnswerList();
					setEditMode(false);
					toggleAddModal();
				}
			});
		} else {
			setEditMode(false);
			toggleAddModal();
		}
	};

	const handleChangeOrderEditFeedbackAnwer = () => {
		if (addCount > 0) {
			swal({
				title: PROMPT_MESSAGES.ConfirmCloseTitle,
				text: PROMPT_MESSAGES.ConfirmCloseMessage,
				icon: SwalConfirmMessage.icon,
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			}).then((willRedirect) => {
				if (willRedirect) {
					setReorderFlag(true);
					setFeedbackAnswerCategoryIdFilter('');
					loadFeedbackAnswerList(toggleReorderModal);
				}
			});
		} else {
			setReorderFlag(true);
			toggleReorderModal();
		}
	};

	const toggleAddModal = () => {
		setAddModal(!addModal);
	};

	const toggleReorderModal = () => {
		setReorderModal(!reorderModal);
	};

	const saveFeedbackAnswer = (val: FeedbackAnswerModel) => {
		if (editMode) {
			const oldList = feedbackAnswerListState.filter((i) => i.feedbackAnswerName !== val.feedbackAnswerName);
			dispatch(systemManagement.actions.getFeedbackAnswerList([...oldList, val]));
		} else {
			val.feedbackAnswerId = 0;
			val.position = feedbackAnswerListState.length + 1;
			setFeedbackAnswerList([...feedbackAnswerListState, val]);
			dispatch(systemManagement.actions.getFeedbackAnswerList([...feedbackAnswerListState, val]));
		}
		toggleAddModal();
	};

	const saveReorder = (val: Array<FeedbackAnswerModel>) => {
		dispatch(systemManagement.actions.getFeedbackAnswerList(val));
	};

	const handleDeactivate = (data: any) => {
		const item = feedbackAnswerListState.find((i) => i.feedbackAnswerName === data.feedbackAnswerName);
		if (item !== undefined) {
			item.feedbackAnswerStatus = !item.feedbackAnswerStatus;
			const newList = feedbackAnswerListState?.map((cat: FeedbackAnswerModel) => {
				if (item.feedbackAnswerName !== cat.feedbackAnswerName) {
					return cat;
				}
				return {...cat, item};
			});
			dispatch(systemManagement.actions.getFeedbackAnswerList(newList));
		}
	};

	const handleEdit = (data: any) => {
		setEditMode(true);
		const feedbackAnswerItem = feedbackAnswerListState.find((i) => i.feedbackAnswerName === data.feedbackAnswerName);
		if (feedbackAnswerItem !== undefined) {
			setFeedbackAnswerInfo(feedbackAnswerItem);
			toggleAddModal();
		} else {
			swal(SwalFailedMessage.title, SwalFeedbackMessage.textErrorNotFound('Feedback answer'), SwalFailedMessage.icon);
		}
	};

	const confirmSubmitForm = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmSubmitTitle,
			text: PROMPT_MESSAGES.ConfirmSubmitMessageEdit,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		})
			.then((willSubmit) => {
				if (willSubmit) {
					submitFeedbackAnswerForm();
				}
			})
			.catch(() => {});
	};

	const _timeoutHandler = (messagingHub: any) => {
		setTimeout(() => {
			if (messagingHub.state === HubConnected) {
				messagingHub.stop();
			}
		}, 30000)
	}

	const processAddFeedbackAnswerListReturn = (messagingHub: HubConnection, response: AxiosResponse<any>, formItem: AddFeedbackAnswerRequestModel) => {
		if (response.status === successResponse) {
			messagingHub.on(formItem.queueId.toString(), (message) => {
				let resultData = JSON.parse(message.remarks);
				if (resultData.Status === successResponse) {
					swal(SwalSuccessMessage.title, SwalSuccessMessage.textSuccess, SwalSuccessMessage.icon)
					setFeedbackAnswerList([]);
					dispatch(systemManagement.actions.getFeedbackAnswerList([]));
					loadFeedbackAnswerList();
					setIsSubmitting(false);
				} else {
					swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon).catch(() => { });
					setIsSubmitting(false);
				}
				messagingHub.off(formItem.queueId.toString());
				messagingHub.stop();
			});
			_timeoutHandler(messagingHub);
		} else {
			messagingHub.stop();
			swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
			setIsSubmitting(false);
		}
	}

	const submitFeedbackAnswerForm = () => {
		setIsSubmitting(true);
		const formItem: AddFeedbackAnswerRequestModel = {
			codeListId: feedbackId,
			codeListStatus: feedbackAnswerStatus,
			feedbackAnswers: feedbackAnswerList,
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};
		const messagingHub = hubConnection.createHubConnenction();
		messagingHub
			.start()
			.then(() => {
				if (messagingHub.state === HubConnected) {
					addFeedbackAnswerList(formItem)
						.then((response) => {
							processAddFeedbackAnswerListReturn(messagingHub, response, formItem)
						})
						.catch(() => {
							messagingHub.stop();
							setIsSubmitting(false);
							swal(SwalFailedMessage.title, SwalFeedbackMessage.textErrorFeedbackList('feedback answer'), SwalFailedMessage.icon);
						});
				} else {
					swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
					setIsSubmitting(false);
				}
			})
			.catch(() => {});
	};

	const EditFeedbackGoBackAction = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmCloseMessage,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		})
			.then((confirmEditFeedbackGoBackAction) => {
				if (confirmEditFeedbackGoBackAction) {
					if (id === undefined || id === '') {
						history.push('/system/code-list');
						_clearStorage();
					} else {
						history.push(`/system/feedback-category-list/`);
						_clearStorage();
					}
				}
			})
			.catch(() => { });
	};

	const feedbackAnswerListAction = (params: any) =>
		<>
			<DefaultTableButton
				// className={'btn btn-outline-dark btn-sm px-4 btn-mlab-custom'}
				access={userAccess.includes(USER_CLAIMS.FeedbackAnswerWrite)}
				title={params.data.feedbackAnswerStatus === true || params.data.feedbackAnswerStatus === 'true' ? 'Deactivate' : 'Activate'}
				onClick={() => handleDeactivate(params.data)}
			/>{' '}
			<DefaultTableButton
				access={userAccess.includes(USER_CLAIMS.FeedbackAnswerWrite)}
				title={'Edit'}
				onClick={() => handleEdit(params.data)}
			/>
		</>

	const feedbackAnswerListOrder =  (params: any) => {
		const rowIndex = params.node?.rowIndex ?? -1; // Default to -1 if undefined
		return rowIndex >= 0 ? rowIndex + 1 : null; // Return ID if rowIndex is valid
	};
	
	const lowerCaseFeedbackAnswerName = (valueA: string, valueB: string) => {
        return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
    };
	
	const columnDefs : (ColDef<FeedbackAnswerModel> | ColGroupDef<FeedbackAnswerModel>)[] = 
	[
		{
			maxWidth: 100,
			headerName: 'Order',
			field:  'position',
			sort: 'asc' as 'asc', 
		},
		{
			headerName: 'Feedback Answer Name',
			field:  'feedbackAnswerName',
			comparator: lowerCaseFeedbackAnswerName,
		},
		{
			headerName: 'Feedback Answer Status',
			field:  'feedbackAnswerStatus',
			cellRenderer: (params: any) => (params.data.feedbackAnswerStatus ? 'Active' : 'Inactive'),
		},
		{
			headerName: 'Included to Feedback Category',
			field:  'feedbackCategoryName',
			cellRenderer: (params: any) =>
				params.data.feedbackAnswerCategories.map((i: any) => i.feedbackCategoryName).join(', '),
		},
		{
			headerName: 'Action',
			cellRenderer: feedbackAnswerListAction,
		},
	];

	return (
		<>
			<MainContainer>
				<FormHeader headerLabel={'Edit Feedback Answer'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-2'>
							<label htmlFor='codelist-fa-name'>Code List Name</label>
							<p id='codelist-fa-name' className='form-control-plaintext fw-bolder'>{feedbackAnswerCodeListInfo?.codeListName}</p>
						</div>
						<div className='col-lg-2'>
							<label htmlFor='codelist-fa-type'>Code List Type</label>
							<p id='codelist-fa-type' className='form-control-plaintext fw-bolder'>{feedbackAnswerCodeListInfo?.codeListTypeName}</p>
						</div>
						<div className='col-lg-2'>
							<label htmlFor='parent-fa-codelist'>Parent</label>
							<p id='parent-fa-codelist' className='form-control-plaintext fw-bolder'>{feedbackAnswerCodeListInfo?.parentCodeListName}</p>
						</div>
						<div className='col-lg-2'>
							<label htmlFor='fa-field-type'>Field Type</label>
							<p id='fa-field-type' className='form-control-plaintext fw-bolder'>{feedbackAnswerCodeListInfo?.fieldTypeName}</p>
						</div>
						<div className='col-lg-2'>
							<label htmlFor='codelist-fa-status'>Code List Status</label>
							<select
								id='codelist-fa-status'
								className='form-select form-select-sm'
								aria-label='Select status'
								value={feedbackAnswerStatus}
								onChange={handleFeedbackAnswerStatusOnChange}
							>
								{STATUS_OPTIONS.map((item, index) => (
									<option key={item.value.toString()} value={item.value.toString()}>
										{item.label}
									</option>
								))}
							</select>
						</div>
					</FormGroupContainer>
					<FormGroupContainer>
						<div className='col-lg-2'>
							<label htmlFor='fa-created-date'>Created Date</label>
							<p id='fa-created-date' className='form-control-plaintext fw-bolder'>{useFormattedDate(feedbackAnswerCodeListInfo?.createdDate ? feedbackAnswerCodeListInfo.createdDate : '')}</p>
						</div>
						<div className='col-lg-2'>
							<label htmlFor='fa-created-by'>Created By</label>
							<p id='fa-created-by' className='form-control-plaintext fw-bolder'>{feedbackAnswerCodeListInfo ? feedbackAnswerCodeListInfo?.createdByName : ''}</p>
						</div>
						<div className='col-lg-2'>
							<label htmlFor='fa-last-modified-date'>Last Modified Date</label>
							<p id='fa-last-modified-date' className='form-control-plaintext fw-bolder'>{useFormattedDate(feedbackAnswerCodeListInfo?.updatedDate ? feedbackAnswerCodeListInfo?.updatedDate : '')}</p>
						</div>
						<div className='col-lg-2'>
							<label htmlFor='fa-modified-by'>Modified By</label>
							<p id='fa-modified-by' className='form-control-plaintext fw-bolder'>{feedbackAnswerCodeListInfo ? feedbackAnswerCodeListInfo?.updatedByName : ''}</p>
						</div>
					</FormGroupContainer>
					<div className='separator border-4 my-8' />
					<FormGroupContainer>
						<Row>
							<Col sm={4}>
								<BasicFieldLabel title='Feedback Answer Name' />
								<input
									type='text'
									className='form-control form-control-sm '
									// placeholder='Answer Name'
									value={feedbackAnswerNameFilter}
									onChange={handleFeedbackAnswerNameFilterOnChange}
								/>
							</Col>
							<Col sm={3}>
								<BasicFieldLabel title='Feedback Answer Status' />
								<Select
									isMulti
									aria-label='Select status'
									value={feedbackAnswerStatusFilter}
									onChange={handleFeedbackAnswerStatusFilterOnChange}
									options={[
										{value: '1', label: 'Active'},
										{value: '0', label: 'Inactive'},
									]}
								/>
							</Col>
							<Col sm={5}>
								<BasicFieldLabel title='Included to Feedback Category' />
								<Select
									isMulti
									options={categoryOption}
									aria-label='Select status'
									value={feedbackAnswerCategoryIdFilter}
									onChange={handleFeedbackAnswerTypeIdFilterOnChange}
								/>
							</Col>
						</Row>
					</FormGroupContainer>

					<FormGroupContainer>
						<ButtonsContainer>
							<DefaultButton access={userAccess.includes(USER_CLAIMS.FeedbackAnswerRead)} title={'Search'} onClick={handleSearchEditFeedAnswer} />
							<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.FeedbackAnswerWrite)} title={'Add New'} onClick={handleAddNew} />
							<DefaultSecondaryButton
								access={userAccess.includes(USER_CLAIMS.FeedbackAnswerWrite)}
								title={'Change Order'}
								onClick={handleChangeOrderEditFeedbackAnwer}
							/>
						</ButtonsContainer>
					</FormGroupContainer>
					<FormGroupContainer>
						<div className='ag-theme-quartz' style={{height: 400, width: '100%'}}>
							<AgGridReact
								rowData={feedbackAnswerListState}
								defaultColDef={{
									sortable: true,
									resizable: true,
								}}
								columnDefs={columnDefs}
								animateRows={true}
								onGridReady={onGridReady}
								rowBuffer={0}
								//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
								pagination={true}
								paginationPageSizeSelector={false}
								paginationPageSize={10}
							>
							</AgGridReact>
						</div>
					</FormGroupContainer>
				</ContentContainer>
				<FooterContainer>
					<PaddedContainer>
						<MlabButton
							access={userAccess.includes(USER_CLAIMS.FeedbackAnswerWrite)}
							size={'sm'}
							label={'Submit'}
							style={ElementStyle.primary}
							type={'button'}
							weight={'solid'}
							loading={isSubmitting}
							disabled={isSubmitting}
							loadingTitle={' Please wait...'}
							onClick={confirmSubmitForm}
						/>
						<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.FeedbackAnswerRead)} title={'Back'} onClick={EditFeedbackGoBackAction} />
					</PaddedContainer>
				</FooterContainer>
			</MainContainer>
			<AddEditFeedbackAnswerModal
				editMode={editMode}
				modal={addModal}
				toggle={toggleAddModal}
				feedbackAnswer={feedbackAnswerInfo}
				saveFeedbackAnswer={saveFeedbackAnswer}
			/>
			<ReorderListModal
				modalName='Change Order Feedback Answer'
				modal={reorderModal}
				toggle={toggleReorderModal}
				orderList={feedbackAnswerListState}
				columnList={[
					{
						title: 'Order',
						field: 'position',
						cellRenderer: feedbackAnswerListOrder,
					},
					{
						title: 'Feedback Answer Name',
						field: 'feedbackAnswerName',
					},
					{
						title: 'Feedback Answer Status',
						field: 'feedbackAnswerName',
					},
					{
						title: 'Included to Feedback Category',
						field: 'feedbackCategoryName',
					},
				]}
				saveReorder={saveReorder}
			/>
		</>
	);
};

export default EditFeedbackAnswer;