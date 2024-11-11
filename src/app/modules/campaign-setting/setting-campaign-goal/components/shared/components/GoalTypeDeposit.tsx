import React, {useEffect, useState} from 'react';
import {Col, Row} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import {RootState} from '../../../../../../../setup';
import {LookupModel, OptionListModel} from '../../../../../../common/model';
import {useCurrenciesWithCode, useMasterReferenceOption} from '../../../../../../custom-functions';
import {
	GoalSettingCommons,
	GoalType,
	MasterReference,
	MasterReferenceChild,
	ThresholdDeposit,
	TransactionType,
} from '../../../../../system/components/constants/CampaignSetting';
import useCampaignSettingConstant from '../../../../constants/useCampaignSettingConstant';
import {GoalTypeDepositCurrencyMinMaxUdtModel} from '../../../models/GoalTypeDepositCurrencyMinMaxUdtModel';
import {GoalTypeDepositUdtModel} from '../../../models/GoalTypeDepositUdtModel';
interface Props {
	goalTypeGuidId: string;
	action: string;
	goalTypeDepositUdtModel?: GoalTypeDepositUdtModel;
	setGoalTypeDepositUdtModel: any;
	goalTypeDepositCurrencyMinMaxUdtModelList: Array<GoalTypeDepositCurrencyMinMaxUdtModel>;
	setGoalTypeDepositCurrencyMinMaxUdtModelList: any;
	existingGoalTypeList: Array<any>;
	viewMode: boolean;
	goalType: any;
	isMapped: boolean;
}

const GoalTypeDeposit: React.FC<Props> = ({
	goalTypeGuidId,
	action,
	goalTypeDepositUdtModel,
	setGoalTypeDepositUdtModel,
	existingGoalTypeList,
	setGoalTypeDepositCurrencyMinMaxUdtModelList,
	goalTypeDepositCurrencyMinMaxUdtModelList,
	viewMode,
	goalType,
	isMapped,
}) => {
	//	Redux
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const masterReference = useMasterReferenceOption(
		`${MasterReference.GameActivityTransactionType},
		${MasterReference.GoalTypeIntervalRelationalOperator},
		${MasterReference.GoalTypeDepositIntervalSource},
		${MasterReference.DepositPeriod},
		${MasterReference.ThresholdDepositTransactionType},
		${MasterReference.GoalTypeTransactionType},
		${MasterReference.GoalTypeCommunicationIntervalSource},
		${MasterReference.GoalTypeDepositIntervalSource}`
	);
	const currencyList = useCurrenciesWithCode();
	//States
	const {enforceNumberValidationNoPeriod} = useCampaignSettingConstant();
	const [transactionType, setTransactionType] = useState<any>('');
	const [thresholdType, setThresholdType] = useState<any>('');
	const [dataSource, setDataSource] = useState<any>('');
	const [interval, setInterval] = useState<any>('');
	const [intervalSource, setIntervalSource] = useState<any>('');
	const [disableIntervalSource, setDisableIntervalSource] = useState<boolean>(false);
	const [commRecordPeriod, setCommRecordPeriod] = useState<any>('');
	const [intervalNumber, setIntervalNumber] = useState<any>('');
	const [disableIntervalNumber, setDisableIntervalNumber] = useState<boolean>(false);
	const [nthNumber, setNthNumber] = useState<any>('');
	const [existingGoalName, setExistingGoalName] = useState<any>('');
	const [staticDataSourceOptions, setStaticDataSourceOptions] = useState<Array<LookupModel>>([]);
	const [dateSourceDropdown, setDateSourceDropdown] = useState<Array<OptionListModel>>([]);
	//Watchers
	useEffect(() => {
		if (!goalTypeDepositUdtModel) {
			goalTypeDepositUdtModel = {
				campaignSettingId: 0,
				createdBy: userAccessId,
				goalTypeDataSourceId: 0,
				goalTypeDataSourceName: '',
				goalTypeDepositId: 0,
				goalTypeId: GoalType.DepositId,
				goalTypeName: '',
				goalTypePeriodId: 0,
				goalTypePeriodName: '',
				goalTypeTransactionTypeId: 0,
				intervalNumber: 0,
				intervalRelationalOperatorId: 0,
				intervalSourceId: 0,
				nthNumber: 0,
				thresholdTypeId: 0,
				updatedBy: 0,
				intervalRelationalOperatorName: '',
				intervalSourceName: '',
				intervalSourceGoalTypeId: 0,
				intervalSourceGoalTypeGUID: '',
				goalName: 'Deposit',
				depositGuid: goalTypeGuidId,
			};
			setGoalTypeDepositUdtModel(goalTypeDepositUdtModel);
		}
	}, [goalTypeDepositUdtModel]);

	useEffect(() => {
		if (masterReference && masterReference.length > 0) {
			const results = masterReference
				.filter((obj) => {
					if (obj.masterReferenceParentId == MasterReference.GoalTypeIntervalRelationalOperator) return obj;
				})
				.map((obj) => obj.options);

			const result = results.find((e) => +e.value === MasterReferenceChild.OnorAfter);

			if (goalTypeDepositUdtModel && goalTypeDepositUdtModel.intervalRelationalOperatorId === 0 && result) {
				goalTypeDepositUdtModel.intervalRelationalOperatorId = +result?.value;
				goalTypeDepositUdtModel.intervalRelationalOperatorName = result?.label;
				setGoalTypeDepositUdtModel(goalTypeDepositUdtModel);

				setInterval(result);
			}
			const periods = masterReference.filter((obj) => obj.masterReferenceParentId == MasterReference.DepositPeriod).map((obj) => obj.options);
			if (periods.length > 0 && action === GoalSettingCommons.ADD) {
				onchangeCommRecordPeriod(periods[0]); // Set default value selected for period
			}
			setDisableIntervalNumber(true);
			loadData();
		}
	}, [masterReference]);

	useEffect(() => {
		if ((action === GoalSettingCommons.EDIT || action === GoalSettingCommons.VIEW) && staticDataSourceOptions && staticDataSourceOptions.length > 0) {
			const item = staticDataSourceOptions.find((d) => d.value === goalTypeDepositUdtModel?.intervalSourceId.toString());
			if (item) onchangeIntervalSource(item);
		}
	}, [staticDataSourceOptions]);
	useEffect(() => {
		if (goalTypeDepositUdtModel && goalType) {
			goalTypeDepositUdtModel.goalTypeId = goalType.value;
			goalTypeDepositUdtModel.goalName = goalType.label;
			setGoalTypeDepositUdtModel(goalTypeDepositUdtModel);
		}
	}, [goalType]);

	useEffect(() => {
		if (transactionType !== "" || dateSourceDropdown.length > 0) {
			const dateSourceList = masterReference
				.filter((obj) => {
					if (obj.masterReferenceParentId == MasterReference.GoalTypeDepositIntervalSource) return obj;
				})
				.map((obj) => obj.options);
			if (transactionType && transactionType.value === MasterReferenceChild.NthNextDeposit.toString()) {
				setDateSourceDropdown(dateSourceList.filter((ds) => ds.value === MasterReferenceChild.NthDepositDate.toString()));
			} else if (transactionType && transactionType.value === TransactionType.FirstTimeDepositId.toString()) {
				setDateSourceDropdown(dateSourceList.filter((ds) => ds.value === MasterReferenceChild.FirstTimeDepositDate.toString()));
			} else if (transactionType && transactionType.value === TransactionType.InitialDepositId.toString()) {
				setDateSourceDropdown(dateSourceList.filter((ds) => ds.value === MasterReferenceChild.UpdatedDate.toString()));
			} else {
				setDateSourceDropdown(dateSourceList.filter((ds) => ds.value === MasterReferenceChild.InitialDepositDate.toString()));
			}
		}
	}, [transactionType]);
	const setTransactionTypeSelect = (transactionTypeOptions : OptionListModel[]) =>{
		let _transactionType  = transactionTypeOptions.find((d) => d.value === goalTypeDepositUdtModel?.goalTypeTransactionTypeId.toString());
		if(_transactionType){
			setTransactionType(_transactionType)
		}
	}
	//Events
	const loadData = async () => {
		if ((action === GoalSettingCommons.EDIT || action === GoalSettingCommons.VIEW) && goalTypeDepositUdtModel) {
			//transaction Type
			const transactionTypeOptions = masterReference
				.filter((obj) => obj.masterReferenceParentId == MasterReference.GoalTypeTransactionType)
				.map((obj) => obj.options);

			setTransactionTypeSelect(transactionTypeOptions)

			//nt Number
			setNthNumber(goalTypeDepositUdtModel?.nthNumber);

			const thresholdTypeOptions = masterReference
				.filter((obj) => obj.masterReferenceParentId == MasterReference.ThresholdDepositTransactionType)
				.map((obj) => obj.options);
			setThresholdType(thresholdTypeOptions.find((d) => d.value === goalTypeDepositUdtModel?.thresholdTypeId.toString()));
			
			const dataSourceOptions = masterReference
				.filter((obj) => obj.masterReferenceParentId == MasterReference.GoalTypeDepositIntervalSource)
				.map((obj) => obj.options);
			onchangeDataSource(dataSourceOptions.find((d) => d.value === goalTypeDepositUdtModel?.goalTypeDataSourceId.toString()));

			//inteval relational operator
			const intervalRelationalOperator = masterReference
				.filter((obj) => obj.masterReferenceParentId == MasterReference.GoalTypeIntervalRelationalOperator)
				.map((obj) => obj.options);
			onchangeInterval(intervalRelationalOperator.find((d) => d.value === goalTypeDepositUdtModel?.intervalRelationalOperatorId.toString()));

			if (goalTypeDepositUdtModel?.intervalSourceGoalTypeId > 0) {
				//const item = existingGoalTypeList.find((d) => d.data.goalTypeGuid === goalTypeDepositUdtModel?.intervalSourceGoalTypeGUID);
				const item = existingGoalTypeList.find((d) => +d.value === goalTypeDepositUdtModel?.intervalSourceGoalTypeId);
				if (item) onchangeExistingGoalName(item);
			} else if (goalTypeDepositUdtModel?.intervalSourceGoalTypeGUID) {
				const item = existingGoalTypeList.find((d) => d.data.goalTypeGuid === goalTypeDepositUdtModel?.intervalSourceGoalTypeGUID);
				if (item) onchangeExistingGoalName(item);
			} else if (goalTypeDepositUdtModel?.intervalSourceGoalTypeId === 0) {
				onchangeExistingGoalName({label: 'static', value: '0'});
			}

			const periodOptions = masterReference.filter((obj) => obj.masterReferenceParentId == MasterReference.DepositPeriod).map((obj) => obj.options);
			onchangeCommRecordPeriod(periodOptions.find((d) => d.value === goalTypeDepositUdtModel?.goalTypePeriodId.toString()));

			if (goalTypeDepositUdtModel?.intervalNumber) {
				setIntervalNumber(goalTypeDepositUdtModel?.intervalNumber);
			}
		}
	};

	const setTotalDepositTransactionDataSource = (val: any, results: OptionListModel[])=> {
		if (+val?.value === MasterReferenceChild.TotalDeposit && goalTypeDepositUdtModel) {
			const result = results.find((e) => +e.value == MasterReferenceChild.InitialDepositDate);
			if (result) {
				goalTypeDepositUdtModel.goalTypeDataSourceId = +result.value;
				goalTypeDepositUdtModel.goalTypeDataSourceName = result.label;
				setGoalTypeDepositUdtModel(goalTypeDepositUdtModel);
				setDataSource(result);
			}
		}

	}
	const onchangeTransactionType = (val: any) => {

		const results = masterReference
			.filter(obj => obj.masterReferenceParentId === MasterReference.GoalTypeDepositIntervalSource)
			.map(obj => obj.options);

		if (goalTypeDepositUdtModel) {
			goalTypeDepositUdtModel.goalTypeTransactionTypeId = +val?.value;
			setGoalTypeDepositUdtModel(goalTypeDepositUdtModel);
		}
		if (+val?.value == MasterReferenceChild.NthNextDeposit && goalTypeDepositUdtModel) {
			const result = results.find((e) => +e.value == MasterReferenceChild.NthDepositDate);
			if (result) {
				goalTypeDepositUdtModel.goalTypeDataSourceId = +result.value;
				goalTypeDepositUdtModel.goalTypeDataSourceName = result.label;
				setGoalTypeDepositUdtModel(goalTypeDepositUdtModel);
				setDataSource(result);
			}
		}
		setTotalDepositTransactionDataSource(val,results);

		if (val?.value === TransactionType.FirstTimeDepositId && goalTypeDepositUdtModel) {
			const result = results.find((e) => +e.value === MasterReferenceChild.FirstTimeDepositDate);
			if (result) {
				goalTypeDepositUdtModel.goalTypeDataSourceId = +result.value;
				goalTypeDepositUdtModel.goalTypeDataSourceName = result.label;
				setGoalTypeDepositUdtModel(goalTypeDepositUdtModel);
				setDataSource(result);
			}
		}

		if (val?.value === TransactionType.InitialDepositId && goalTypeDepositUdtModel) {
			//update date
			const result = results.find((e) => +e.value == MasterReferenceChild.UpdatedDate);
			if (result) {
				goalTypeDepositUdtModel.goalTypeDataSourceId = +result.value;
				goalTypeDepositUdtModel.goalTypeDataSourceName = result.label;
				setGoalTypeDepositUdtModel(goalTypeDepositUdtModel);
				setDataSource(result);
			}
		}
		setTransactionType(val);
	};
	const onchangeDataSource = (val: any) => {
		if (goalTypeDepositUdtModel && val) {
			goalTypeDepositUdtModel.goalTypeDataSourceId = +val?.value;
			goalTypeDepositUdtModel.goalTypeDataSourceName = val?.label;
			setGoalTypeDepositUdtModel(goalTypeDepositUdtModel);
		}
		setDataSource(val);
	};

	const onchangeInterval = (val: any) => {
		if (goalTypeDepositUdtModel && val) {
			goalTypeDepositUdtModel.intervalRelationalOperatorId = +val?.value;
			goalTypeDepositUdtModel.intervalRelationalOperatorName = val?.label;
			setGoalTypeDepositUdtModel(goalTypeDepositUdtModel);
		}
		if (
			goalTypeDepositUdtModel &&
			(goalTypeDepositUdtModel.intervalRelationalOperatorId == MasterReferenceChild.OnorAfter ||
				goalTypeDepositUdtModel.intervalRelationalOperatorId == MasterReferenceChild.OnorBefore)
		) {
			setDisableIntervalNumber(true);
			setIntervalNumber('');
		} else setDisableIntervalNumber(false);
		setInterval(val);
	};
	const onchangeIntervalSource = (val:any) => {
		if (goalTypeDepositUdtModel && val) {
			goalTypeDepositUdtModel.intervalSourceId = +val?.value;
			goalTypeDepositUdtModel.intervalSourceName = val?.label;
			setGoalTypeDepositUdtModel(goalTypeDepositUdtModel);
		}
		setIntervalSource(val);
	};
	const onchangeCommRecordPeriod = (val: any) => {
		if (goalTypeDepositUdtModel && val) {
			goalTypeDepositUdtModel.goalTypePeriodId = +val?.value;
			goalTypeDepositUdtModel.goalTypePeriodName = val?.label;
			setGoalTypeDepositUdtModel(goalTypeDepositUdtModel);
		}
		setCommRecordPeriod(val);
	};
	const enforceNumberValidation = (e: any) => {
		let checkIfNum;
		if (e.key !== undefined) {
			// Check if it's a "e", "+" or "-"
			checkIfNum = e.key === 'e' || e.key === '+' || e.key === '-';
		} else if (e.keyCode !== undefined) {
			// Check if it's a "e" (69), "." (190), "+" (187) or "-" (189)
			checkIfNum = e.keyCode === 69 || e.keyCode === 190 || e.keyCode === 187 || e.keyCode === 189;
		}
		return checkIfNum && e.preventDefault();
	};
	const onChangeIntervalNumber = (val: any) => {
		if (goalTypeDepositUdtModel && val) {
			goalTypeDepositUdtModel.intervalNumber = +val.target.value;
			setGoalTypeDepositUdtModel(goalTypeDepositUdtModel);
		}
		setIntervalNumber(val.target.value);
	};
	const onChangeNthNumber = (val: any) => {
		if (goalTypeDepositUdtModel) {
			goalTypeDepositUdtModel.nthNumber = +val.target.value;
			setGoalTypeDepositUdtModel(goalTypeDepositUdtModel);
		}
		setNthNumber(val.target.value);
	};
	const onchangeExistingGoalName = (val: any) => {
		if (goalTypeDepositUdtModel) {
			const results = masterReference
				.filter((obj) => {
					if (obj.masterReferenceParentId == MasterReference.GoalTypeCommunicationIntervalSource) return obj;
				})
				.map((obj) => obj.options);
			setIntervalSource(null);
			if (val?.label == 'static') {
				setStaticDataSourceOptions(results);
				setDisableIntervalSource(false);
				goalTypeDepositUdtModel.intervalSourceGoalTypeGUID = undefined;
				if (results.findIndex((d) => d.value === goalTypeDepositUdtModel?.intervalSourceId.toString()) == -1) {
					goalTypeDepositUdtModel.intervalSourceId = 0;
					goalTypeDepositUdtModel.intervalSourceName = '';
				}
			} else {
				setDisableIntervalSource(true);
				const selectedGoalDataSource = {value: String(val.data.goalTypeDataSourceId), label: val.data.goalTypeDataSourceName};
				setStaticDataSourceOptions([selectedGoalDataSource]);
				onchangeIntervalSource(selectedGoalDataSource);
				goalTypeDepositUdtModel.intervalSourceGoalTypeGUID = val?.data?.goalTypeGuid;
			}

			goalTypeDepositUdtModel.intervalSourceGoalTypeId = +val.value;
			goalTypeDepositUdtModel.intervalSourceGoalTypeName = val.label;

			setGoalTypeDepositUdtModel(goalTypeDepositUdtModel);
		}
		setExistingGoalName(val);
	};
	const onchangeThresholdType = (val: string | any) => {
		if (goalTypeDepositUdtModel) {
			goalTypeDepositUdtModel.thresholdTypeId = +val?.value;
			setGoalTypeDepositUdtModel(goalTypeDepositUdtModel);
		}
		setThresholdType(val);
	};
	const onCurrencyChanged = (currencyValue: number, currencyId: number, currencyCode: string, minMax: string) => {
		let storedGoalTypeDepositCurrencyListData = goalTypeDepositCurrencyMinMaxUdtModelList ?? [];
		let currencyIndex = goalTypeDepositCurrencyMinMaxUdtModelList.findIndex(
			(c: any) => c.currencyId === currencyId && c.depositGuid === goalTypeGuidId
		);

		if (action === GoalSettingCommons.ADD) {
			if (currencyIndex !== -1) {
				storedGoalTypeDepositCurrencyListData[currencyIndex].min =
					minMax == GoalSettingCommons.MIN ? currencyValue : storedGoalTypeDepositCurrencyListData[currencyIndex].min;
				storedGoalTypeDepositCurrencyListData[currencyIndex].max =
					minMax == GoalSettingCommons.MAX ? currencyValue : storedGoalTypeDepositCurrencyListData[currencyIndex].max;
				setGoalTypeDepositCurrencyMinMaxUdtModelList(storedGoalTypeDepositCurrencyListData);
			} else {
				const requestGoalTypeDepositCurrencyMinMaxUdtModel: GoalTypeDepositCurrencyMinMaxUdtModel = {
					goalTypeDepositCurrencyMinMaxId: 0,
					currencyId: currencyId,
					goalTypeDepositId: 0,
					min: minMax === GoalSettingCommons.MIN ? currencyValue : 0,
					max: minMax === GoalSettingCommons.MAX ? currencyValue : 0,
					createdBy: userAccessId,
					updatedBy: userAccessId,
					depositGuid: goalTypeGuidId,
				};
				setGoalTypeDepositCurrencyMinMaxUdtModelList([
					...goalTypeDepositCurrencyMinMaxUdtModelList,
					...[requestGoalTypeDepositCurrencyMinMaxUdtModel],
				]);
			}
		} else {
			if (currencyIndex !== -1) {
				const requestGoalTypeDepositCurrencyMinMaxUdtModel: GoalTypeDepositCurrencyMinMaxUdtModel = {
					goalTypeDepositCurrencyMinMaxId: storedGoalTypeDepositCurrencyListData[currencyIndex].goalTypeDepositCurrencyMinMaxId,
					currencyId: storedGoalTypeDepositCurrencyListData[currencyIndex].currencyId,
					goalTypeDepositId: storedGoalTypeDepositCurrencyListData[currencyIndex].goalTypeDepositId,
					min: minMax === GoalSettingCommons.MIN ? currencyValue : storedGoalTypeDepositCurrencyListData[currencyIndex].min,
					max: minMax === GoalSettingCommons.MAX ? currencyValue : storedGoalTypeDepositCurrencyListData[currencyIndex].max,
					createdBy: userAccessId,
					updatedBy: userAccessId,
					depositGuid: goalTypeGuidId,
				};

				const goalTypeDepositCurrencyMinMaxUdtModelListTemp = goalTypeDepositCurrencyMinMaxUdtModelList.filter(
					(d) => d.currencyId !== requestGoalTypeDepositCurrencyMinMaxUdtModel.currencyId
				);
				setGoalTypeDepositCurrencyMinMaxUdtModelList([
					...goalTypeDepositCurrencyMinMaxUdtModelListTemp,
					...[requestGoalTypeDepositCurrencyMinMaxUdtModel],
				]);
			} else {
				const requestGoalTypeDepositCurrencyMinMaxUdtModel: GoalTypeDepositCurrencyMinMaxUdtModel = {
					goalTypeDepositCurrencyMinMaxId: 0,
					currencyId: currencyId,
					goalTypeDepositId: 0,
					min: minMax === GoalSettingCommons.MIN ? currencyValue : 0,
					max: minMax === GoalSettingCommons.MAX ? currencyValue : 0,
					createdBy: userAccessId,
					updatedBy: userAccessId,
					depositGuid: goalTypeGuidId,
				};
				setGoalTypeDepositCurrencyMinMaxUdtModelList([
					...goalTypeDepositCurrencyMinMaxUdtModelList,
					...[requestGoalTypeDepositCurrencyMinMaxUdtModel],
				]);
			}
		}
	};

	return (
		<>
			<Row style={{marginTop: 10}}>
				<Col sm={12}>
					<label className='form-label-sm required'>Transaction Type</label>
					<Select
						isDisabled={viewMode || isMapped}
						style={{width: '100%'}}
						options={masterReference
							.filter((obj) => obj.masterReferenceParentId == MasterReference.GoalTypeTransactionType)
							.map((obj) => obj.options)}
						onChange={onchangeTransactionType}
						value={transactionType}
					/>
				</Col>
			</Row>
			{+transactionType?.value === MasterReferenceChild.NthNextDeposit ? (
				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label className='form-label-sm required'>Nth Number</label>
						<input
							type='number'
							className='form-control form-control-sm'
							aria-label='{c.currencCode} Min'
							min='1'
							value={nthNumber}
							onKeyPress={enforceNumberValidationNoPeriod}
							onChange={onChangeNthNumber}
							disabled={viewMode}
						/>
					</Col>
				</Row>
			) : (
				<></>
			)}
			{+transactionType?.value === MasterReferenceChild.TotalDeposit ? (
				<Row style={{marginTop: 10}}>
					<Col sm={12}>
						<label className='form-label-sm required'>Threshold Type</label>
						<Select
							style={{width: '100%'}}
							options={masterReference
								.filter((obj) => obj.masterReferenceParentId == MasterReference.ThresholdDepositTransactionType)
								.map((obj) => obj.options)}
							onChange={onchangeThresholdType}
							value={thresholdType}
							isDisabled={viewMode}
						/>
					</Col>
				</Row>
			) : (
				<></>
			)}

			<Row style={{marginTop: 10}}>
				<Col sm={12}>
					<label className='form-label-sm required'>Date Source</label>
					<Select
						style={{width: '100%'}}
						options={dateSourceDropdown}
						onChange={onchangeDataSource}
						value={dataSource}
						isDisabled={viewMode || isMapped}
					/>
				</Col>
			</Row>
			<Row style={{marginTop: 10}}>
				<Col sm={3}>
					<label className='form-label-sm required'>Interval</label>
					<Select
						style={{width: '100%'}}
						options={masterReference
							.filter((obj) => obj.masterReferenceParentId == MasterReference.GoalTypeIntervalRelationalOperator)
							.map((obj) => obj.options)}
						onChange={onchangeInterval}
						value={interval}
						isDisabled={viewMode}
					/>
				</Col>
				<Col sm={4}>
					<label className='form-label-sm'></label>
					<Select
						isDisabled={viewMode}
						style={{width: '100%'}}
						options={existingGoalTypeList}
						onChange={onchangeExistingGoalName}
						value={existingGoalName}
					/>
				</Col>
				<Col sm={3}>
					<label className='form-label-sm'></label>
					<Select
						isDisabled={disableIntervalSource || viewMode}
						style={{width: '100%'}}
						options={staticDataSourceOptions}
						onChange={onchangeIntervalSource}
						value={intervalSource}
					/>
				</Col>
				<Col sm={2}>
					<label className='form-label-sm'></label>
					<input
						type='number'
						className='form-control form-control-sm'
						value={intervalNumber}
						onChange={onChangeIntervalNumber}
						disabled={disableIntervalNumber || viewMode}
						id='intervalNumberId'
						onKeyPress={enforceNumberValidationNoPeriod}
						min='1'
					/>
				</Col>
			</Row>
			<Row style={{marginTop: 10}}>
				<Col sm={12}>
					<label className='form-label-sm required'>Period</label>
					<Select
						style={{width: '100%'}}
						options={masterReference.filter((obj) => obj.masterReferenceParentId == MasterReference.DepositPeriod).map((obj) => obj.options)}
						onChange={onchangeCommRecordPeriod}
						value={commRecordPeriod}
						isDisabled={viewMode}
					/>
				</Col>
			</Row>

			{transactionType.value !== TransactionType.TotalDeposit ? 
				action === GoalSettingCommons.ADD
				? currencyList.map((key: any, index: number) => {
						return (
							<Row key={key.label} style={{marginTop: 10}}>
								<Col sm={6}>
									<label className='form-label-sm required'>
										{transactionType.value === TransactionType.NthNextDepositId ||
										transactionType.value === TransactionType.FirstTimeDepositId ||
										transactionType.value === TransactionType.InitialDepositId ? (
											<>{key.label} Min Amount</>
										) : (
											<>
												{key.label} Min {thresholdType?.label}
											</>
										)}
									</label>
									<input
										disabled={viewMode}
										type='number'
										className='form-control form-control-sm'
										aria-label='{c.currencCode} Min'
										min='1'
										onKeyPress={
											thresholdType && thresholdType.value === ThresholdDeposit.Count.toString()
												? enforceNumberValidationNoPeriod
												: enforceNumberValidation
										}
										onChange={(value) => onCurrencyChanged(parseFloat(value.target.value), parseInt(key.value), key.label, GoalSettingCommons.MIN)}
									/>
								</Col>
								<Col sm={6}>
									<label className='form-label-sm required'>
										{transactionType.value === TransactionType.NthNextDepositId ||
										transactionType.value === TransactionType.FirstTimeDepositId ||
										transactionType.value === TransactionType.InitialDepositId ? (
											<>{key.label} Max Amount</>
										) : (
											<>
												{key.label} Max {thresholdType?.label}
											</>
										)}
									</label>
									<input
										disabled={viewMode}
										type='number'
										className='form-control form-control-sm'
										aria-label='{c.label} Max'
										min='1'
										onKeyPress={
											thresholdType && thresholdType.value === ThresholdDeposit.Count.toString()
												? enforceNumberValidationNoPeriod
												: enforceNumberValidation
										}
										onChange={(value) => onCurrencyChanged(parseFloat(value.target.value), parseInt(key.value), key.label, GoalSettingCommons.MAX)}
									/>
								</Col>
							</Row>
						);
				  })
				: currencyList.map((key: any, index: number) => {
						return (
							<Row key={key.label} style={{marginTop: 10}}>
								<Col sm={6}>
									<label className='form-label-sm required'>
										{transactionType.value === TransactionType.NthNextDepositId ||
										transactionType.value === TransactionType.FirstTimeDepositId ||
										transactionType.value === TransactionType.InitialDepositId ? (
											<> {key.label} Min Amount</>
										) : (
											<>
												{key.label} Min {thresholdType?.label}
											</>
										)}
									</label>
									<input
										type='number'
										className='form-control form-control-sm'
										aria-label='{c.currencCode} Min'
										min='1'
										disabled={viewMode}
										onKeyPress={
											thresholdType && thresholdType.value === ThresholdDeposit.Count.toString()
												? enforceNumberValidationNoPeriod
												: enforceNumberValidation
										}
										value={goalTypeDepositCurrencyMinMaxUdtModelList.find((d) => d.currencyId == key.value)?.min}
										onChange={(value) => onCurrencyChanged(parseFloat(value.target.value), parseInt(key.value), key.label, GoalSettingCommons.MIN)}
									/>
								</Col>
								<Col sm={6}>
									<label className='form-label-sm required'>
										{transactionType.value === TransactionType.NthNextDepositId ||
										transactionType.value === TransactionType.FirstTimeDepositId ||
										transactionType.value === TransactionType.InitialDepositId ? (
											<>{key.label} Max Amount</>
										) : (
											<>
												{key.label} Max {thresholdType?.label}
											</>
										)}
									</label>
									<input
										disabled={viewMode}
										type='number'
										className='form-control form-control-sm'
										aria-label='{c.label} Max'
										min='1'
										value={goalTypeDepositCurrencyMinMaxUdtModelList.find((d) => d.currencyId == key.value)?.max}
										onKeyPress={
											thresholdType && thresholdType.value === ThresholdDeposit.Count.toString()
												? enforceNumberValidationNoPeriod
												: enforceNumberValidation
										}
										onChange={(value) => onCurrencyChanged(parseFloat(value.target.value), parseInt(key.value), key.label, GoalSettingCommons.MAX)}
									/>
								</Col>
							</Row>
						);
				  }) : 
				<Row style={{marginTop: 10}}>
				{action === GoalSettingCommons.ADD
				? currencyList.map((key: any, index: number) => {
						return (
							<Col key={key.label} sm={4}>
									<label className='form-label-sm required'>
										{transactionType.value === TransactionType.NthNextDepositId ||
										transactionType.value === TransactionType.FirstTimeDepositId ||
										transactionType.value === TransactionType.InitialDepositId ? (
											<>{key.label} Min Amount</>
										) : (
											<>
												{key.label} Min {thresholdType?.label}
											</>
										)}
									</label>
									<input
										disabled={viewMode}
										type='number'
										className='form-control form-control-sm'
										aria-label='{c.currencCode} Min'
										min='1'
										onKeyPress={
											thresholdType && thresholdType.value === ThresholdDeposit.Count.toString()
												? enforceNumberValidationNoPeriod
												: enforceNumberValidation
										}
										onChange={(value) => onCurrencyChanged(parseFloat(value.target.value), parseInt(key.value), key.label, GoalSettingCommons.MIN)}
									/>
								</Col>
						);
				  })
				: currencyList.map((key: any, index: number) => {
						return (
							<Col key={key.label} sm={4}>
									<label className='form-label-sm required'>
										{transactionType.value === TransactionType.NthNextDepositId ||
										transactionType.value === TransactionType.FirstTimeDepositId ||
										transactionType.value === TransactionType.InitialDepositId ? (
											<> {key.label} Min Amount</>
										) : (
											<>
												{key.label} Min {thresholdType?.label}
											</>
										)}
									</label>
									<input
										type='number'
										className='form-control form-control-sm'
										aria-label='{c.currencCode} Min'
										min='1'
										disabled={viewMode}
										onKeyPress={
											thresholdType && thresholdType.value === ThresholdDeposit.Count.toString()
												? enforceNumberValidationNoPeriod
												: enforceNumberValidation
										}
										value={goalTypeDepositCurrencyMinMaxUdtModelList.find((d) => d.currencyId == key.value)?.min}
										onChange={(value) => onCurrencyChanged(parseFloat(value.target.value), parseInt(key.value), key.label, GoalSettingCommons.MIN)}
									/>
								</Col>
						);
				  })}
				  </Row>
			}
		</>
	);
};

export default GoalTypeDeposit;
