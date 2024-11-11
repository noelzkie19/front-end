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
import {GoalParameterListModel} from '../../models/GoalParameterListModel';
import {PointIncentiveDetailsByIdResponseModel} from '../../models/response/PointIncentiveDetailsByIdResponseModel';

interface Props {
	showForm: boolean;
	closeModal: () => void;
	showHeader: boolean;
	actionTitle: string;
	selectedId?: any;
	dataModal?: any;
	selectedCurrency?: any;
	currencyId?: any;
}

interface FormValues {
	pointToIncentiveRangeConfigurationId: any;
	campaignSettingId?: number;
	currencyId?: number;
	rangeNo?: number;
	currency?: number;
	currencyName: string;
	pointAmount?: number;
	rangeFrom?: string;
	rangeTo?: string;
}

const initialValues: FormValues = {
	pointToIncentiveRangeConfigurationId: 0,
	campaignSettingId: 0,
	currencyId: undefined,
	currencyName: '',
	rangeNo: undefined,
	currency: undefined,
	pointAmount: undefined,
	rangeFrom: undefined,
	rangeTo: undefined,
};

const InititialValues = {
	pointToIncentiveRangeConfigurationId: 0,
	campaignSettingId: 0,
	currencyId: 0,
	rangeNo: 0,
	pointAmount: 0,
	rangeFrom: 0,
	rangeTo: 0,
	createdBy: 0,
	updatedBy: 0,
};

const GoalParameterRangeConfigurationModal: React.FC<Props> = ({
	selectedCurrency,
	showForm,
	closeModal,
	actionTitle,
	selectedId,
	dataModal,
	currencyId,
}) => {
	// GET REDUX STORE
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const postData = useSelector<RootState>(({system}) => system.postMessageResponseList, shallowEqual) as any;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	const pointIncentiveDetailsByIdState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getPointIncentiveDetailsById,
		shallowEqual
	) as PointIncentiveDetailsByIdResponseModel;

	const getGoalParameterConfigListState = useSelector<RootState>(
		({campaignSetting}) => campaignSetting.getGoalParametersConfigList,
		shallowEqual
	) as GoalParameterListModel[];

	// STATES
	const [loading, setLoading] = useState<boolean>(false);
	const [submitDisable, setSubmitDisable] = useState<boolean>(true);
	const [rangeTo, setRangeTo] = useState<any>();
	const [rangeFrom, setRangeFrom] = useState<any>();

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
		initialValues.pointAmount = undefined;
		initialValues.rangeFrom = undefined;
		initialValues.rangeTo = undefined;

		formik.setFieldValue('rangeFrom', undefined);
		formik.setFieldValue('rangeTo', undefined);
		formik.setFieldValue('pointAmount', undefined);
		setRangeFrom('');
		setRangeTo('');
	};

	const assignValues = () => {
		let highestRangeNo = Math.max(
			...getGoalParameterConfigListState
				.filter((i: any) => i.currencyId == currencyId)
				.map((j: any) => {
					return j.rangeNo;
				})
		);
		highestRangeNo = highestRangeNo > 0 ? highestRangeNo : 0;

		if (dataModal != undefined && showForm && actionTitle != ADD) {
			initialValues.rangeNo = dataModal.rangeNo;
			initialValues.currency = currencyId;
			initialValues.pointAmount = dataModal.incentiveValueAmount;
			initialValues.rangeFrom = dataModal.validPointAmountFrom;
			initialValues.rangeTo = dataModal.validPointAmountTo;

			const assignedRange = dataModal.rangeNo != undefined && (actionTitle == EDIT || actionTitle == VIEW) ? dataModal.rangeNo : highestRangeNo + 1;
			formik.setFieldValue('rangeNo', assignedRange);
			formik.setFieldValue('currencyId', currencyId);
			formik.setFieldValue('currencyName', selectedCurrency);
			formik.setFieldValue('pointAmount', dataModal.pointAmount);
			formik.setFieldValue('rangeFrom', dataModal.rangeFrom);
			formik.setFieldValue('rangeTo', dataModal.rangeTo);

			setRangeFrom(dataModal.rangeFrom.toString());
			setRangeTo(dataModal.rangeTo.toString());
		} else {
			formik.setFieldValue('rangeNo', highestRangeNo + 1);
			formik.setFieldValue('currencyId', currencyId);
			formik.setFieldValue('currencyName', selectedCurrency);
			clearData();
			resetTouchForm();
		}
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
			let rangeFromValidator = values.rangeFrom != undefined ? parseFloat(values.rangeFrom) : 0;
			let rangeToValidator = values.rangeTo != undefined ? parseFloat(values.rangeTo) : 0;

			const isExist = getGoalParameterConfigListState.filter((exist: any) => {
				return exist.pointAmount == values.pointAmount && exist.currencyName == values.currencyName && exist.rangeNo != values.rangeNo;
			});

			const isOverlap = getGoalParameterConfigListState.some((exist: any) => {
				return (
					((rangeFromValidator <= parseFloat(exist.rangeTo) && rangeFromValidator >= parseFloat(exist.rangeFrom)) ||
						(rangeToValidator >= parseFloat(exist.rangeFrom) && rangeToValidator <= parseFloat(exist.rangeTo))) &&
					exist.currencyName == values.currencyName &&
					exist.rangeNo != values.rangeNo
				);
			});

			if (!formik.values.pointAmount || !formik.values.rangeFrom || !formik.values.rangeTo) {
				swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error');
				isValid = false;
			} else if (rangeToValidator < rangeFromValidator) {
				swal('Failed', 'Unable to add the Range, Range To must be greater than Range From', 'error');
				isValid = false;
			} else if (isExist.length > 0 || isOverlap) {
				const errorMsg =
					isExist.length > 0
						? 'Unable to add the Range, Point amount already existed on this currency'
						: 'Unable to add the Range, Range amount From and To is overlapped with existing Ranges on this currency';
				swal('Failed', errorMsg, 'error');
				isValid = false;
			}

			if (isValid) {
				let rangeFromTemp = rangeFrom[rangeFrom.length - 1] === '.' ? rangeFrom.slice(0, -1) : rangeFrom;
				let rangeToTemp = rangeTo[rangeTo.length - 1] === '.' ? rangeTo.slice(0, -1) : rangeTo;

				if (actionTitle == ADD) {
					let goal: GoalParameterListModel = {
						goalParameterRangeConfigurationId:
							values.pointToIncentiveRangeConfigurationId != undefined ? values.pointToIncentiveRangeConfigurationId : 0,
						campaignSettingId: pointIncentiveDetailsByIdState != undefined ? pointIncentiveDetailsByIdState.campaignSettingId : 0,
						currencyId: currencyId,
						currencyName: values.currencyName,
						rangeNo: values.rangeNo,
						pointAmount: values.pointAmount,
						rangeFrom: rangeFromTemp,
						rangeTo: rangeToTemp,
					};

					let newGoalData = Object.assign(new Array<GoalParameterListModel>(), goal);
					dispatch(campaignSetting.actions.getGoalParametersConfigList([...getGoalParameterConfigListState, newGoalData]));
				} else {
					const goalExisting = getGoalParameterConfigListState.filter((x: any) => {
						return !(x.currencyName == selectedCurrency && x.rangeNo == values.rangeNo);
					});

					let goal: GoalParameterListModel = {
						goalParameterRangeConfigurationId:
							values.pointToIncentiveRangeConfigurationId != undefined ? values.pointToIncentiveRangeConfigurationId : 0,
						campaignSettingId: pointIncentiveDetailsByIdState.campaignSettingId == undefined ? 0 : pointIncentiveDetailsByIdState.campaignSettingId,
						currencyId: currencyId,
						currencyName: values.currencyName,
						rangeNo: values.rangeNo,
						pointAmount: values.pointAmount,
						rangeFrom: rangeFromTemp,
						rangeTo: rangeToTemp,
					};

					goalExisting.push(goal);
					dispatch(campaignSetting.actions.getGoalParametersConfigList(goalExisting));
				}

				clearData();
				closeModal();
			}
		},
	});

	const resetTouchForm = () => {
		formik.touched.pointAmount = false;
		formik.touched.rangeFrom = false;
		formik.touched.rangeTo = false;
		formik.dirty = false;
	};

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
				setRangeTo(finalValue);
				formik.setFieldValue('rangeTo', finalValue); //formik dependency
			} else {
				setRangeFrom(finalValue);
				formik.setFieldValue('rangeFrom', finalValue); //formik dependency
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
							<label className='col-form-label text-right col-lg-3 col-sm-12'>Currency</label>
							<div className='col-lg-9 col-md-9 col-sm-12  mb-5'>
								<div className='input-group'>
									<input
										type='text'
										className='form-control form-control-sm'
										aria-label='Currency'
										disabled={true}
										{...formik.getFieldProps('currencyName')}
									/>
								</div>
							</div>
						</FormGroupContainer>

						<FormGroupContainer>
							<label className='col-form-label text-right col-lg-3 col-sm-12'>Point Amount</label>
							<div className='col-lg-9 col-md-9 col-sm-12  mb-5'>
								<div className='col-sm-12'>
									<input
										type='number'
										className='form-control form-control-sm'
										id='pointAmount'
										onKeyDown={enforceNumberValidation}
										autoComplete='off'
										aria-label='Point Amount'
										disabled={actionTitle === VIEW}
										{...formik.getFieldProps('pointAmount')}
										placeholder='0'
									/>
								</div>
							</div>
						</FormGroupContainer>

						<FormGroupContainer>
							<div className='col-form-label text-right col-sm-3'>
								<label>Range From</label>
							</div>
							<div className='col-sm-3'>
								<input
									type='text'
									className='form-control form-control-sm'
									autoComplete='off'
									aria-label='Range From'
									id='rangeFrom'
									disabled={actionTitle === VIEW}
									{...formik.getFieldProps('rangeFrom')}
									placeholder='0.00'
									onChange={(e) => {
										handleDecimalInputValidation(e, 'From');
									}}
									value={rangeFrom}
								/>
							</div>

							<div className='col-sm-2 col-form-label text-center'>
								<label>Range To</label>
							</div>

							<div className='col-sm-4'>
								<input
									type='text'
									id='rangeTo'
									className='form-control form-control-sm'
									autoComplete='off'
									aria-label='Range To'
									disabled={actionTitle === VIEW}
									{...formik.getFieldProps('rangeTo')}
									placeholder='0.00'
									maxLength={10}
									onChange={(e) => {
										handleDecimalInputValidation(e, 'To');
									}}
									value={rangeTo}
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

export default GoalParameterRangeConfigurationModal;
