import {useFormik} from 'formik';
import React, {useEffect, useState} from 'react';
import {Container} from 'react-bootstrap';
import {Col, ModalFooter, Row} from 'react-bootstrap-v5';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import Select from 'react-select';
import * as Yup from 'yup';
import {RootState} from '../../../../../setup';
import {MessageStatusOptionModel, OptionListModel} from '../../../../common/model';
import {GetMessageStatusOptionById} from '../../../../common/services';
import {DefaultPrimaryButton, DefaultSecondaryButton, FormContainer, FormModal} from '../../../../custom-components';
import {useCurrenciesWithCode, useMasterReferenceOption, useMessageTypeOptions} from '../../../../custom-functions';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';

const initialValues = {};

const FormSchema = Yup.object().shape({
	name: Yup.string(),
});

interface Props {
	showFormView: boolean;
	closeModal: () => void;
	goalTypeName: string;
	campaignSettingId: number;
	goalTypeGuidId: string;
}

const ViewGoalTypeConfigModal: React.FC<Props> = ({showFormView, closeModal, goalTypeName, campaignSettingId, goalTypeGuidId}) => {
	//  Get redux store
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;

	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	const goalTypeCommnunicationRecordDepositListData = useSelector<RootState>(
		({campaignGoalSetting}) => campaignGoalSetting.goalTypeCommnunicationRecordDepositList,
		shallowEqual
	) as any;
	const goalTypeCommunicationRecordListData = useSelector<RootState>(
		({campaignGoalSetting}) => campaignGoalSetting.goalTypeCommunicationRecordList,
		shallowEqual
	) as any;
	const goalTypeDepositListData = useSelector<RootState>(({campaignGoalSetting}) => campaignGoalSetting.goalTypeDepositList, shallowEqual) as any;
	const goalTypeDepositCurrencyListData = useSelector<RootState>(
		({campaignGoalSetting}) => campaignGoalSetting.goalTypeDepositCurrencyList,
		shallowEqual
	) as any;

	//  States
	const [loading, setLoading] = useState<boolean>(false);
	const [hasErrors, setHasErrors] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [sequence, setSequence] = useState<string | any>('');
	const [goalType, setGoalType] = useState<string | any>('');
	const [goalTypeOption, setGoalTypeOption] = useState<string | any>('');
	const [messageType, setMessageType] = useState<string | any>('');
	const [messageStatus, setMessageStatus] = useState<string | any>('');
	const [commRecordDataSource, setCommRecordDataSource] = useState<string | any>('');
	const [commRecordPeriod, setCommRecordPeriod] = useState<string | any>('');
	const [transactionType, setTransactionType] = useState<string | any>('');
	const [depositDataSource, setDepositDataSource] = useState<string | any>('');
	const [depositPeriod, setDepositPeriod] = useState<string | any>('');
	const [messageTypeId, setMessageTypeId] = useState<number>(0);
	const [messageStatusOptionList, setMessageStatusOptionList] = useState<Array<OptionListModel>>([]);
	const [dateSourceOptionFilter, setDateSourceOptionFilter] = useState<number | any>(0);

	const messageTypeOptions = useMessageTypeOptions();
	const currencyList = useCurrenciesWithCode();

	const masterReference = useMasterReferenceOption('36,53,60,64,51,67,69,160');

	const dispatch = useDispatch();
	const dateSourceFTDId = 67;
	const dateSourceInitDepositId = 160;
	const communicationDataSourceMRPId = 60;
	const communicationPeriodMRPId = 64;
	const goalTypeTransactionTypeMRPId = 51;
	const depositPeriodMRPId = 69;
	const sequenceMRPId = 53;
	const goalTypeMRPId = 36;

	const initialDepositId = '72';
	const firstTimeDepositId = '52';
	const updatedDateId = '153';
	const firstTimeDepositDateId = '68';

	const COMMUNITCATION_RECORD = 'Communication Record';
	//  Watcher
	useEffect(() => {
		setLoading(false);
		setHasErrors(false);
		setErrorMessage('');

		if (showFormView === true) {
			_getMessageStatus();
			_displayCommRecordDepositData();
		}
	}, [showFormView]);

	useEffect(() => {
		if (transactionType != '') {
			let dateSourceOption: any, dateSourceSelected: any;
			if (transactionType.value === initialDepositId) {
				dateSourceOption = dateSourceInitDepositId;
				dateSourceSelected = updatedDateId;
			} else if (transactionType.value === firstTimeDepositId) {
				dateSourceOption = dateSourceFTDId;
				dateSourceSelected = firstTimeDepositDateId;
			}

			setDateSourceOptionFilter(dateSourceOption);
			setDepositDataSource(
				masterReference
					.filter((obj) => obj.masterReferenceParentId == dateSourceOption)
					.map((obj) => obj.options)
					.find((op) => op.value === dateSourceSelected)
			);
		} else {
			setDateSourceOptionFilter(0);
		}
	}, [transactionType]);

	const _getMessageStatus = () => {
		let paramSelectedMessageStatusId: number = parseInt(
			goalTypeCommunicationRecordListData
				.filter((x: any) => x.communicationGuid === goalTypeGuidId)
				.map((x: any) => x.messageTypeId)
				.toString()
		);
		GetMessageStatusOptionById(paramSelectedMessageStatusId)
			.then((response) => {
				if (response.status === 200) {
					let messageStatus = Object.assign(new Array<MessageStatusOptionModel>(), response.data);

					let tempList = Array<OptionListModel>();
					messageStatus.forEach((item) => {
						const OptionValue: OptionListModel = {
							value: item.messageStatusId,
							label: item.messageStatusName,
						};
						tempList.push(OptionValue);
					});

					setMessageStatusOptionList(tempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));

					setMessageStatus(
						tempList.find(
							(obj) =>
								obj.value ===
								goalTypeCommunicationRecordListData
									.filter((x: any) => x.communicationGuid === goalTypeGuidId)
									.map((x: any) => x.messageStatusId)
									.toString()
						)
					);
				} else {
					console.log('Problem in curremcy brand list');
				}
			})
			.catch(() => {
				console.log('Problem in curremcy brand list');
			});
	};

	//  Methods
	const _displayCommRecordDepositData = () => {
		if (goalTypeName === COMMUNITCATION_RECORD) {
			setSequence(
				masterReference
					.filter((obj) => obj.masterReferenceParentId === sequenceMRPId)
					.map((obj) => obj.options)
					.find(
						(obj) =>
							obj.value ===
							goalTypeCommunicationRecordListData
								.filter((x: any) => x.communicationGuid === goalTypeGuidId)
								.map((x: any) => x.sequenceId)
								.toString()
					)
			);
			setGoalType(
				masterReference
					.filter((obj) => obj.masterReferenceParentId === goalTypeMRPId)
					.map((obj) => obj.options)
					.find(
						(obj) =>
							obj.value ===
							goalTypeCommunicationRecordListData
								.filter((x: any) => x.communicationGuid === goalTypeGuidId)
								.map((x: any) => x.goalTypeId)
								.toString()
					)
			);
			setMessageType(
				messageTypeOptions.find(
					(obj) =>
						obj.value ===
						goalTypeCommunicationRecordListData
							.filter((x: any) => x.communicationGuid === goalTypeGuidId)
							.map((x: any) => x.messageTypeId)
							.toString()
				)
			);
			setCommRecordDataSource(
				masterReference
					.filter((obj) => obj.masterReferenceParentId == communicationDataSourceMRPId)
					.map((obj) => obj.options)
					.find(
						(obj) =>
							obj.value ===
							goalTypeCommunicationRecordListData
								.filter((x: any) => x.communicationGuid === goalTypeGuidId)
								.map((x: any) => x.goalTypeDataSourceId)
								.toString()
					)
			);
			setCommRecordPeriod(
				masterReference
					.filter((obj) => obj.masterReferenceParentId == communicationPeriodMRPId)
					.map((obj) => obj.options)
					.find(
						(obj) =>
							obj.value ===
							goalTypeCommunicationRecordListData
								.filter((x: any) => x.communicationGuid === goalTypeGuidId)
								.map((x: any) => x.goalTypePeriodId)
								.toString()
					)
			);
		} else {
			setSequence(
				masterReference
					.filter((obj) => obj.masterReferenceParentId === sequenceMRPId)
					.map((obj) => obj.options)
					.find(
						(obj) =>
							obj.value ===
							goalTypeDepositListData
								.filter((x: any) => x.depositGuid === goalTypeGuidId)
								.map((x: any) => x.sequenceId)
								.toString()
					)
			);
			setGoalType(
				masterReference
					.filter((obj) => obj.masterReferenceParentId === goalTypeMRPId)
					.map((obj) => obj.options)
					.find(
						(obj) =>
							obj.value ===
							goalTypeDepositListData
								.filter((x: any) => x.depositGuid === goalTypeGuidId)
								.map((x: any) => x.goalTypeId)
								.toString()
					)
			);
			setTransactionType(
				masterReference
					.filter((obj) => obj.masterReferenceParentId == goalTypeTransactionTypeMRPId)
					.map((obj) => obj.options)
					.find(
						(obj) =>
							obj.value ===
							goalTypeDepositListData
								.filter((x: any) => x.depositGuid === goalTypeGuidId)
								.map((x: any) => x.goalTypeTransactionTypeId)
								.toString()
					)
			);
			let dateSourceOption: any, dateSourceSelected: any;
			if (transactionType.value === initialDepositId) {
				dateSourceOption = dateSourceInitDepositId;
				dateSourceSelected = updatedDateId;
			} else if (transactionType.value === firstTimeDepositId) {
				dateSourceOption = dateSourceFTDId;
				dateSourceSelected = firstTimeDepositDateId;
			}

			setDepositDataSource(
				masterReference
					.filter((obj) => obj.masterReferenceParentId == dateSourceOption)
					.map((obj) => obj.options)
					.find(
						(obj) =>
							obj.value ===
							goalTypeDepositListData
								.filter((x: any) => x.depositGuid === goalTypeGuidId)
								.map((x: any) => x.goalTypeDataSourceId)
								.toString()
					)
			);
			setDepositPeriod(
				masterReference
					.filter((obj) => obj.masterReferenceParentId == depositPeriodMRPId)
					.map((obj) => obj.options)
					.find(
						(obj) =>
							obj.value ===
							goalTypeDepositListData
								.filter((x: any) => x.depositGuid === goalTypeGuidId)
								.map((x: any) => x.goalTypePeriodId)
								.toString()
					)
			);
		}
	};

	const onchangeSequence = (val: string | any) => {
		setSequence(val);
	};

	const onchangeMessageType = (val: string | any) => {
		setMessageType(val);
	};

	const onchangeGoalType = (val: string | any) => {
		setGoalType(val);
	};

	const onchangeMessageStatus = (val: string | any) => {
		setMessageStatus(val);
	};

	const onchangeCommRecordDataSource = (val: string | any) => {
		setCommRecordDataSource(val);
	};

	const onchangeCommRecordPeriod = (val: string | any) => {
		setCommRecordPeriod(val);
	};

	const onchangeTransactionType = (val: string | any) => {
		setTransactionType(val);
	};

	const onchangeDepositDataSource = (val: string | any) => {
		setDepositDataSource(val);
	};

	const onchangeDepositPeriod = (val: string | any) => {
		setDepositPeriod(val);
	};

	//  Formik form post
	const formik = useFormik({
		initialValues,
		validationSchema: FormSchema,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {
			setSubmitting(true);
		},
	});

	//  Return element
	return (
		<FormContainer onSubmit={formik.handleSubmit}>
			<FormModal headerTitle={'View Goal Type'} haveFooter={false} show={showFormView}>
				<Container>
					<Row style={{marginTop: 10}}>
						<Col sm={12}>
							<label className='form-label-sm'>Sequence</label>
							<Select
								style={{width: '100%'}}
								options={masterReference.filter((obj) => obj.masterReferenceParentId === sequenceMRPId).map((obj) => obj.options)}
								onChange={onchangeSequence}
								value={sequence}
								isDisabled={true}
							/>
						</Col>
					</Row>
					<Row style={{marginTop: 10}}>
						<Col sm={12}>
							<label className='form-label-sm'>Goal Type</label>
							<Select
								style={{width: '100%'}}
								options={masterReference.filter((obj) => obj.masterReferenceParentId === goalTypeMRPId).map((obj) => obj.options)}
								onChange={onchangeGoalType}
								value={goalType}
								isDisabled={true}
							/>
						</Col>
					</Row>
					{goalTypeName === '' ? null : (
						<>
							{goalTypeName === COMMUNITCATION_RECORD ? (
								<>
									<Row style={{marginTop: 10}}>
										<Col sm={12}>
											<label className='form-label-sm'>Message Type</label>
											<Select
												style={{width: '100%'}}
												options={messageTypeOptions}
												onChange={onchangeMessageType}
												value={messageType}
												isDisabled={true}
											/>
										</Col>
									</Row>
									<Row style={{marginTop: 10}}>
										<Col sm={12}>
											<label className='form-label-sm'>Message Status</label>
											<Select
												style={{width: '100%'}}
												options={messageStatusOptionList}
												onChange={onchangeMessageStatus}
												value={messageStatus}
												isDisabled={true}
											/>
										</Col>
									</Row>
									<Row style={{marginTop: 10}}>
										<Col sm={12}>
											<label className='form-label-sm'>Date Source</label>
											<Select
												style={{width: '100%'}}
												options={masterReference
													.filter((obj) => obj.masterReferenceParentId == communicationDataSourceMRPId)
													.map((obj) => obj.options)}
												onChange={onchangeCommRecordDataSource}
												value={commRecordDataSource}
												isDisabled={true}
											/>
										</Col>
									</Row>
									<Row style={{marginTop: 10}}>
										<Col sm={12}>
											<label className='form-label-sm'>Period</label>
											<Select
												style={{width: '100%'}}
												options={masterReference.filter((obj) => obj.masterReferenceParentId == communicationPeriodMRPId).map((obj) => obj.options)}
												onChange={onchangeCommRecordPeriod}
												value={commRecordPeriod}
												isDisabled={true}
											/>
										</Col>
									</Row>
								</>
							) : (
								<>
									<Row style={{marginTop: 10}}>
										<Col sm={12}>
											<label className='form-label-sm'>Transaction Type</label>
											<Select
												style={{width: '100%'}}
												options={masterReference
													.filter((obj) => obj.masterReferenceParentId == goalTypeTransactionTypeMRPId)
													.map((obj) => obj.options)}
												onChange={onchangeTransactionType}
												value={transactionType}
												isDisabled={true}
											/>
										</Col>
									</Row>
									<Row style={{marginTop: 10}}>
										<Col sm={12}>
											<label className='form-label-sm'>Date Source</label>
											<Select
												style={{width: '100%'}}
												options={masterReference.filter((obj) => obj.masterReferenceParentId == dateSourceOptionFilter).map((obj) => obj.options)}
												onChange={onchangeDepositDataSource}
												value={depositDataSource}
												isDisabled={true}
											/>
										</Col>
									</Row>
									<Row style={{marginTop: 10}}>
										<Col sm={12}>
											<label className='form-label-sm'>Period</label>
											<Select
												style={{width: '100%'}}
												options={masterReference.filter((obj) => obj.masterReferenceParentId == depositPeriodMRPId).map((obj) => obj.options)}
												onChange={onchangeDepositPeriod}
												value={depositPeriod}
												isDisabled={true}
											/>
										</Col>
									</Row>
									{currencyList.map((key: any, index: number) => {
										return (
											<Row style={{marginTop: 10}}>
												<Col sm={6}>
													<label className='form-label-sm'>{key.label} Min</label>
													<input
														type='number'
														className='form-control form-control-sm'
														aria-label='{c.currencCode} Min'
														value={goalTypeDepositCurrencyListData
															.filter(
																(obj: any) => obj.currencyId === parseInt(key.value) && obj.depositGuid.toString() === goalTypeGuidId?.toString()
															)
															.map((obj: any) => obj.min)}
														disabled
													/>
												</Col>
												<Col sm={6}>
													<label className='form-label-sm'>{key.label} Max</label>
													<input
														type='number'
														className='form-control form-control-sm'
														aria-label='{c.currencCode} Max'
														value={goalTypeDepositCurrencyListData
															.filter(
																(obj: any) => obj.currencyId === parseInt(key.value) && obj.depositGuid.toString() === goalTypeGuidId?.toString()
															)
															.map((obj: any) => obj.max)}
														disabled
													/>
												</Col>
											</Row>
										);
									})}
								</>
							)}{' '}
						</>
					)}
				</Container>
				<ModalFooter style={{border: 0}}>
					<DefaultPrimaryButton
						title={'Submit'}
						access={userAccess.includes(USER_CLAIMS.ViewGoalSettingWrite)}
						isDisable={true}
						onClick={() => console.log('')}
					/>
					<DefaultSecondaryButton access={true} title={'Close'} onClick={closeModal} />
				</ModalFooter>
			</FormModal>
		</FormContainer>
	);
};

export default ViewGoalTypeConfigModal;
