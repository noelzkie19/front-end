import {faPencilAlt, faTrash} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import React, {useEffect, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import swal from 'sweetalert';
import {RootState} from '../../../../../../setup';
import {DefaultPrimaryButton, FormGroupContainer, TableIconButton} from '../../../../../custom-components';
import {USER_CLAIMS} from '../../../../user-management/components/constants/UserClaims';
import * as campaignSetting from '../../../redux/AutoTaggingRedux';
import {GoalParameterListModel} from '../../models/GoalParameterListModel';
import {PointToValueListModel} from '../../models/PointToValueListModel';
import { ColDef, ColGroupDef } from 'ag-grid-community';

//  pages
import PointIncentiveRangeConfigurationModal from './PointIncentiveRangeConfigurationModal';

interface Props {
	gridPointToValueData?: Array<PointToValueListModel>;
	gridGoalParamsData?: Array<GoalParameterListModel>;
	btnAction: string;
}

const PointIncentiveRangeConfigurationGrid: React.FC<Props> = ({gridPointToValueData, gridGoalParamsData, btnAction}) => {
	// GET REDUX STORE
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;

	//  STATE
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [showHeader, setShowHeader] = useState(false);
	const [actionTitle, setActionTitle] = useState('');
	const [disableAdd, setDisableAdd] = useState<boolean>(false);

	const dispatch = useDispatch();

	const getPointToValueConfigListState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getPointToValueConfigList,
		shallowEqual
	) as PointToValueListModel[];

	const [selectedPointToValueConfigId, setSelectedPointToValueConfigId] = useState(null);
	const [selectedPointToValueConfigDetails, setSelectedPointToValueConfigDetails] = useState<PointToValueListModel>();
	const VIEW = 'View';

	//   GRID DETAILS
	const columnDefs : (ColDef<PointToValueListModel> | ColGroupDef<PointToValueListModel>)[] =[
		{
			headerName: 'Range No',
			field: 'rangeNo',
			sort: 'asc' as 'asc',
			cellRenderer: (params: any) => (
				<>
					{params.data.rangeNo != 0 ? (
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
		{headerName: 'Incentive Value Amount', field: 'incentiveValueAmount'},
		{headerName: 'Valid Point Amount From', field: 'validPointAmountFrom'},
		{headerName: 'Valid Point Amount To', field: 'validPointAmountTo'},
		{
			headerName: 'Action',
			cellRenderer: (params: any) => (
				<>
					{params.data.rangeNo != 0 ? (
						<ButtonGroup>
							<div className='d-flex justify-content-center flex-shrink-0'>
								<div className='me-4'>
									<TableIconButton
										access={userAccess.includes(USER_CLAIMS.UpdateIncentiveSettingWrite)}
										faIcon={faPencilAlt}
										toolTipText={'Edit'}
										isDisable={btnAction == 'View' ? true : false}
										onClick={() => {
											btnAction != 'View' && openConfigurationEdit(params.data.pointToIncentiveRangeConfigurationId, params.data, 'Edit');
										}}
									/>
								</div>
								<div className='me-4'>
									<TableIconButton
										access={userAccess.includes(USER_CLAIMS.UpdateIncentiveSettingWrite)}
										faIcon={faTrash}
										iconColor={btnAction == 'View' ? '' : 'text-danger'}
										isDisable={btnAction == 'View' ? true : false}
										toolTipText={'Remove'}
										onClick={() => btnAction != 'View' && onRemoveDetails(params.data.rangeNo, params.data.CampaignSettingId)}
									/>
								</div>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},
	];

	useEffect(() => {
		setDisableAdd(getPointToValueConfigListState.length == 20 ? true : false);
	}, [getPointToValueConfigListState]);

	//  METHODS
	const onRemoveDetails = (rangeNo: any, campaignSettingId: any) => {
		swal({
			title: 'Confirmation',
			text: 'This action will remove the configuration, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willClose) => {
			if (willClose) {
				const filtered = getPointToValueConfigListState
					.filter((p) => p.rangeNo != rangeNo)
					.sort((s: any, t: any) => {
						return parseInt(s.rangeNo) - parseInt(t.rangeNo);
					});

				let addPointToValueConfigList = Array<PointToValueListModel>();
				let indx = 1;
				//reorder rangeNo
				filtered?.forEach((item: PointToValueListModel) => {
					const tempOption: PointToValueListModel = {
						pointToIncentiveRangeConfigurationId: item.pointToIncentiveRangeConfigurationId,
						campaignSettingId: campaignSettingId,
						currencyId: item.currencyId,
						rangeNo: indx++,
						incentiveValueAmount: item.incentiveValueAmount,
						validPointAmountFrom: item.validPointAmountFrom,
						validPointAmountTo: item.validPointAmountTo,
					};
					addPointToValueConfigList.push(tempOption);
				});

				dispatch(campaignSetting.actions.getPointToValueConfigList(addPointToValueConfigList));
			}
		});
	};

	const openConfigurationEdit = (id: any, data: PointToValueListModel, action: any) => {
		setModalShow(true);
		setActionTitle(action);
		setSelectedPointToValueConfigId(id);
		setSelectedPointToValueConfigDetails(data);
	};

	//  WATCHERS
	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	return (
		<div>
			<FormGroupContainer>
				<div className='ag-theme-quartz mt-2' style={{height: 300, width: '100%'}}>
					<AgGridReact
						rowData={getPointToValueConfigListState}
						defaultColDef={{
							sortable: true,
							resizable: true,
						}}
						onGridReady={onGridReady}
						rowBuffer={0}
						//enableRangeSelection={true} //deprecated in AgGridReactv32.0.0
						columnDefs={columnDefs}
					/>
				</div>
			</FormGroupContainer>
			<div className='d-flex my-4'>
				<DefaultPrimaryButton
					access={userAccess.includes(USER_CLAIMS.UpdateIncentiveSettingWrite)}
					title={'Add New'}
					onClick={() => {
						setModalShow(true);
						setShowHeader(true);
						setActionTitle('Add');
						setSelectedPointToValueConfigDetails(undefined);
					}}
					isDisable={btnAction == VIEW || disableAdd ? true : false}
				/>
			</div>

			{/* modal for add auto tagging */}
			<PointIncentiveRangeConfigurationModal
				dataModal={selectedPointToValueConfigDetails}
				selectedId={selectedPointToValueConfigId}
				showForm={modalShow}
				closeModal={() => setModalShow(false)}
				showHeader={showHeader}
				actionTitle={actionTitle}
			/>
			{/* end modal for auto tagging */}
		</div>
	);
};

export default PointIncentiveRangeConfigurationGrid;
