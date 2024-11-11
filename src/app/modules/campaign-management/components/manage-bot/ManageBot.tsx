import {faPencilAlt, faTrash} from '@fortawesome/free-solid-svg-icons';
import {HubConnection} from '@microsoft/signalr';
import {AxiosResponse} from 'axios';
import {Guid} from 'guid-typescript';
import React, {useEffect, useRef, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {OptionListModel} from '../../../../common/model';
import {AutoReplyTriggerEnum, AutoReplyTypeEnum, ElementStyle, TelegramBotEnum} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {
	BasicFieldLabel,
	ContentContainer,
	DefaultSelect,
	FormGroupContainer,
	FormHeader,
	GridWithLoaderAndPagination,
	MainContainer,
	MlabButton,
	TableIconButton,
} from '../../../../custom-components';
import {IAuthState} from '../../../auth';
import {DefaultPageSetup} from '../../../system/components/constants/PlayerConfigEnums';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {BotAutoReplyDetailsRequest} from '../../models/request/BotAutoReplyDetailsRequest';
import {BotDetailsFilterRequest} from '../../models/request/BotDetailsFilterRequest';
import {BotAutoReplyModel} from '../../models/response/BotAutoReplyModel';
import {BotDetailsFilterResponse} from '../../models/response/BotDetailsFilterResponse';
import {DeleteBotAutoReply, GetBotDetailAutoReplyList, GetBotDetailAutoReplyListResult, GetBotDetailList, GetBotDetailListResult, TelegramCustomAutoReplyCount} from '../../redux/ManageBotApi';
import AddEditBotAutoReplyModal from './AddEditBotAutoReplyModal';
import AddEditBotModal from './AddEditBotModal';

const ManageBot: React.FC = () => {
	const {access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const history = useHistory();
	const [maxCustomReply, setMaxCustomReply] = useState<boolean>(true);
	const {SwalConfirmMessage,SwalServerErrorMessage} = useConstant();
	const actionButtonElem = (params: any) => {
		const {data} = params;
		return (
			<ButtonGroup aria-label='Basic example'>
				<div className='d-flex justify-content-center flex-shrink-0'>
					<div className='me-4'>
						<TableIconButton
							access={access?.includes(USER_CLAIMS.UpdateTelegramBotWrite) && access?.includes(USER_CLAIMS.UpdateTelegramBotRead)}
							faIcon={faPencilAlt}
							toolTipText={'Edit'}
							onClick={() => handleEditBotAutoReply(data)}
							isDisable={false}
						/>

					</div>
					{data.type === AutoReplyTypeEnum.Custom &&
					(<div className='me-4'>
						<TableIconButton
							access={access?.includes(USER_CLAIMS.UpdateTelegramBotWrite) && access?.includes(USER_CLAIMS.UpdateTelegramBotRead)}
							faIcon={faTrash}
							iconColor={'text-danger'}
							toolTipText={'Edit'}
							onClick={() => handleDeleteBotAutoReply(data)}
							isDisable={false}
						/>
					</div>)}
				</div>
			</ButtonGroup>
		);
	};
	const columnDefs = [
		{headerName: 'Trigger', field: 'trigger', flex: 1},
		{headerName: 'Chat Value', field: 'chatValue', flex: 1},
		{headerName: 'Type', field: 'type', flex: 1},
		{headerName: 'Action', field: '', flex: 1, cellRenderer: actionButtonElem},
	];

	const [actionTitle, setActionTitle] = useState<string>('');
	const [modalAction, setModalAction] = useState<string>('');
	const [showForm, setShowForm] = useState<boolean>(false);
	const [showBoAutoReplyForm, setShowBoAutoReplyForm] = useState<boolean>(false);
	const [modalBotDetailId, setModalBotDetailId] = useState<number>();
	const [modalBotDetailName, setModalBotDetailName] = useState<string>('');

	const gridRef: any = useRef();
	const [telegramBotList, setTelegramBotList] = useState<Array<BotDetailsFilterResponse>>([]);
	const [telegramBotOption, setTelegramBotOption] = useState<Array<OptionListModel>>([]);
	const [selectedTelegramBotOption, setSelectedTelegramBotOption] = useState<string>('');
	const [showDetails, setShowDetails] = useState<boolean>(false);
	const [telegramBotAutoReplyList, setTelegramBotAutoReplyList] = useState<Array<BotAutoReplyModel>>([]);
	const [selectedBotAutoReplyModel, setSelectedBotAutoReplyModel] = useState<BotAutoReplyModel>({
		telegramBotAutoReplyTriggerId: 0,
		botDetailId: 0,
		attachment: '',
		message: '',
		botDetailsAutoReplyId: 0,
		chatValue: '',
		trigger: '',
		type: '',
	});

	const [selectedTelegramBot, setSelectedTelegramBot] = useState<BotDetailsFilterResponse>({
		botDetailId: 0,
		botId: 0,
		botMlabUser: '',
		botMlabUserId: 0,
		botToken: '',
		botUsername: '',
		brandId: 0,
		brand: '',
		status: '',
		statusId: 0,
	});
	const [pageSize, setPageSize] = useState<number>(DefaultPageSetup.pageSizeDefault);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('DESC');
	const [sortColumn, setSortColumn] = useState<string>('CreatedDate');
	const [loading, setLoading] = useState(false);
	const {successResponse, HubConnected} = useConstant();

	useEffect(() => {
		getAllTelegramBot();
		if(!access?.includes(USER_CLAIMS.TelegramBotSettingRead))
			history.push('/error/401');

	}, []);
	useEffect(() => {
		
		if (telegramBotList.length > 0) {
			let results = telegramBotList.map((option) => ({value: option.botDetailId.toString(), label: option.botUsername}));
			results.unshift({value: '0', label: 'Select...'});
			setTelegramBotOption(results);

			// reload bot details from selected BOT username - add/edit mode
			if (modalBotDetailId && !showForm) {
				onChangeUserName({label: modalBotDetailName, value: modalBotDetailId.toString()});
			}
		}
	}, [telegramBotList]);

	useEffect(() => {
		const fetchData = async () => {
			if (!showForm) {
				// [MPCS]: to reload BOT username dropdown after closing add modal.
				await getAllTelegramBot();

			}
		};

		fetchData();
	}, [showForm]);
	useEffect(() => {
		const fetchData = async () => {
			if (!showBoAutoReplyForm) {
				getAllTelegramBotAutoReplyByFilter();
			}
		};

		fetchData();
	}, [showBoAutoReplyForm]);
	useEffect(() => {
		if (selectedTelegramBotOption) {
			getAllTelegramBotAutoReplyByFilter();
		}
	}, [selectedTelegramBotOption]);

	useEffect(() => {
		if (!loading && telegramBotAutoReplyList?.length === 0) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else if (loading) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
			}
		}
	}, [loading]);

	const getAllTelegramBot = async () => {
		const request: BotDetailsFilterRequest = {
			queueId: Guid.create().toString(),
			userId: userAccessId?.toString(),
		};

		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				if (messagingHub.state !== HubConnected) {
					return;
				}
				GetBotDetailList(request)
					.then((response) => {
						processGetBotDetailListResponse(response,messagingHub,request);
					})
					.catch((ex) => {
						swal('Failed', 'Problem saving bot details', 'error');
					});
			});
		}, 1000);
	};
	const processGetBotDetailListResponse = (response: AxiosResponse<any>,messagingHub:HubConnection,request:BotDetailsFilterRequest)=>{
		if (response.status === successResponse) {
			messagingHub.on(request.queueId.toString(), (message) => {
				GetBotDetailListResult(message.cacheId)
					.then((returnData) => {
						processGetBotDetailListResult(response,returnData,messagingHub,request);
					})
					.catch(() => {
						swal('Failed', 'Problem saving bot details', 'error');
					});
			});
		} else {
			swal('Failed', 'Problem saving bot details', 'error');
		}
	}
	const processGetBotDetailListResult = (response:AxiosResponse<any>,returnData:AxiosResponse<BotDetailsFilterResponse[]>,messagingHub:HubConnection,request:BotDetailsFilterRequest)=>{
		if (response.status !== successResponse) {
			swal('Failed', 'Error saving bot details', 'error');
		} else {
			setTelegramBotList(returnData.data);
			messagingHub.off(request.queueId.toString());
			messagingHub.stop();
		}
	}
	const getAllTelegramBotAutoReplyRequest = (_sortColumn?: string, _sortOrder?: string, _pageSize?: number,_offsetValue?: number)=>{
		const request: BotAutoReplyDetailsRequest = {
			queueId: Guid.create().toString(),
			userId: userAccessId?.toString(),
			botDetailId: selectedTelegramBot.botDetailId,
			pageSize: _pageSize ?? pageSize,
			offsetValue: _offsetValue ?? 0,
			sortColumn: _sortColumn ?? sortColumn,
			sortOrder: _sortOrder ?? sortOrder,
		};
		return request;
	}
	const getAllTelegramBotAutoReplyByFilter = async (_sortColumn?: string, _sortOrder?: string, _offsetValue?: number, _pageSize?: number) => {
		
		let request = getAllTelegramBotAutoReplyRequest(_sortColumn,_sortOrder,_pageSize,_offsetValue);
		
		setLoading(true);
		setTelegramBotAutoReplyList([]);
		
		
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				if (messagingHub.state !== HubConnected) {
					return;
				}
				GetBotDetailAutoReplyList(request)
					.then((response) => {
						processGetBotDetailAutoReplyListResponse(response,messagingHub,request);
					})
					.catch((ex) => {
						setLoading(false);
						swal('Failed', 'Problem sgetting bot auto reply list', 'error');
					});
			});
		}, 1000);
	};
	const processGetBotDetailAutoReplyListResponse= (response:AxiosResponse<any>,messagingHub: HubConnection,request:BotAutoReplyDetailsRequest)=>{
		if (response.status === successResponse) {
			messagingHub.on(request.queueId.toString(), (message) => {
				processGetBotDetailAutoReplyListResult(message,response,messagingHub,request);
			});
		} else {
			setLoading(false);
			swal('Failed', 'Problem getting bot auto reply list', 'error');
		}
	}
	const processGetBotDetailAutoReplyListResult = (message:any,response:AxiosResponse<any>,messagingHub: HubConnection,request:BotAutoReplyDetailsRequest)=>{
		GetBotDetailAutoReplyListResult(message.cacheId)
		.then((returnData) => {
			if (response.status !== successResponse) {
				swal('Failed', 'Error getting bot auto reply list', 'error');
			} else {
				setTelegramBotAutoReplyList(returnData.data.botDetailsAutoReplyList);
				validateMaxCustomReply(returnData.data.botDetailsAutoReplyList);
				setLoading(false);
				setRecordCount(returnData.data.recordCount);
				messagingHub.off(request.queueId.toString());
				messagingHub.stop();
			}
		})
		.catch(() => {
			setLoading(false);
			swal('Failed', 'Problem getting bot auto reply list', 'error');
		});
	}
	const handleAddBot = () => {
		setShowForm(true);
		setActionTitle('Add BOT');
		setModalAction('ADD');
	};

	const handleEditBot = () => {
		setShowForm(true);
		setActionTitle('Edit BOT');
		setModalAction('EDIT');
	};
	const handleDeleteBotAutoReply = (param: any) => {
		swal({
			title: SwalConfirmMessage.title,
			text: SwalConfirmMessage.textConfirmRemove,
			icon: SwalConfirmMessage.icon,
			buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				DeleteBotAutoReply(param.telegramBotAutoReplyTriggerId).then((returnData) => {
					if (returnData.status !== successResponse) {
						swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
						return;
					}
					getAllTelegramBotAutoReplyByFilter();
				});
			};
		});

	}

	const handleEditBotAutoReply = (param: any) => {
		setShowBoAutoReplyForm(true);
		if(param != null){
			setSelectedBotAutoReplyModel(param);
			return;
		}
		let BotAutoReplyModel = ({
			telegramBotAutoReplyTriggerId: 0,
			botDetailId: selectedTelegramBot.botDetailId ?? 0,
			attachment: '',
			message: '',
			botDetailsAutoReplyId: 0,
			chatValue: '',
			trigger: AutoReplyTriggerEnum.CommandReceived,
			type: AutoReplyTypeEnum.Custom,
		});
		setSelectedBotAutoReplyModel(BotAutoReplyModel);
	};

	const addEditButtons = (
		<>
			<MlabButton
				access={userAccess.includes(USER_CLAIMS.UpdateTelegramBotWrite)}
				size='sm'
				label='Edit BOT'
				style={ElementStyle.primary}
				type='button'
				weight='solid'
				disabled={!showDetails}
				onClick={handleEditBot}
			/>
			<MlabButton
				access={userAccess.includes(USER_CLAIMS.UpdateTelegramBotWrite)}
				size='sm'
				label='Add BOT'
				style={ElementStyle.primary}
				type='button'
				weight='solid'
				disabled={false}
				onClick={handleAddBot}
			/>
		</>
	);
	
	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			paginationLoadList(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			paginationLoadList(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const paginationLoadList = (_pageSize: number, _currentPage: number, _sortColumn: string, _sortOrder: string) => {
		getAllTelegramBotAutoReplyByFilter(_sortColumn, _sortOrder, (_currentPage - 1) * _pageSize, _pageSize);
	};
	const onPageSizeChanged = () => {
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);
		if (telegramBotList != undefined && telegramBotList.length > 0) {
			paginationLoadList(Number(value), 1, sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};
	const onSort = (e: any) => {
		if (telegramBotList != undefined && telegramBotList.length > 0) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				getAllTelegramBotAutoReplyByFilter(sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
				getAllTelegramBotAutoReplyByFilter();
			}
		}
	};

	const onPaginationClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			paginationLoadList(pageSize, currentPage - 1, sortColumn, sortOrder);
		}
	};

	const onPaginationClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			paginationLoadList(pageSize, 1, sortColumn, sortOrder);
		}
	};
	const validateMaxCustomReply = (data: Array<BotAutoReplyModel>) => {
		setMaxCustomReply(true);
		TelegramCustomAutoReplyCount(selectedTelegramBot.botDetailId).then((returnData) => {
			if(returnData.data < TelegramBotEnum.CustomCommandLimitCount || returnData.data.length === 0){
				setMaxCustomReply(false);
			}
		});
	}

	const onChangeUserName = (val: any) => {
		setShowDetails(false);
		if (val) {
			setSelectedTelegramBotOption(val);
			let selectedBot = telegramBotList.find((d) => d.botDetailId === Number(val.value));
			if (selectedBot) {
				setSelectedTelegramBot(selectedBot); 
				if(access?.includes(USER_CLAIMS.ViewTelegramBotWrite) && access?.includes(USER_CLAIMS.ViewTelegramBotRead)){
					setShowDetails(true);
				}
			}
		}
	};
	return (
		<MainContainer>
			<FormHeader headerLabel={'Manage Telegram BOT'} additionalElements={addEditButtons} additionalElementPlacement={'left'} />
			<ContentContainer>
				<div className='row'>
					<FormGroupContainer>
						<div className='col-lg-3 mt-1'>
							<BasicFieldLabel title={'BOT Username'} />
							<DefaultSelect data={telegramBotOption} onChange={onChangeUserName} value={selectedTelegramBotOption} isDisabled={!access?.includes(USER_CLAIMS.TelegramBotWrite)} />
						</div>
						{showDetails && (
							<>
								<div className='col-lg-2 mt-1'>
									<BasicFieldLabel title={'BOT ID'} />
									<input type='textbox' className='form-control form-control-sm' disabled aria-label='BOT ID' value={selectedTelegramBot['botId']} />
								</div>
								<div className='col-lg-2 mt-1'>
									<BasicFieldLabel title={'Assigned Brand'} />
									<input
										type='textbox'
										className='form-control form-control-sm'
										disabled
										aria-label='Assigned Brand'
										value={selectedTelegramBot['brand']}
									/>
								</div>
								<div className='col-lg-2 mt-1'>
									<BasicFieldLabel title={'Assigned MLAB User'} />
									<input
										type='textbox'
										className='form-control form-control-sm'
										disabled
										aria-label='Assigned MLAB User'
										value={selectedTelegramBot['botMlabUser']}
									/>
								</div>
								<div className='col-lg-2 mt-1'>
									<BasicFieldLabel title={'Status'} />
									<input type='textbox' className='form-control form-control-sm' disabled aria-label='Status' value={selectedTelegramBot['status']} />
								</div>
							

							</>
						)}
					</FormGroupContainer>
					<FormGroupContainer>
						{showDetails && (
								<div className='col-lg-2 mt-1'>
									<BasicFieldLabel title={'Auto Reply'} />
									<div>
									<MlabButton
										access={userAccess.includes(USER_CLAIMS.UpdateTelegramBotWrite)}
										size='sm'
										label='Add Auto Reply'
										style={ElementStyle.primary}
										type='button'
										weight='solid'
										disabled={maxCustomReply || loading}
										onClick={() => handleEditBotAutoReply(null)}
									/>
									</div>
								</div>
						)}
					</FormGroupContainer>
				</div>
				{showDetails && (
					<div className='row pb-15'>
						<GridWithLoaderAndPagination
							gridRef={gridRef}
							rowData={telegramBotAutoReplyList}
							columnDefs={columnDefs}
							sortColumn={sortColumn}
							sortOrder={sortOrder}
							isLoading={loading}
							height={500}
							onSortChanged={(e: any) => onSort(e)}
							//pagination details
							recordCount={recordCount}
							currentPage={currentPage}
							pageSize={pageSize}
							onClickFirst={onPaginationClickFirst}
							onClickPrevious={onPaginationClickPrevious}
							onClickNext={onClickNext}
							onClickLast={onClickLast}
							onPageSizeChanged={onPageSizeChanged}
						></GridWithLoaderAndPagination>
					</div>
				)}
			</ContentContainer>
			<AddEditBotModal
				actionTitle={actionTitle}
				showForm={showForm}
				modalAction={modalAction}
				closeModal={() => setShowForm(false)}
				modalBotDetailId={modalBotDetailId}
				setModalBotDetailName={setModalBotDetailName}
				modalBotDetailByIdData={selectedTelegramBot}
				setModalBotDetailId={setModalBotDetailId}
			/>
			<AddEditBotAutoReplyModal
				showBoAutoReplyForm={showBoAutoReplyForm}
				setShowBoAutoReplyForm={setShowBoAutoReplyForm}
				closeModal={() => setShowBoAutoReplyForm(false)}
				selectedBotAutoReply={selectedBotAutoReplyModel}
			/>
		</MainContainer>
	);
};

export default ManageBot;
