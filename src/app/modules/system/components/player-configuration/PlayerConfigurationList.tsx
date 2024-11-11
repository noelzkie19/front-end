import {faPencilAlt} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import {Guid} from 'guid-typescript';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import '../../../../../_metronic/assets/css/datatables.min.css';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import * as sessionHandler from '../../../../../setup/session/SessionHandler';
import {ContentContainer, FormHeader, MainContainer, TableIconButton} from '../../../../custom-components';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {RequestModel} from '../../models';
import {PlayerConfigurationModel} from '../../models/PlayerConfigurationModel';
import * as systemManagement from '../../redux/SystemRedux';
import {getPlayerConfigurationList, getPlayerConfigurationListResult} from '../../redux/SystemService';
import {PLAYER_CONFIGURATION_SETTINGS} from '../constants/PlayerConfigurationRoutes';
import { ColDef, ColGroupDef } from 'ag-grid-community';

const PlayerConfigurationList: React.FC = () => {
	// States
	const gridRef: any = useRef();
	const dispatch = useDispatch();
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();
	const [loading, setLoading] = useState(false);

	const playerConfigListState = useSelector<RootState>(({system}) => system.playerConfigurationList, shallowEqual) as PlayerConfigurationModel[];

	const playerConfigurationName = (params: any) => {
		const routeInfo = PLAYER_CONFIGURATION_SETTINGS.find((i) => i.id === params.data.playerConfigurationId);
		return (
			<p>
				<button
					className='link-primary'
					style={{backgroundColor: 'transparent'}}
					onClick={() => handleViewPlayerConfig(routeInfo === undefined ? '' : routeInfo.view)}
					type='button'
				>
					{params.data.playerConfigurationName}
				</button>
			</p>
		);
	};

	const playerConfigurationAction = (params: any) => {
		const routeInfo = PLAYER_CONFIGURATION_SETTINGS.find((i) => i.id === params.data.playerConfigurationId);
		return (
			<ButtonGroup aria-label='Action'>
				<div className='d-flex justify-content-center flex-shrink-0'>
					<TableIconButton
						access={userAccess.includes(USER_CLAIMS.PlayerConfigurationWrite)}
						faIcon={faPencilAlt}
						toolTipText={'Edit'}
						onClick={() => handleEditPlayerConfig(routeInfo === undefined ? '' : routeInfo.route)}
					/>
				</div>
			</ButtonGroup>
		);
	};

	const columnDefs : (ColDef<PlayerConfigurationModel> | ColGroupDef<PlayerConfigurationModel>)[] = [
		{field: 'playerConfigurationId', headerName: 'No'},
		{
			field: 'playerConfigurationName',
			headerName: 'Player Configuration Name',
			cellRenderer: playerConfigurationName,
		},
		{
			headerName: 'Action',
			cellRenderer: playerConfigurationAction,
		},
	];

	// Effects
	useEffect(() => {
		if (sessionHandler.isSessionExpired(expiresIn, history) == true) {
			return;
		}
	}, []);

	// useEffect(() => {
	// 	if (loading) {
	// 		onBtShowLoading();
	// 	} else {
	// 		onBtHide();
	// 	}
	// }, [loading]);

	// useEffect(() => {
	// 	if (playerConfigListState.length === 0) {
	// 		onBtShowNoRows();
	// 	}
	// }, [playerConfigListState]);

	// Methods
	const loadPlayerConfigurationList = () => {
		setLoading(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				const searchRequest: RequestModel = {
					userId: userAccessId.toString(),
					queueId: Guid.create().toString(),
				};
				getPlayerConfigurationList(searchRequest).then((response) => {
					if (response.status === 200) {
						messagingHub.on(searchRequest.queueId.toString(), (message) => {
							getPlayerConfigurationListResult(message.cacheId)
								.then((returnData) => {
									let configData = Object.assign(new Array<PlayerConfigurationModel>(), returnData.data);
									dispatch(systemManagement.actions.getPlayerConfigurationList(configData));
									setLoading(false);
									messagingHub.off(searchRequest.queueId.toString());
									messagingHub.stop();
								})
								.catch(() => {
									swal('Failed', 'Error loading Player Configuration List', 'error');
									setLoading(false);
								});
							setLoading(false);
						});
					} else {
						swal('Failed', response.data.message, 'error');
						setLoading(false);
					}
				});
			});
		}, 1000);
	};

	const handleEditPlayerConfig = (route: string) => {
		history.push(route);
	};

	const handleViewPlayerConfig = (route: string) => {
		history.push(route);
	};

	const onGridReady = () => {
		gridRef.current.api.sizeColumnsToFit();
		loadPlayerConfigurationList();
	};

	const onBtShowLoading = useCallback(() => {
		gridRef.current.api.showLoadingOverlay();
	}, []);

	const onBtShowNoRows = useCallback(() => {
		gridRef.current.api.showNoRowsOverlay();
	}, []);

	const onBtHide = useCallback(() => {
		gridRef.current.api.hideOverlay();
	}, []);

	const dataRendered = () => {
		gridRef.current.api.sizeColumnsToFit();
	};
	return (
		<MainContainer>
			<FormHeader headerLabel={'Player Configuration'} />
			<ContentContainer>
				<div className='ag-theme-quartz' style={{height: 500, width: '100%', marginBottom: '50px'}}>
					<AgGridReact
						ref={gridRef}
						rowData={playerConfigListState}
						columnDefs={columnDefs}
						overlayLoadingTemplate={'<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>'}
						overlayNoRowsTemplate={'<span class="ag-overlay-loading-center">No Rows To Show</span>'}
						defaultColDef={{
							sortable: true,
							resizable: true,
						}}
						animateRows={true}
						onGridReady={onGridReady}
						onComponentStateChanged={dataRendered}
						rowBuffer={0}
						//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
					/>
				</div>
			</ContentContainer>
		</MainContainer>
	);
};

export default PlayerConfigurationList;
