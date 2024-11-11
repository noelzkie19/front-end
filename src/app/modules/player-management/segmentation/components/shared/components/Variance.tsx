import {faPencilAlt, faTrash} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import React, {useEffect, useState} from 'react';
import {ButtonGroup, Modal, ModalFooter} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useParams} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../../../../setup';
import {ElementStyle} from '../../../../../../constants/Constants';
import {ButtonsContainer, FormGroupContainer, MlabButton, TableIconButton} from '../../../../../../custom-components';
import AlertLabel from '../../../../../../custom-components/labels/AlertLabel';
import {AlertLabelModel} from '../../../../../../custom-components/models/AlertLabelModel';
import {USER_CLAIMS} from '../../../../../user-management/components/constants/UserClaims';
import {SegmentVarianceModel} from '../../../models/SegmentVarianceModel';
import * as segmentManagement from '../../../redux/SegmentationRedux';
import {ISegmentationState} from '../../../redux/SegmentationRedux';
import useSegmentConstant from '../../../useSegmentConstant';
import BorderedPlusButton from './BorderedPlusButton';
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface props {
	setVarianceList?: any;
	disable?: any;
	segmentObjectRespVarianceList?: any;
}

export const Variance: React.FC<props> = ({setVarianceList, disable = false, segmentObjectRespVarianceList}: props) => {
	const dispatch = useDispatch();
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const [showModal, setShowModal] = useState<boolean>(false);

	const {actionName, segmentId} = useParams();
	const [varianceName, setVarianceName] = useState<string>('');
	const [percentage, setPercentage] = useState<string>('');
	const [gridApi, setGridApi] = useState<any | null>(null);
	const [gridColumnApi, setGridColumnApi] = useState(null);
	const [alertMessage, setAlertMessage] = useState<AlertLabelModel>();
	const [varianceLocalList, setVarianceLocalList] = useState<Array<SegmentVarianceModel>>([]);
	const [selectedVarianceItem, setSelectedVarianceItem] = useState<SegmentVarianceModel>();
	const [selectedVarianceItemIdx, setSelectedVarianceItemIdx] = useState<number>(0);
	const [actionTitle, setActionTitle] = useState('');
	let alertLabel: AlertLabelModel;

	/**
	 *  ? Hooks
	 */
	const {PageAction} = useSegmentConstant();

	const {segmentConditions, filterOperators, isStatic, segmentVarianceList, segmentInfo} = useSelector<RootState>(
		({segment}) => segment,
		shallowEqual
	) as ISegmentationState;

	useEffect(() => {
		initializeComponent();
		return () => {
			resetForm();
		};
	}, []);

	useEffect(() => {
			setVarianceLocalList(segmentObjectRespVarianceList);
	}, [segmentObjectRespVarianceList]);

	const initializeComponent = () => {
		dispatch(segmentManagement.actions.setSegmentVarianceList([]));
	};

	// Methods
	const resetForm = () => {
		setVarianceName('');
		setPercentage('');
	};

	const handleAddVariance = () => {
		setShowModal(true);
		setActionTitle('Add');
	};

	const handleEditVariance = (id: any, data: SegmentVarianceModel) => {
		if (!disable) {
			setShowModal(true);
			setActionTitle('Edit');
			setVarianceName(data.varianceName);
			setPercentage(data.percentage.toString());
			setSelectedVarianceItem(data);
			setSelectedVarianceItemIdx(id);
		}
	};

	const handleRemoveVariance = (_varianceName: string) => {
		if (!disable) {
			swal({
				title: 'Confirmation',
				text: 'This action will discharge any changes made, please confirm',
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			}).then((willClose) => {
				if (willClose) {
					const filtered = varianceLocalList.filter((item) => item.varianceName != _varianceName);

					let varianceLst = Array<SegmentVarianceModel>();
					let indx = 1;
					//reorder rangeNo
					filtered?.forEach((item: SegmentVarianceModel) => {
						const tempVarianceList: SegmentVarianceModel = {
							segmentId: item.segmentId,
							varianceId: item.varianceId,
							varianceName: item.varianceName,
							percentage: item.percentage,
							isActive: item.isActive,
							createdBy: item.createdBy,
							updatedBy: item.updatedBy,
						};
						varianceLst.push(tempVarianceList);
					});

					setVarianceList(varianceLst);
					setVarianceLocalList(varianceLst);
				}
			});
		}
	};

	const _close = () => {
		swal({
			title: 'Confirmation',
			text: 'This action will discard any changes made, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willUpdate) => {
			if (willUpdate) {
				setShowModal(false);
				alertLabel = {hasAlert: false, message: '', status: ''};
				setAlertMessage(alertLabel);
				setVarianceName('');
				setPercentage('');
			}
		});
	};

	function computeSum(data: Array<SegmentVarianceModel>) {
		let sum = data.reduce(function (prev, current) {
			return prev + +current.percentage;
		}, 0);

		return sum;
	}

	function checkIfVarianceNameExist(name: string) {
		let isVarianceNameExisting = varianceLocalList.find((x) => x.varianceName === name);
		return isVarianceNameExisting;
	}

	const _submit = () => {
		let isValid = true;
		if (varianceName.length === 0 || percentage.length === 0) {
			isValid = false;
			alertLabel = {hasAlert: true, message: 'Unable to proceed, kindly fill up the mandatory fields.', status: 'danger'};
			setAlertMessage(alertLabel);
		}

		if (
			(checkIfVarianceNameExist(varianceName) && actionTitle == 'Add') ||
			(checkIfVarianceNameExist(varianceName) && selectedVarianceItem?.varianceName != varianceName && actionTitle == 'Edit')
		) {
			isValid = false;
			alertLabel = {hasAlert: true, message: 'Unable to proceed, ' + varianceName + ' already exists.', status: 'danger'};
			setAlertMessage(alertLabel);
		}

		if (actionTitle == 'Add') {
			if (varianceLocalList.length >= 3) {
				isValid = false;
				alertLabel = {hasAlert: true, message: 'Unable to proceed, maximum of 3 variances can only be added', status: 'danger'};
				setAlertMessage(alertLabel);
			}

			let sum = computeSum(varianceLocalList) + parseInt(percentage);
			if (sum > 100 || (varianceLocalList.length == 2 && sum > 100)) {
				isValid = false;
				alertLabel = {
					hasAlert: true,
					message: 'Unable to proceed. Total Distribution percentage should be equal to 100% and a maximum of 3 Variance.',
					status: 'danger',
				};
				setAlertMessage(alertLabel);
			}
		}

		if (isValid) {
			let isValidEdit = true;

			if (actionTitle == 'Add') {
				const varianceAdd: SegmentVarianceModel = {
					segmentId: segmentId === undefined ? 0 : segmentId,
					varianceId: 0,
					varianceName: varianceName,
					percentage: parseInt(percentage),
					isActive: true,
					createdBy: userAccessId,
					updatedBy: userAccessId,
				};

				setVarianceList([...varianceLocalList, varianceAdd]);
				setVarianceLocalList([...varianceLocalList, varianceAdd]);
			} else {
				let updated = varianceLocalList.map((x) => {
					if (x.varianceName === selectedVarianceItem?.varianceName) {
						return {...x, varianceName: varianceName, percentage: parseInt(percentage)};
					}
					return x;
				});

				let sum = computeSum(updated);
				if (sum > 100 || (updated.length == 2 && sum > 100)) {
					isValidEdit = false;
					alertLabel = {
						hasAlert: true,
						message: 'Unable to proceed. Total Distribution percentage should be equal to 100% and a maximum of 3 Variance.',
						status: 'danger',
					};
					setAlertMessage(alertLabel);
				} else {
					setVarianceList(updated);
					setVarianceLocalList(updated);
				}
			}

			if (isValidEdit) {
				setShowModal(false);
				alertLabel = {hasAlert: false, message: '', status: ''};
				setAlertMessage(alertLabel);
				setVarianceName('');
				setPercentage('');
			}
		}
	};

	const onChangeVarianceName = (val: string) => {
		setVarianceName(val);
	};

	const onChangeDistributionPercentage = (val: string) => {
		if ((parseInt(val) <= 100 && parseInt(val) > 0) || val == '') {
			setPercentage(val);
		}
	};

	const columnDefs : (ColDef<SegmentVarianceModel> | ColGroupDef<SegmentVarianceModel>)[] = 	[
		{headerName: 'No', valueGetter: (params) => {
			const rowIndex = params.node?.rowIndex ?? -1; // Default to -1 if undefined
			return rowIndex >= 0 ? rowIndex + 1 : null; // Return ID if rowIndex is valid
		  }, width: 70},
		{headerName: 'Variance Name', field: 'varianceName', width: 200},
		{headerName: 'Distribution %', field: 'percentage', width: 150},
		{
			headerName: 'Actions',
			width: 100,
			cellRenderer: (params: any) => (
				<>
					<ButtonGroup aria-label='Basic example'>
						<div className='d-flex justify-content-center flex-shrink-0'>
							{(userAccess.includes(USER_CLAIMS.SegmentationWrite) || userAccess.includes(USER_CLAIMS.CreateSegmentationWrite)) && (
								<div className='me-4'>
									<TableIconButton
										access={true}
										faIcon={faPencilAlt}
										toolTipText={'Edit'}
										onClick={() => handleEditVariance(params.rowIndex, params.data)}
										isDisable={disable}
									/>
								</div>
							)}
							{(userAccess.includes(USER_CLAIMS.SegmentationWrite) || userAccess.includes(USER_CLAIMS.CreateSegmentationWrite)) && (
								<div className='me-4'>
									<TableIconButton
										access={true}
										faIcon={faTrash}
										toolTipText={'Remove'}
										iconColor={!disable ? 'text-danger' : ''}
										onClick={() => handleRemoveVariance(params.data.varianceName)}
										isDisable={disable}
									/>
								</div>
							)}
						</div>
					</ButtonGroup>
				</>
			),
		},
	];

	const tableLoader = (data: any) => {
		return (
			<div className='ag-custom-loading-cell' style={{paddingLeft: '10px', lineHeight: '25px'}}>
				<i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
			</div>
		);
	};

	const onGridReady = (params: any) => {
		setGridApi(params.api);
		setGridColumnApi(params.columnApi);
		params.api.sizeColumnsToFit();
	};

	return (
        (<FormGroupContainer>
            <ButtonsContainer>
				<BorderedPlusButton
					access={userAccess.includes(USER_CLAIMS.SegmentationRead) || userAccess.includes(USER_CLAIMS.SegmentationWrite)}
					label={'Variance'}
					onClick={() => handleAddVariance()}
					color={'#009EF7'}
					style={'padding-left:0px;'}
					disabled={varianceLocalList.length >= 3 || disable}
				/>
			</ButtonsContainer>
            <div className='ag-theme-quartz' style={{height: 190, width: 570, marginBottom: '50px'}}>
				<AgGridReact
					rowData={varianceLocalList}
					defaultColDef={{
						resizable: false,
					}}
					components={{
						tableLoader: tableLoader,
					}}
					onGridReady={onGridReady}
					rowBuffer={0}
					//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
					columnDefs={columnDefs}
				/>
			</div>
            <Modal
				show={showModal}
				//size=  {'lg'}
				aria-labelledby='contained-modal-title-vcenter'
				centered
			>
				<Modal.Header>
					<Modal.Title id='contained-modal-title-vcenter'>{actionTitle} Variance</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<AlertLabel alert={alertMessage} />
					<div className='d-flex p-2 bd-highlight'>
						<div className='col-sm-5'>
							<label className='form-label-sm m-2 required'>Variance Name</label>
						</div>
						<div className='col-sm-6'>
							<input
								type='text'
								className='form-control form-control-sm'
								onChange={(event) => onChangeVarianceName(event.target.value)}
								value={varianceName}
							/>
						</div>
					</div>
					<div className='d-flex p-2 bd-highlight'>
						<div className='col-sm-5'>
							<label className='form-label-sm m-2 required'>Distribution %</label>
						</div>
						<div className='col-sm-6'>
							<input
								type='number'
								className='form-control form-control-sm'
								onChange={(event) => onChangeDistributionPercentage(event.target.value)}
								value={percentage}
								onKeyPress={(event) => {
									if (!/[0-9]/.test(event.key)) {
										event.preventDefault();
									}
								}}
							/>
						</div>
					</div>
				</Modal.Body>
				<ModalFooter style={{border: 0}}>
					<MlabButton
						access={true}
						size={'sm'}
						label={'Submit'}
						style={ElementStyle.primary}
						type={'submit'}
						weight={'solid'}
						disabled={varianceName.length === 0 || percentage.length === 0}
						onClick={() => _submit()}
					/>
					<MlabButton
						access={true}
						size={'sm'}
						label={'Close'}
						style={ElementStyle.secondary}
						type={'submit'}
						weight={'solid'}
						onClick={() => _close()}
					/>
				</ModalFooter>
			</Modal>
        </FormGroupContainer>)
    );
};
