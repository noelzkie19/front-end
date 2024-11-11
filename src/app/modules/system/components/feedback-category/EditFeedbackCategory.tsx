import {AgGridReact} from 'ag-grid-react';
import {Guid} from 'guid-typescript';
import {useEffect, useState} from 'react';
import {Col, Row} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {OptionListModel} from '../../../../common/model';
import {PROMPT_MESSAGES} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
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
	PaddedContainer,
} from '../../../../custom-components';
import ReorderListModal from '../../../../custom-components/modals/ReorderListModal';
import {useFormattedDate} from '../../../../custom-functions';
import useSystemHooks from '../../../../custom-functions/system/useSystemHooks';
import {disableSplashScreen} from '../../../../utils/helper';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {
	AddFeedbackCategoryRequestModel,
	CodeListModel,
	FeedbackCategoryFilterModel,
	FeedbackCategoryModel,
	FeedbackCategoryTypeModel,
	FeedbackTypeFilterModel,
	FeedbackTypeModel,
	OptionsSelectedModel,
} from '../../models';
import * as systemManagement from '../../redux/SystemRedux';
import {
	addFeedbackCategoryList,
	getFeedbackTypeList,
	getFeedbackTypeListResult,
} from '../../redux/SystemService';
import {useSystemOptionHooks} from '../../shared/hooks/useSystemOptionHooks';
import {STATUS_OPTIONS} from '../constants/SelectOptions';
import AddEditFeedbackCategoryModal from './modals/AddEditFeedbackCategoryModal';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import CellRender from '../../../../custom-components/datagrid/CellRender';


const EditFeedbackCategory: React.FC = () => {
	// States
	let paramId: string = '';
	const pathArray = window.location.pathname.split('/');
	if (pathArray.length >= 4) {
		paramId = pathArray[3];
	}
	const feedbackId: number = 7;
	const history = useHistory();
	const dispatch = useDispatch();
	const { getSystemCodelist, codeListInfo	} = useSystemOptionHooks();

	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const [feedbackCategoryInfo, setFeedbackCategoryInfo] = useState<FeedbackCategoryModel | undefined>();
	const [feedbackCategoryList, setFeedbackCategoryList] = useState<Array<FeedbackCategoryModel>>();
	const [feedbackCategoryStatus, setFeedbackCategoryStatus] = useState('');
	const [feedbackCategoryNameFilter, setFeedbackCategoryNameFilter] = useState<string>('');
	const [feedbackCategoryStatusFilter, setFeedbackCategoryStatusFilter] = useState<any>('');
	const [feedbackCategoryTypeIdFilter, setFeedbackCategoryTypeIdFilter] = useState<any>([{label: '', value: paramId}]);
	const [feedbackCategoryCodeListInfo, setFeedbackCategoryCodeListInfo] = useState<CodeListModel>();
	const [feedbackTypeOptionList, setFeedbackTypeOptionList] = useState<Array<OptionListModel>>([]);

	const [addCount, setAddCount] = useState(0);
	const [reorderFlag, setReorderFlag] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [addModal, setAddModal] = useState(false);
	const [reorderModal, setReorderModal] = useState(false);
	const feedbackCategoryListState = useSelector<RootState>(({system}) => system.feedbackCategoryList, shallowEqual) as FeedbackCategoryModel[];

	// Cosntant
	const {successResponse, HubConnected, SwalConfirmMessage} = useConstant();
	const {getFeedbackCategoryListInfo} = useSystemHooks();

	// Mount
	useEffect(() => {
		getSystemCodelist(feedbackId);
		getFeedbackTypeInfo();
		loadFeedbackCategoryList();
	}, []);

	useEffect(() => {
		setFeedbackCategoryList(feedbackCategoryListState);
		if (feedbackCategoryListState) {
			//fix intermittent issue on filter if feedbackCategoryListState doesnt have values
			setAddCount(feedbackCategoryListState.filter((i) => i.feedbackCategoryId === 0).length);
		}
	}, [feedbackCategoryListState]);

	useEffect(() =>{
		if(codeListInfo){
			setFeedbackCategoryCodeListInfo(codeListInfo);
			setFeedbackCategoryStatus(codeListInfo.isActive.toString());
		}
	},[codeListInfo])

	//Methods
	const getFeedbackTypeInfo = () => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				const typeSearchRequest: FeedbackTypeFilterModel = {
					userId: userAccessId.toString(),
					queueId: Guid.create().toString(),
					feedbackTypeName: null,
					feedbackTypeStatus: null,
				};
				getFeedbackTypeList(typeSearchRequest).then((response) => {
					if (response.status === successResponse) {
						messagingHub.on(typeSearchRequest.queueId.toString(), (message) => {
							getFeedbackTypeListResult(message.cacheId)
								.then((returnData) => {
									let feedbackData = Object.assign(new Array<FeedbackTypeModel>(), returnData.data);
									_feedbacktypeOption(feedbackData);
									dispatch(systemManagement.actions.getFeedbackTypeList(feedbackData));
									disableSplashScreen();
									messagingHub.off(typeSearchRequest.queueId.toString());
									messagingHub.stop();
								})
								.catch(() => {
									swal('Failed', 'getCodeListResult', 'error');
									disableSplashScreen();
								});
						});
					} else {
						swal('Failed', response.data.message, 'error');
						disableSplashScreen();
					}
				});
			});
		}, 1000);
	};

	const _timeoutHandler = (hub: any) => {
		setTimeout(() => {
			if (hub.state === HubConnected) {
				hub.stop();
			}
		}, 30000);
	};

	const _feedbacktypeOption = (data: any) => {
		let tempList = Array<OptionListModel>();
		data.forEach((item: any) => {
			const OptionValue: OptionListModel = {
				value: item.feedbackTypeId,
				label: item.feedbackTypeName,
			};
			tempList.push(OptionValue);
		});

		setFeedbackTypeOptionList(tempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
		if (paramId !== '' || paramId !== null || paramId !== undefined) {
			setFeedbackCategoryTypeIdFilter(tempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value && t.value === paramId) === i));
		}
	};

	const loadFeedbackCategoryList = (callback?: any) => {
		let feedbackCategoryTypeIds = Object.assign(Array<OptionsSelectedModel>(), feedbackCategoryTypeIdFilter)
			.map((el: any) => el.value)
			.join(',');
		let feedbackCategoryStatuses = Object.assign(Array<OptionsSelectedModel>(), feedbackCategoryStatusFilter)
			.map((el: any) => el.value)
			.join(',');

		const searchRequest: FeedbackCategoryFilterModel = {
			userId: userAccessId.toString(),
			queueId: Guid.create().toString(),
			feedbackCategoryName: feedbackCategoryNameFilter,
			feedbackCategoryStatus: feedbackCategoryStatuses,
			feedbackTypeIds: feedbackCategoryTypeIds,
		};

		getFeedbackCategoryListInfo(searchRequest, callback);
	};

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	const handleFeedbackCategoryStatusOnChange = (event: any) => {
		setFeedbackCategoryStatus(event.target.value);
	};

	const handleFeedbackCategoryNameFilterOnChange = (event: any) => {
		setFeedbackCategoryNameFilter(event.target.value);
	};

	const handleFeedbackCategoryStatusFilterOnChange = (event: any) => {
		setFeedbackCategoryStatusFilter(event);
	};

	const handleFeedbackCategoryTypeIdFilterOnChange = (event: any) => {
		setFeedbackCategoryTypeIdFilter(event);
	};

	const handleSearch = () => {
		loadFeedbackCategoryList();
	};

	const handleAddNew = () => {
		if (reorderFlag) {
			swal({
				title: 'Confirmation',
				text: 'Pending actions not posted will be lost if you proceed, please confirm',
				icon: 'warning',
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			}).then((onHandleAddNew) => {
				if (onHandleAddNew) {
					setFeedbackCategoryTypeIdFilter('');
					loadFeedbackCategoryList();
					setEditMode(false);
					toggleAddModal();
				}
			});
		} else {
			setEditMode(false);
			toggleAddModal();
		}
	};

	const handleChangeOrder = () => {
		if (addCount > 0) {
			swal({
				title: 'Confirmation',
				text: 'Pending actions not posted will be lost if you proceed, please confirm',
				icon: 'warning',
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			}).then((onHandleChangeOrder) => {
				if (onHandleChangeOrder) {
					setReorderFlag(true);
					setFeedbackCategoryTypeIdFilter('');
					loadFeedbackCategoryList(toggleReorderModal);
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

	const saveFeedbackCategory = (val: FeedbackCategoryModel) => {
		if (editMode) {
			const oldList = feedbackCategoryListState.filter((i) => i.feedbackCategoryId !== val.feedbackCategoryId);
			setFeedbackCategoryList([...oldList, val]);
			dispatch(systemManagement.actions.getFeedbackCategoryList([...oldList, val]));
		} else {
			val.feedbackCategoryId = 0;
			val.position =
				feedbackCategoryListState && feedbackCategoryListState.length > 0 ? Math.max(...feedbackCategoryListState.map((i) => i.position)) + 1 : 1;
			setFeedbackCategoryList([...feedbackCategoryListState, val]);
			dispatch(systemManagement.actions.getFeedbackCategoryList([...feedbackCategoryListState, val]));
		}
		toggleAddModal();
	};

	const saveReorder = (val: Array<FeedbackCategoryModel>) => {
		dispatch(systemManagement.actions.getFeedbackCategoryList(val));
	};

	const handleDeactivate = (data: any) => {
		const item = feedbackCategoryListState.find((i) => i.feedbackCategoryName === data.feedbackCategoryName);
		if (item !== undefined) {
			item.feedbackCategoryStatus = !item.feedbackCategoryStatus;
			const newList = feedbackCategoryListState?.map((cat: FeedbackCategoryModel) => {
				if (item.feedbackCategoryName !== cat.feedbackCategoryName) {
					return cat;
				}
				return {...cat, item};
			});
			dispatch(systemManagement.actions.getFeedbackCategoryList(newList));
		}
	};

	const handleEdit = (data: any) => {
		setEditMode(true);
		const feedbackCategoryItem = feedbackCategoryListState.find((i) => i.feedbackCategoryId === Number(data.feedbackCategoryId));
		if (feedbackCategoryItem !== undefined) {
			setFeedbackCategoryInfo(feedbackCategoryItem);
			toggleAddModal();
		} else {
			swal('Feedback Category Record not found', {icon: 'error'});
		}
	};

	const handleViewFeedbackCategory = (data: any) => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmCloseMessage,
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((onHandleViewFeedbackCategory) => {
			if (onHandleViewFeedbackCategory) {
				history.push(`/system/feedback-answer-list/${data.feedbackCategoryId}`);
			}
		});
	};

	const confirmSubmitForm = () => {
		swal({
			title: 'Confirmation',
			text: 'This action will update the Code List, please confirm',
			icon: 'warning',
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((onConfirmSubmitForm) => {
			if (onConfirmSubmitForm) {
				submitFeedbackCategoryForm();
			}
		});
	};

	const submitFeedbackCategoryForm = () => {
		const formItem: AddFeedbackCategoryRequestModel = {
			codeListId: feedbackId,
			codeListStatus: feedbackCategoryStatus,
			feedbackCategories: feedbackCategoryList as FeedbackCategoryModel[],
			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};
		const messagingHub = hubConnection.createHubConnenction();
		messagingHub
			.start()
			.then(() => {
				if (messagingHub.state === HubConnected) {
					addFeedbackCategoryList(formItem)
						.then((response) => {
							if (response.status === successResponse) {
								messagingHub.on(formItem.queueId.toString(), (message) => {
									let resultData = JSON.parse(message.remarks);
									if (resultData.Status === successResponse) {
										swal('Success', 'Transaction successfully submitted', 'success');
										loadFeedbackCategoryList();
									} else {
										swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
									}
									messagingHub.off(formItem.queueId.toString());
									messagingHub.stop();
								});

								_timeoutHandler(messagingHub);
							} else {
								messagingHub.stop();
								swal('Failed', response.data.message, 'error');
							}
						})
						.catch(() => {
							messagingHub.stop();
							swal('Failed', 'Problem in getting feedback category info', 'error');
						});
				} else {
					swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
				}
			})
			.catch(() => {});
	};

	const ediFeedbackCategoryBackAction = () => {
		swal({
			title: PROMPT_MESSAGES.ConfirmCloseTitle,
			text: PROMPT_MESSAGES.ConfirmCloseMessage,
			icon: 'warning',
			buttons: {
				cancel: {
					text: SwalConfirmMessage.btnNo,
					value: null,
					visible: true,
				},
				confirm: {
					text: SwalConfirmMessage.btnYes,
					value: true,
					visible: true,
				},
			},
			dangerMode: true,
		})
			.then((ediFeedbackCategoryBackActionConfirm) => {
				if (ediFeedbackCategoryBackActionConfirm) {
					if (paramId === '') {
						dispatch(systemManagement.actions.getFeedbackCategoryList([]));
						history.push(`/system/code-list`);
					} else {
						dispatch(systemManagement.actions.getFeedbackCategoryList([]));
						history.push(`/system/feedback-type-list`);
					}
				}
			})
			.catch(() => { });
	};

	const feedbackCategoryListAction = (params: any) =>
		<>
			<DefaultTableButton
				className={'btn btn-outline-dark btn-sm px-4 btn-mlab-custom'}
				access={userAccess.includes(USER_CLAIMS.FeedbackCategoryWrite)}
				title={
					params.data.feedbackCategoryStatus === true || params.data.feedbackCategoryStatus === 'true' ? 'Deactivate' : 'Activate'
				}
				onClick={() => handleDeactivate(params.data)}
			/>{' '}
			<DefaultTableButton
				access={userAccess.includes(USER_CLAIMS.FeedbackCategoryWrite)}
				title={'Edit'}
				onClick={() => handleEdit(params.data)}
			/>{' '}
			<DefaultTableButton
				access={userAccess.includes(USER_CLAIMS.FeedbackCategoryWrite)}
				title={'View Feedback Answer'}
				onClick={() => handleViewFeedbackCategory(params.data)}
			/>
		</>

	const feedbackCategoryListOrder = (params: any) => {
		const rowIndex = params.node?.rowIndex ?? -1; // Default to -1 if undefined
		return rowIndex >= 0 ? rowIndex + 1 : null; // Return ID if rowIndex is valid
	}

	const lowerCaseFeedbackCategoryName = (valueA: string, valueB: string) => {
        return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
    };

	const columnDefs : (ColDef<FeedbackCategoryModel> | ColGroupDef<FeedbackCategoryModel>)[] =  [
		{
			headerName: 'Order',
			field: 'position',
			sort: 'asc' as 'asc',
			maxWidth: 100,
		},
		{
			headerName: 'Feedback Category Name',
			field: 'feedbackCategoryName',
			comparator: lowerCaseFeedbackCategoryName,
		},
		{
			headerName: 'Status',
			field: 'feedbackCategoryStatus',
			cellRenderer: (params: any) => (params.data.feedbackCategoryStatus ? 'Active' : 'Inactive'),
		},
		{
			headerName: 'Included to Feedback Type',
			field: 'feedbackCategoryTypes',
			minWidth: 350,
			cellRenderer: (params: any) => params.data.feedbackCategoryTypes.map((i: FeedbackCategoryTypeModel) => i.feedbackTypeName).join(', '),
		},
		{
			headerName: 'Action',
			minWidth: 350,
			cellRenderer: feedbackCategoryListAction,
		},
		
	]

	return (
		<>
			<MainContainer>
				<FormHeader headerLabel={'Edit Feedback Category'} />
				<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-2'>
							<label htmlFor='codelist-fc-name'>Code List Name</label>
							<p id='codelist-fc-name' className='form-control-plaintext fw-bolder'>{feedbackCategoryCodeListInfo?.codeListName}</p>
						</div>
						<div className='col-lg-2'>
							<label htmlFor='codelist-fc-type'>Code List Type</label>
							<p id='codelist-fc-type' className='form-control-plaintext fw-bolder'>{feedbackCategoryCodeListInfo?.codeListTypeName}</p>
						</div>
						<div className='col-lg-2'>
							<label htmlFor='parent-fc-codelist'>Parent</label>
							<p id='parent-fc-codelist' className='form-control-plaintext fw-bolder'>{feedbackCategoryCodeListInfo?.parentCodeListName}</p>
						</div>
						<div className='col-lg-2'>
							<label htmlFor='fc-field-type'>Field Type</label>
							<p id='fc-field-type' className='form-control-plaintext fw-bolder'>{feedbackCategoryCodeListInfo?.fieldTypeName}</p>
						</div>
						<div className='col-lg-2'>
							<label htmlFor='codelist-fc-status'>Code List Status</label>
							<select
								id='codelist-fc-status'
								className='form-select form-select-sm'
								aria-label='Select status'
								value={feedbackCategoryStatus}
								onChange={handleFeedbackCategoryStatusOnChange}
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
							<label htmlFor='fc-created-date'>Created Date</label>
							<p id='fc-created-date' className='form-control-plaintext fw-bolder'>{useFormattedDate(feedbackCategoryCodeListInfo?.createdDate ? feedbackCategoryCodeListInfo.createdDate : '')}</p>
						</div>
						<div className='col-lg-2'>
							<label htmlFor='fc-created-by'>Created By</label>
							<p id='fc-created-by' className='form-control-plaintext fw-bolder'>{feedbackCategoryCodeListInfo ? feedbackCategoryCodeListInfo?.createdByName : ''}</p>
						</div>
						<div className='col-lg-2'>
							<label htmlFor='fc-last-modified-date'>Last Modified Date</label>
							<p id='fc-last-modified-date' className='form-control-plaintext fw-bolder'>{useFormattedDate(feedbackCategoryCodeListInfo?.updatedDate ? feedbackCategoryCodeListInfo?.updatedDate : '')}</p>
						</div>
						<div className='col-lg-2'>
							<label htmlFor='fc-modified-by'>Modified By</label>
							<p id='fc-modified-by' className='form-control-plaintext fw-bolder'>{feedbackCategoryCodeListInfo ? feedbackCategoryCodeListInfo?.updatedByName : ''}</p>
						</div>
					</FormGroupContainer>
					<div className='separator border-4 my-8' />
					<FormGroupContainer>
						<Row>
							<Col sm={4}>
								<BasicFieldLabel title='Feedback Category Name' />
								<input
									type='text'
									className='form-control form-control-sm '
									value={feedbackCategoryNameFilter}
									onChange={handleFeedbackCategoryNameFilterOnChange}
								/>
							</Col>
							<Col sm={3}>
								<BasicFieldLabel title='Feedback Category Status' />
								<Select
									isMulti
									aria-label='Select status'
									value={feedbackCategoryStatusFilter}
									onChange={handleFeedbackCategoryStatusFilterOnChange}
									options={[
										{value: '1', label: 'Active'},
										{value: '0', label: 'Inactive'},
									]}
								/>
							</Col>
							<Col sm={5}>
								<BasicFieldLabel title='Included to Feedback Type' />
								<Select
									isMulti
									value={feedbackCategoryTypeIdFilter}
									onChange={handleFeedbackCategoryTypeIdFilterOnChange}
									options={feedbackTypeOptionList}
								/>
							</Col>
						</Row>
					</FormGroupContainer>

					<FormGroupContainer>
						<ButtonsContainer>
							<DefaultButton access={userAccess.includes(USER_CLAIMS.FeedbackCategoryRead)} title={'Search'} onClick={handleSearch} />
							<DefaultSecondaryButton access={userAccess.includes(USER_CLAIMS.FeedbackCategoryWrite)} title={'Add New'} onClick={handleAddNew} />
							<DefaultSecondaryButton
								access={userAccess.includes(USER_CLAIMS.FeedbackCategoryWrite)}
								title={'Change Order'}
								onClick={handleChangeOrder}
							/>
						</ButtonsContainer>
					</FormGroupContainer>
					<FormGroupContainer>
						<div className='ag-theme-quartz' style={{height: 400, width: '100%'}}>
							<AgGridReact
								rowData={feedbackCategoryListState}
								columnDefs={columnDefs}
								defaultColDef={{
									sortable: true,
									resizable: true,
								}}
								animateRows={true}
								onGridReady={onGridReady}
								rowBuffer={0}
								//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
								paginationPageSizeSelector={false}
								pagination={true}
								paginationPageSize={10}
							>
							</AgGridReact>
						</div>
					</FormGroupContainer>
				</ContentContainer>
				<FooterContainer>
					<PaddedContainer>
						<DefaultButton access={userAccess.includes(USER_CLAIMS.FeedbackCategoryWrite)} title={'Submit'} onClick={confirmSubmitForm} />
						<DefaultSecondaryButton
							access={userAccess.includes(USER_CLAIMS.FeedbackCategoryRead)}
							title={'Back'}
							onClick={ediFeedbackCategoryBackAction}
						/>
					</PaddedContainer>
				</FooterContainer>
			</MainContainer>
			<AddEditFeedbackCategoryModal
				editMode={editMode}
				modal={addModal}
				toggle={toggleAddModal}
				feedbackCategory={feedbackCategoryInfo}
				saveFeedbackCategory={saveFeedbackCategory}
			/>

			<ReorderListModal
				modalName='Change Order Feedback Category'
				modal={reorderModal}
				toggle={toggleReorderModal}
				orderList={feedbackCategoryListState}
				columnList={[
					{
						title: 'Order',
						cellRenderer: feedbackCategoryListOrder,
					},
					{
						title: 'Feedback Category Name',
						field: 'feedbackCategoryName',
					},
					{
						title: 'Included to feedback type',
						field: 'feedbackTypeName',
					},
				]}
				saveReorder={saveReorder}
			/>
		</>
	);
};

export default EditFeedbackCategory;