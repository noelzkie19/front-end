import {faPencilAlt, faTrash} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import React, {useEffect, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../../../setup';
import {BorderedButton, FormGroupContainer, TableIconButton} from '../../../../../custom-components';
import {USER_CLAIMS} from '../../../../user-management/components/constants/UserClaims';
import * as campaignSetting from '../../../redux/AutoTaggingRedux';
import {GoalParameterListModel} from '../../models/GoalParameterListModel';
//  pages
import GoalParameterRangeConfigurationModal from './GoalParameterRangeConfigurationModal';
import { ColDef, ColGroupDef } from 'ag-grid-community';


interface Props {
	selectedCurrency?: any;
	dataGrid?: Array<GoalParameterListModel>;
	currencyId?: any;
	isView?: boolean;
}

const GoalParameterRangeConfigurationGrid: React.FC<Props> = ({selectedCurrency, dataGrid, currencyId, isView}) => {
	// GET REDUX STORE
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();

	//  STATE
	const [rowDataRangeConfig, setrowDataRangeConfig] = useState(dataGrid);
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [showHeader, setShowHeader] = useState(false);
	const [actionTitle, setActionTitle] = useState('');
	const [selectedPointToValueConfigId, setSelectedPointToValueConfigId] = useState(null);
	const dispatch = useDispatch();
	const [gridApi, setGridApi] = useState<any | null>(null);
	const [gridColumnApi, setGridColumnApi] = useState(null);
	const [disableAdd, setDisableAdd] = useState<boolean>(false);

	const [selecteGoalConfigDetails, setSelecteGoalConfigDetails] = useState<GoalParameterListModel>();

	const getGoalParameterConfigListState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getGoalParametersConfigList,
		shallowEqual
	) as GoalParameterListModel[];

	//   GRID DETAILS
	const columnDefs : (ColDef<GoalParameterListModel> | ColGroupDef<GoalParameterListModel>)[] = [
		{
			headerName: 'Range No',
			field: 'rangeNo',
			sort: 'asc' as 'asc',
			width: 200,
			cellRenderer: (params: any) => (
				<>
					{params.data.rangeNo ? (
						<ButtonGroup aria-label='Basic example'>
							<div className='d-flex justify-content-center flex-shrink-0 shadow-none'>
								<label
									className='btn-link cursor-pointer'
									onClick={() => {
										openConfigurationEdit(params.data.pointToIncentiveRangeConfigurationId, params.data, 'View');
									}}
								>
									{params.data.rangeNo}
								</label>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},
		{headerName: 'Point Amount', field: 'pointAmount', width: 300},
		{headerName: 'Range From', field: 'rangeFrom', width: 300},
		{headerName: 'Range To', field: 'rangeTo', width: 300},
		{
			headerName: 'Action',
			width: 300,
			cellRenderer: (params: any) => (
				<>
					{params.data.messageResponseId != 0 ? (
						<ButtonGroup aria-label='Basic example'>
							<div className='d-flex justify-content-center flex-shrink-0'>
								<div className='me-4'>
									<TableIconButton
										access={userAccess.includes(USER_CLAIMS.UpdateIncentiveSettingWrite)}
										faIcon={faPencilAlt}
										isDisable={isView}
										toolTipText={'Edit'}
										onClick={() => {
											!isView && openConfigurationEdit(params.data.pointToIncentiveRangeConfigurationId, params.data, 'Edit');
										}}
									/>
								</div>
								<div className='me-4'>
									<TableIconButton
										access={userAccess.includes(USER_CLAIMS.UpdateIncentiveSettingWrite)}
										faIcon={faTrash}
										isDisable={isView}
										iconColor={isView ? '' : 'text-danger'}
										toolTipText={'Remove'}
										onClick={() => !isView && onRemoveDetails(params.data.rangeNo, selectedCurrency, params.data.CampaignSettingId)}
									/>
								</div>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},
	];

	//  METHODS
	const openConfigurationEdit = (id: any, data: GoalParameterListModel, action: any) => {
		setModalShow(true);
		setActionTitle(action);
		setSelectedPointToValueConfigId(id);
		setSelecteGoalConfigDetails(data);
	};

	const onRemoveDetails = (rangeNo: any, currencyName: any, campaignSettingId: any) => {
		swal({
			title: 'Confirmation',
			text: 'This action will remove the configuration, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willClose) => {
			if (willClose) {
				const filtered = getGoalParameterConfigListState
					.filter((p) => {
						return !(p.rangeNo == rangeNo && p.currencyName == currencyName);
					})
					.sort((s: any, t: any) => {
						return parseInt(s.rangeNo) - parseInt(t.rangeNo);
					});

				let addGoalParamsConfig = Array<GoalParameterListModel>();
				let indx = 1;
				//reorder rangeNo
				filtered?.forEach((item: GoalParameterListModel) => {
					if (item.currencyName == currencyName) {
						const tempOption: GoalParameterListModel = {
							goalParameterRangeConfigurationId: item.goalParameterRangeConfigurationId,
							campaignSettingId: campaignSettingId,
							currencyId: item.currencyId,
							currencyName: item.currencyName,
							rangeNo: indx++,
							pointAmount: item.pointAmount,
							rangeFrom: item.rangeFrom,
							rangeTo: item.rangeTo,
						};
						addGoalParamsConfig.push(tempOption);
					} else {
						const tempOption: GoalParameterListModel = {
							goalParameterRangeConfigurationId: item.goalParameterRangeConfigurationId,
							campaignSettingId: campaignSettingId,
							currencyId: item.currencyId,
							currencyName: item.currencyName,
							rangeNo: item.rangeNo,
							pointAmount: item.pointAmount,
							rangeFrom: item.rangeFrom,
							rangeTo: item.rangeTo,
						};
						addGoalParamsConfig.push(tempOption);
					}
				});
				dispatch(campaignSetting.actions.getGoalParametersConfigList(addGoalParamsConfig));
				setDisableAdd(getGoalParameterConfigListState.filter((x) => x.currencyId == currencyId).length - 1 >= 20);
			}
		});
	};

	const addNewGoal = () => {
		setModalShow(true);
		setShowHeader(true);
		setActionTitle('Add');
	};

	//  WATCHERS
	const onGridReady = (params: any) => {
		setGridApi(params.api);
		setGridColumnApi(params.columnApi);
		params.api.sizeColumnsToFit();
	};

	const reloadCurrency = () => {
		const currencyData = getGoalParameterConfigListState.filter((x) => x.currencyId == currencyId);
		setrowDataRangeConfig(currencyData);
	};

	useEffect(() => {
		reloadCurrency();
	}, [dataGrid]);

	useEffect(() => {
		reloadCurrency();
		if (getGoalParameterConfigListState.filter((x) => x.currencyId == currencyId).length >= 20) {
			setDisableAdd(true);
		}
	}, [getGoalParameterConfigListState]);

	useEffect(() => {
		reloadCurrency();
	}, [selectedCurrency]);

	return (
		<div>
			<FormGroupContainer>
				{/* table */}

				<div className='ag-theme-quartz mt-2' style={{height: 300, width: '100%'}}>
					<AgGridReact
						rowData={rowDataRangeConfig}
						defaultColDef={{
							sortable: true,
							resizable: true,
						}}
						onGridReady={onGridReady}
						onRowValueChanged={onGridReady}
						rowBuffer={0}
						enableRangeSelection={true}
						columnDefs={columnDefs}
					/>
				</div>
			</FormGroupContainer>
			<div className='d-flex my-4'>
				<BorderedButton
					access={userAccess.includes(USER_CLAIMS.UpdateIncentiveSettingWrite)}
					title={'Add New'}
					isDisabled={disableAdd || isView}
					onClick={() => {
						addNewGoal();
					}}
					isColored={true}
				/>
			</div>

			<GoalParameterRangeConfigurationModal
				currencyId={currencyId}
				selectedCurrency={selectedCurrency}
				dataModal={selecteGoalConfigDetails}
				selectedId={selectedPointToValueConfigId}
				showForm={modalShow}
				closeModal={() => setModalShow(false)}
				showHeader={showHeader}
				actionTitle={actionTitle}
			/>
		</div>
	);
};

export default GoalParameterRangeConfigurationGrid;
