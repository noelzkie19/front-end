import { useEffect, useState } from "react";
import { ElementStyle, HttpStatusCodeEnum, SubscriberStatus } from "../../../../constants/Constants";
import { BasicFieldLabel, ButtonsContainer, ContentContainer, FormGroupContainer, FormHeader, GridWithLoader, MainContainer, MlabButton } from "../../../../custom-components";
import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "../../../../../setup";
import { EventSubscriptionFilterRequestModel } from "../../models/request/EventSubscriptionFilterRequestModel";
import { getEventSubscription, getEventSubscriptionResult, updateEventSubscription } from "../../redux/AdministratorService";
import useConstant from "../../../../constants/useConstant";
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import { IAuthState } from "../../../auth";
import { Guid } from "guid-typescript";
import { EventSubscriptionResponseModel } from "../../models/response/EventSubscriptionResponseModel";
import { EventSubscriptionRequestModel } from "../../models/request/EventSubscriptionRequestModel";
import { isEmpty } from "../../../../custom-functions/helper/validationHelper";
import swal from 'sweetalert';
import { HubConnection } from "@microsoft/signalr";
import { AxiosResponse } from "axios";

const SubscriptionList: React.FC = () => {
    const {SwalSuccessMessage, SwalServerErrorMessage,HubConnected} = useConstant();
	const {userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	
    // States
    const [loading, setLoading] = useState(false);
	const [sortOrder, setSortOrder] = useState<string>('DESC');
	const [sortColumn, setSortColumn] = useState<string>('CreatedDate');
    const [rowData, setRowData] = useState<Array<EventSubscriptionResponseModel>>([]);
    const [activeEvents,setActiveEvents] = useState<string>('');
	const [inActiveEvents,setInActiveEvents] = useState<string>('');
	const [eventApiUrl,setEventApiUrl] = useState<string>('');
	//
	useEffect(() => {
		loadEvents();
	}, [])
	useEffect(() => {
		if (!loading && rowData.length === 0) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
			(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
		}
	}, [loading]);

	useEffect(() => {
		setActiveEvents(rowData.filter(d=>d.SubscriberStatusId == SubscriberStatus.Active).map(d=>d.EventType).join(","));
		setInActiveEvents(rowData.filter(d=>d.SubscriberStatusId == SubscriberStatus.InActive).map(d=>d.EventType).join(","));
	}, [rowData]);
	const onClickStatus = (params:any)=>{
		console.log(params);

		const updatedSubscription = rowData.map((item) =>
			item.EventSubscriptionId === params.EventSubscriptionId ? 
				{ ...item, 
					SubscriberStatusId: params.SubscriberStatusId == SubscriberStatus.Active ? SubscriberStatus.InActive : SubscriberStatus.Active ,
					SubscriberStatus: params.SubscriberStatusId == SubscriberStatus.Active ? "In-Active" : "Active"  
				} : item );
		console.log(updatedSubscription);
		setRowData(updatedSubscription)
	}
    const customcellRendererOnlineStatusId =(params: any)=>{

        return (
            <>
            {' '}
            {params ? (
                <div className='form-check form-switch form-check-custom form-check-solid d-flex justify-content-center flex-shrink-0'>
                    <input
                        className='form-check-input'
                        type='checkbox'
                        value=''
                        id=''
                        defaultChecked={params.data.SubscriberStatusId == SubscriberStatus.Active}
                        onClick={()=>onClickStatus(params.data)}
                        disabled={false}
                    />
                </div>
            ) : null}
        </>
        )
    }
    const gridOptions = {
		columnDefs: [
			{headerName: 'EventType', field: 'EventType', autoWidth: true},
			{headerName: 'SubscriberStatus', field: 'SubscriberStatus', autoWidth: true},
			{
				headerName: 'Online Status',
				field: 'OnlineStatusId',
				autoWidth: true,
				cellRenderer: customcellRendererOnlineStatusId,
			},
			
		],
	};
    const onSort = (e: any) => {
		if (rowData != undefined && rowData.length > 0) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
			}
		}
	};

	const loadEvents = () => {
		const request: EventSubscriptionFilterRequestModel = {
			userId: userId ? userId?.toString() : '',
			queueId: Guid.create().toString(),
		}
		setLoading(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				getEventSubscription(request).then((response) => {
					if (response.status === HttpStatusCodeEnum.Ok) {
						messagingHub.on(request.queueId.toString(), (message) => {
							getEventSubscriptionResult(message.cacheId)
								.then((data) => {
									let resultData = Object.assign(new Array<EventSubscriptionResponseModel>(), data.data);
									setRowData(resultData);
									messagingHub.off(request.queueId.toString());
									messagingHub.stop();
									setLoading(false)
								})
								.catch(() => {
									setLoading(false);
								});
						});
						setTimeout(() => {
							if (messagingHub.state === HubConnected) {
								messagingHub.stop();
							}
						}, 30000);
					} else {
						messagingHub.stop();
					}
				});
			});
		}, 1000);
	};
	const updateEvent = ()=>{
		const request: EventSubscriptionRequestModel = {
			serviceURL: isEmpty(eventApiUrl) ? '': eventApiUrl,
			subscriberEventType:activeEvents,
			userId: userId ? userId?.toString() : '',
			queueId: Guid.create().toString(),
		}
		setLoading(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						updateEventSubscription(request)
							.then((response) => {
								processUpdateEventSubscriptionResponse(messagingHub,response,request);
							})
							.catch(() => {
								messagingHub.stop();
								swal('Failed', 'Problem in updating event subscription', 'error');
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	}
	const onChangeApiUrl=(val:any)=>{
		setEventApiUrl(val.target.value);
	}
	const processUpdateEventSubscriptionResponse = (messagingHub: HubConnection,response: AxiosResponse<any,any>,request: EventSubscriptionRequestModel)=>{
		if (response.status === HttpStatusCodeEnum.Ok) {
			messagingHub.on(request.queueId.toString(), (message) => {
				let resultData = JSON.parse(message.remarks);
				if (resultData.Status === HttpStatusCodeEnum.Ok) {
					swal(SwalSuccessMessage.title, SwalSuccessMessage.textSuccess, SwalSuccessMessage.icon);
					setLoading(false);
				} else {
					swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
				}
				loadEvents();
				messagingHub.off(request.queueId.toString());
				messagingHub.stop();
			});

			setTimeout(() => {
				if (messagingHub.state === HubConnected) {
					messagingHub.stop();
				}
			}, 30000);
		} else {
			messagingHub.stop();
			swal('Failed', response.data.message, 'error');
		}
	}
    return (
		<MainContainer>
			<FormHeader headerLabel={'Event Subscription Setting'} />
			<ContentContainer>
				<FormGroupContainer>
					<div className='col-lg-12'>
						<BasicFieldLabel title={'Active Events'} />
						<textarea className='form-control form-control-sm' rows={5} value={activeEvents} disabled />
					</div>
					<div className='col-lg-12'>
						<BasicFieldLabel title={'In-Active Events'} />
						<textarea className='form-control form-control-sm' rows={5} value={inActiveEvents} disabled/>
					</div>
					<div className='col-lg-12'>
						<BasicFieldLabel title={'Event Api Url'} />
						<i>*Note: Populate this if you want to override current Api Url.</i>
						<input type="text"className='form-control form-control-sm' value={eventApiUrl} onChange={onChangeApiUrl}></input>
					</div>
					<ButtonsContainer>
						<MlabButton
							access={true}
							size={'sm'}
							label={'Update'}
							style={ElementStyle.primary}
							type={'button'}
							weight={'solid'}
							loading={loading}
							disabled={loading}
							loadingTitle={' Please wait...'}
							onClick={()=>updateEvent()}
						/>
					</ButtonsContainer>
				</FormGroupContainer>
				<FormGroupContainer>
						{/* New grid loader implementation */}
						<GridWithLoader
						rowData={rowData}
						columnDefs={gridOptions.columnDefs}
						sortColumn={sortColumn}
						sortOrder={sortOrder}
						isLoading={loading}
						height={350}
						onSortChanged={(e: any) => onSort(e)}
					></GridWithLoader>
					
				</FormGroupContainer>
				<FormGroupContainer>
					
				</FormGroupContainer>
			</ContentContainer>
		</MainContainer>
	);

}
export default SubscriptionList;