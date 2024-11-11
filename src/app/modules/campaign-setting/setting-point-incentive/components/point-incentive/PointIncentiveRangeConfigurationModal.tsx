import {useFormik} from 'formik';
import React, {useEffect, useState} from 'react';
import {ModalFooter} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import swal from 'sweetalert';
import {RootState} from '../../../../../../setup';
import {
	ContentContainer,
	DefaultPrimaryButton,
	DefaultSecondaryButton,
	FormContainer,
	FormGroupContainer,
	FormModal,
	MainContainer,
} from '../../../../../custom-components';
import {USER_CLAIMS} from '../../../../user-management/components/constants/UserClaims';
import * as campaignSetting from '../../../redux/AutoTaggingRedux';
import {PointToValueListModel} from '../../models/PointToValueListModel';
import {PointIncentiveDetailsByIdResponseModel} from '../../models/response/PointIncentiveDetailsByIdResponseModel';

interface Props {
	showForm: boolean;
	closeModal: () => void;
	showHeader: boolean;
	actionTitle: string;
	selectedId?: any;
	dataModal?: any;
}

interface FormValues {
	pointToIncentiveRangeConfigurationId: any;
	campaignSettingId?: number;
	incentiveValueAmount?: number;
	currencyId?: number;
	rangeNo?: number;
	validPointAmountFrom?: string;
	validPointAmountTo?: string;
}

const initialValues: FormValues = {
	pointToIncentiveRangeConfigurationId: 0,
	campaignSettingId: 0,
	incentiveValueAmount: undefined,
	currencyId: undefined,
	rangeNo: undefined,
	validPointAmountFrom: undefined,
	validPointAmountTo: undefined,
};

const InititialValues = {
	pointToIncentiveRangeConfigurationId: 0,
	campaignSettingId: 0,
	rangeNo: 0,
	incentiveValueAmount: 0,
	validPointAmountFrom: 0,
	validPointAmountTo: 0,
	createdBy: 0,
	updatedBy: 0,
};

const PointIncentiveRangeConfigurationModal: React.FC<Props> = ({showForm, closeModal, actionTitle, selectedId, dataModal}) => {
	// GET REDUX STORE
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const postData = useSelector<RootState>(({system}) => system.postMessageResponseList, shallowEqual) as any;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	const pointIncentiveDetailsByIdState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getPointIncentiveDetailsById,
		shallowEqual
	) as PointIncentiveDetailsByIdResponseModel;

	const getPointToValueConfigListState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getPointToValueConfigList,
		shallowEqual
	) as PointToValueListModel[];

	// STATES
	const [loading, setLoading] = useState<boolean>(false);
	const [submitDisable, setSubmitDisable] = useState<boolean>(true);
	const [rangeConfigurationId, setRangeConfigurationId] = useState(selectedId);
	const [selectedConfigDetails, setSelectedConfigDetails] = useState(dataModal);
	const [validPointAmountTo, setPointAmountTo] = useState<any>();
	const [validPointAmountFrom, setPointAmountFrom] = useState<any>();
	const [incentivePointAmount, setIncentivePointAmount] = useState<any>();
	const dispatch = useDispatch();

	// FORMIK FORM POST
	const ADD = 'Add';
	const EDIT = 'Edit';
	const VIEW = 'View';

	// METHODS
	const closeModalForm = () => {
		if (actionTitle != VIEW) {
			swal({
				title: 'Confirmation',
				text: 'Any changes will be discarded, please confirm',
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			}).then((willClose) => {
				if (willClose) {
					closeModal();
					formik.resetForm();
					clearData();
				}
			});
		} else {
			closeModal();
			formik.resetForm();
			clearData();
		}
	};

	const clearData = () => {
		initialValues.incentiveValueAmount = undefined;
		initialValues.validPointAmountFrom = undefined;
		initialValues.validPointAmountTo = undefined;

		formik.setFieldValue('incentiveValueAmount', undefined);
		formik.setFieldValue('validPointAmountFrom', undefined);
		formik.setFieldValue('validPointAmountTo', undefined);

		setPointAmountFrom('');
		setPointAmountTo('');
		setIncentivePointAmount('');
	};

	const assignValues = () => {
		let highestRangeNo = Math.max(...getPointToValueConfigListState.map((o: any) => o.rangeNo));
		highestRangeNo = highestRangeNo > 0 ? highestRangeNo : 0;

		if (dataModal != undefined) {
			initialValues.rangeNo = dataModal.rangeNo;
			initialValues.incentiveValueAmount = dataModal.incentiveValueAmount;
			initialValues.validPointAmountFrom = dataModal.validPointAmountFrom;
			initialValues.validPointAmountTo = dataModal.validPointAmountTo;

			//set formik fields
			const assignedRange = dataModal.rangeNo != undefined && (actionTitle == EDIT || actionTitle == VIEW) ? dataModal.rangeNo : highestRangeNo + 1;
			formik.setFieldValue('rangeNo', assignedRange);
			formik.setFieldValue('incentiveValueAmount', dataModal.incentiveValueAmount);
			formik.setFieldValue('validPointAmountFrom', dataModal.validPointAmountFrom);
			formik.setFieldValue('validPointAmountTo', dataModal.validPointAmountTo);

			setPointAmountFrom(dataModal.validPointAmountFrom.toString());
			setPointAmountTo(dataModal.validPointAmountTo.toString());
			setIncentivePointAmount(dataModal.incentiveValueAmount.toString());
		} else {
			formik.setFieldValue('rangeNo', highestRangeNo + 1);
			clearData();
			resetTouchForm();
		}
	};

	const resetTouchForm = () => {
		formik.touched.incentiveValueAmount = false;
		formik.touched.validPointAmountFrom = false;
		formik.touched.validPointAmountTo = false;
		formik.dirty = false;
	};

	useEffect(() => {
		if (showForm) {
			assignValues();
		}
	}, [showForm]);

	const formik = useFormik({
		initialValues,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {
			//validations
			let isValid = true;
			let pointAmountFromValidator = values.validPointAmountFrom != undefined ? parseFloat(values.validPointAmountFrom) : 0;
			let pointAmountToValidator = values.validPointAmountTo != undefined ? parseFloat(values.validPointAmountTo) : 0;

			let incentiveAmount = incentivePointAmount[incentivePointAmount.length - 1] === '.' ? incentivePointAmount.slice(0, -1) : incentivePointAmount;
			values.incentiveValueAmount = incentiveAmount;

			const tempExist = getPointToValueConfigListState.filter((exist: any) => {
				return !(exist.incentiveValueAmount == values.incentiveValueAmount && exist.rangeNo == values.rangeNo);
			});
			const isExist = tempExist.filter((exist: any) => {
				return exist.incentiveValueAmount == values.incentiveValueAmount;
			});

			//validate from and to - overlap

			const isOverlap = getPointToValueConfigListState.some((exist: any) => {
				return (
					((pointAmountFromValidator <= parseFloat(exist.validPointAmountTo) && pointAmountFromValidator >= parseFloat(exist.validPointAmountFrom)) ||
						(pointAmountToValidator >= parseFloat(exist.validPointAmountFrom) && pointAmountToValidator <= parseFloat(exist.validPointAmountTo))) &&
					exist.rangeNo != values.rangeNo
				);
			});

			if (!formik.values.incentiveValueAmount || !formik.values.validPointAmountFrom || !formik.values.validPointAmountTo) {
				swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error');

				isValid = false;
			} else if (pointAmountToValidator < pointAmountFromValidator) {
				swal('Failed', 'Unable to add the Range, Valid Point Amount To must be greater than Valid Point Amount From', 'error');
				isValid = false;
			} else if (isExist.length > 0 || isOverlap) {
				const errorMsg =
					isExist.length > 0
						? 'Unable to add the Range, Incentive Value Amount already existed'
						: 'Unable to add the Range, Valid Point Amount From and To is overlapped with existing Ranges';
				swal('Failed', errorMsg, 'error');
				isValid = false;
			}

			if (isValid) {
				let validPointAmountFromTemp =
					validPointAmountFrom[validPointAmountFrom.length - 1] === '.' ? validPointAmountFrom.slice(0, -1) : validPointAmountFrom;
				let validPointAmountToTemp = validPointAmountTo[validPointAmountTo.length - 1] === '.' ? validPointAmountTo.slice(0, -1) : validPointAmountTo;

				if (actionTitle == ADD) {
					let point: PointToValueListModel = {
						pointToIncentiveRangeConfigurationId:
							values.pointToIncentiveRangeConfigurationId != undefined ? values.pointToIncentiveRangeConfigurationId : 0,
						campaignSettingId: pointIncentiveDetailsByIdState != undefined ? pointIncentiveDetailsByIdState.campaignSettingId : 0,
						currencyId: 0,
						rangeNo: values.rangeNo,
						incentiveValueAmount: values.incentiveValueAmount,
						validPointAmountFrom: validPointAmountFromTemp,
						validPointAmountTo: validPointAmountToTemp,
					};

					let newPointIncentiveData = Object.assign(new Array<PointToValueListModel>(), point);
					dispatch(campaignSetting.actions.getPointToValueConfigList([...getPointToValueConfigListState, newPointIncentiveData]));
				} else {
					let updated = getPointToValueConfigListState.filter((x) => x.rangeNo != values.rangeNo);

					let point: PointToValueListModel = {
						pointToIncentiveRangeConfigurationId:
							values.pointToIncentiveRangeConfigurationId != undefined ? values.pointToIncentiveRangeConfigurationId : 0,
						campaignSettingId: pointIncentiveDetailsByIdState != undefined ? pointIncentiveDetailsByIdState.campaignSettingId : 0,
						currencyId: 0,
						rangeNo: values.rangeNo,
						incentiveValueAmount: values.incentiveValueAmount,
						validPointAmountFrom: validPointAmountFromTemp,
						validPointAmountTo: validPointAmountToTemp,
					};
					updated.push(point);
					dispatch(campaignSetting.actions.getPointToValueConfigList(updated));
				}
				clearData();
				closeModal();
			}
		},
	});

	const enforceNumberValidation = (e: any) => {
		var value: string = (document.getElementById('pointAmount') as HTMLInputElement).value;
		if (
			(value.length > 6 && e.keyCode !== 8 && e.keyCode !== 46 && e.keyCode != 37 && e.keyCode != 38 && e.keyCode != 39 && e.keyCode != 40) ||
			e.keyCode === 190
		) {
			e.preventDefault();
		}
	};

	const handleDecimalInputValidation = (e: any, field: any) => {
		const decimalRangeRegExp = /^(\d{0,7})(\.\d{0,2})?$/;
		let value = e.target?.value;

		let finalValue;
		if (value.match(decimalRangeRegExp)) {
			let first, second;
			let spliceNumber = value.toString().split('.');

			//if has decimal
			if (spliceNumber.length > 1) {
				first = spliceNumber[0].slice(0, 7); //for whole numbers
				second = spliceNumber[1].slice(0, 2); //for decimal

				finalValue = first + '.' + second;
			} //no decimal
			else {
				finalValue = value.slice(0, 7);
			}

			if (field == 'To') {
				setPointAmountTo(finalValue);
				formik.setFieldValue('validPointAmountTo', finalValue); //formik dependency
			} else if (field == 'From') {
				setPointAmountFrom(finalValue);
				formik.setFieldValue('validPointAmountFrom', finalValue); //formik dependency
			} else {
				setIncentivePointAmount(finalValue);
				formik.setFieldValue('incentiveValueAmount', finalValue); //formik dependency
			}
		}
	};

	return (
		<FormModal headerTitle={actionTitle + ' Range Configuration'} haveFooter={false} show={showForm}>
			<FormContainer onSubmit={formik.handleSubmit}>
				<MainContainer>
					<ContentContainer>
						<FormGroupContainer>
							<label className='col-form-label text-right col-lg-3 col-sm-12'>Range No</label>
							<div className='col-lg-9 col-md-9 col-sm-12  mb-5'>
								<div className='input-group'>
									<input
										type='text'
										className='form-control form-control-sm'
										aria-label='Range No'
										disabled={true}
										{...formik.getFieldProps('rangeNo')}
									/>
								</div>
							</div>
						</FormGroupContainer>

						<FormGroupContainer>
							<label className='col-form-label text-right col-lg-3 col-sm-12'>Incentive Value Amount</label>
							<div className='col-lg-9 col-md-9 col-sm-12  mb-5'>
								<div className='input-group'>
									<input
										type='text'
										className={'form-control form-control-sm'}
										autoComplete='off'
										id='pointAmount'
										aria-label='Incentive point Amount'
										disabled={actionTitle === VIEW}
										{...formik.getFieldProps('incentiveValueAmount')}
										placeholder='0.00'
										maxLength={10}
										onChange={(e) => {
											handleDecimalInputValidation(e, 'pointAmount');
										}}
									/>
								</div>
							</div>
						</FormGroupContainer>

						<FormGroupContainer>
							<div className='col-form-label text-right col-sm-3'>
								<label>Valid Point Amount From</label>
							</div>
							<div className='col-sm-3'>
								<input
									type='text'
									className={'form-control form-control-sm'}
									autoComplete='off'
									aria-label='Valid Point Amount From'
									disabled={actionTitle === VIEW}
									{...formik.getFieldProps('validPointAmountFrom')}
									placeholder='0.00'
									maxLength={10}
									onChange={(e) => {
										handleDecimalInputValidation(e, 'From');
									}}
									value={validPointAmountFrom}
								/>
							</div>

							<div className='col-sm-2 col-form-label text-center'>
								<label>To</label>
							</div>

							<div className='col-sm-4'>
								<input
									type='text'
									className={'form-control form-control-sm'}
									autoComplete='off'
									aria-label='Valid Point Amount To'
									disabled={actionTitle === VIEW}
									{...formik.getFieldProps('validPointAmountTo')}
									placeholder='0.00'
									maxLength={10}
									onChange={(e) => {
										handleDecimalInputValidation(e, 'To');
									}}
									value={validPointAmountTo}
								/>
							</div>
						</FormGroupContainer>
					</ContentContainer>
				</MainContainer>
				<ModalFooter style={{border: 0, float: 'right'}}>
					<DefaultPrimaryButton
						title={'Submit'}
						access={userAccess.includes(USER_CLAIMS.UpdateIncentiveSettingWrite)}
						isDisable={actionTitle === VIEW}
						onClick={formik.submitForm}
					/>
					<DefaultSecondaryButton
						access={userAccess.includes(USER_CLAIMS.UpdateIncentiveSettingRead)}
						title={'Close'}
						onClick={closeModalForm}
						isDisable={false}
					/>
				</ModalFooter>
			</FormContainer>
		</FormModal>
	);
};

export default PointIncentiveRangeConfigurationModal;
