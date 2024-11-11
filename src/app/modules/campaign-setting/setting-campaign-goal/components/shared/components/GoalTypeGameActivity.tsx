import React, {useEffect, useState} from 'react';
import {Col, Row} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import {RootState} from '../../../../../../../setup';
import {LookupModel} from '../../../../../../common/model';
import {useCurrenciesWithCode, useMasterReferenceOption} from '../../../../../../custom-functions';
import {
	GoalSettingCommons,
	GoalType,
	MasterReference,
	MasterReferenceChild,
	ThresholdDeposit,
} from '../../../../../system/components/constants/CampaignSetting';
import useCampaignSettingConstant from '../../../../constants/useCampaignSettingConstant';
import {GoalTypeGameActivityUdtModel} from '../../../models';
import {GoalTypeGameActivityCurrMinMaxUdtModel} from '../../../models/GoalTypeGameActivityCurrMinMaxUdtModel';

interface Props {
	goalTypeGuidId: string;
	goalTypeGameActivityUdtModel?: GoalTypeGameActivityUdtModel;
	setGoalTypeGameActivityUdtModel: any;
	setGoalTypeGameActivityCurrMinMaxUdtModelList: any;
	goalTypeGameActivityCurrMinMaxUdtModelList: Array<GoalTypeGameActivityCurrMinMaxUdtModel>;
	existingGoalTypeList: Array<any>;
	action: string;
	viewMode: boolean;
	isMapped: boolean;
}
const GoalTypeGameActivity: React.FC<Props> = ({
	goalTypeGuidId,
	goalTypeGameActivityUdtModel,
	setGoalTypeGameActivityUdtModel,
	setGoalTypeGameActivityCurrMinMaxUdtModelList,
	goalTypeGameActivityCurrMinMaxUdtModelList,
	existingGoalTypeList,
	action,
	viewMode,
	isMapped,
}) => {
	//	Redux
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	const masterReferenceGoalActivity = useMasterReferenceOption(
		`${MasterReference.GameActivityProductType},
		 ${MasterReference.ThresholdDepositTransactionType},
		 ${MasterReference.GoalTypeDepositIntervalSource},
		 ${MasterReference.GoalTypeIntervalRelationalOperator},
		 ${MasterReference.GameActivityTransactionType},
		 ${MasterReference.GoalTypeCommunicationIntervalSource},
		 ${MasterReference.GameActivityDateSource},
		 ${MasterReference.DepositPeriod}`
	);
	const currencyList = useCurrenciesWithCode();
	//States
	const [transactionType, setTransactionType] = useState<any>('');
	const [product, setProduct] = useState<any>('');
	const [thresholdType, setThresholdType] = useState<any>('');
	const [dataSource, setDataSource] = useState<any>('');
	const [interval, setInterval] = useState<any>('');
	const [intervalSource, setIntervalSource] = useState<any>('');
	const [disableIntervalSource, setDisableIntervalSource] = useState<boolean>(false);
	const [commRecordPeriod, setCommRecordPeriod] = useState<any>('');
	const [intervalNumber, setIntervalNumber] = useState<any>('');
	const [disableIntervalNumberGameActivity, setDisableIntervalNumberGameActivity] = useState<boolean>(false);
	const [existingGoalName, setExistingGoalName] = useState<any>('');
	const [staticDataSourceOptions, setStaticDataSourceOptions] = useState<Array<LookupModel>>([]);
	const {enforceNumberValidationNoPeriod} = useCampaignSettingConstant();
	const [isDisableMinMax, setIsDisableMinMax] = useState<boolean>(false);
	//Watchers
	useEffect(() => {
		if (
			thresholdType &&
			transactionType &&
			thresholdType.value === MasterReferenceChild.ThresholdTypeCount.toString() &&
			transactionType.value === MasterReferenceChild.TransactionTypeLoss.toString()
		) {
			setIsDisableMinMax(true);
			setGoalTypeGameActivityCurrMinMaxUdtModelList([]);
			let lists: Array<any> = [];
			currencyList.forEach((d) => {
				const requestGoalTypeGameActivityCurrencyListData: GoalTypeGameActivityCurrMinMaxUdtModel = {
					goalTypeGameActivityCurrMinMaxId: 0,
					goalTypeGameActivityId: 0,
					currencyId: +d.value,
					min: 1,
					createdBy: userAccessId,
					updatedBy: userAccessId,
					goalTypeGuid: goalTypeGuidId,
				};
				lists.push(requestGoalTypeGameActivityCurrencyListData);
			});
			setGoalTypeGameActivityCurrMinMaxUdtModelList(lists);
		} else {
			setIsDisableMinMax(false);
		}
	}, [thresholdType, transactionType]);
	useEffect(() => {
		if (!goalTypeGameActivityUdtModel) {
			goalTypeGameActivityUdtModel = {
				goalTypeGuid: goalTypeGuidId,
				campaignSettingId: 0,
				createdBy: userAccessId,
				goalTypeDataSourceId: 0,
				goalTypeDataSourceName: '',
				goalTypeGameActivityId: 0,
				goalTypeId: GoalType.GameActivityId,
				goalTypeName: '',
				goalTypePeriodId: 0,
				goalTypePeriodName: '',
				goalTypeProductId: '',
				goalTypeTransactionTypeId: 0,
				intervalNumber: 0,
				intervalRelationalOperatorId: 0,
				intervalSourceId: 0,
				thresholdTypeId: 0,
				updatedBy: 0,
				goalTypeProductIds: '',
				intervalRelationalOperatorName: '',
				intervalSourceName: '',
				intervalSourceGoalTypeId: 0,
				intervalSourceGoalTypeGUID: '',
				goalName: 'Game Activity',
			};
			setGoalTypeGameActivityUdtModel(goalTypeGameActivityUdtModel);
		}
	}, [goalTypeGameActivityUdtModel]);

	useEffect(() => {
		if (masterReferenceGoalActivity && masterReferenceGoalActivity.length > 0) {
			const results = masterReferenceGoalActivity
				.filter((obj) => {
					if (obj.masterReferenceParentId == MasterReference.GoalTypeIntervalRelationalOperator) return obj;
				})
				.map((obj) => obj.options);
			const result = results.find((e) => +e.value === MasterReferenceChild.OnorAfter);

			if (goalTypeGameActivityUdtModel && goalTypeGameActivityUdtModel.intervalRelationalOperatorId === 0 && result) {
				goalTypeGameActivityUdtModel.intervalRelationalOperatorId = +result?.value;
				goalTypeGameActivityUdtModel.intervalRelationalOperatorName = result?.label;
				setGoalTypeGameActivityUdtModel(goalTypeGameActivityUdtModel);

				setInterval(result);
			}

			const aggEndDateDefault = masterReferenceGoalActivity
				.filter(
					(obj) =>
						obj.masterReferenceParentId == MasterReference.GameActivityDateSource &&
						obj.options.value === MasterReferenceChild.AggEndDateGameActivity.toString()
				)
				.map((obj) => obj.options);

			if (aggEndDateDefault.length > 0) {
				onchangeDataSource(aggEndDateDefault[0]); // Set default value selected for data source
			}
			const depositPeriods = masterReferenceGoalActivity.filter((obj) => obj.masterReferenceParentId == MasterReference.DepositPeriod).map((obj) => obj.options);
			if (depositPeriods.length > 0 && action === GoalSettingCommons.ADD) {
				onchangeCommRecordPeriod(depositPeriods[0]); // Set default value selected for period
			}
			setDisableIntervalNumberGameActivity(true);
			loadDataGameActivity();
		}
	}, [masterReferenceGoalActivity]);
	useEffect(() => {
		if ((action === GoalSettingCommons.EDIT || action === GoalSettingCommons.VIEW) && staticDataSourceOptions && staticDataSourceOptions.length > 0) {
			const item = staticDataSourceOptions.find((d) => d.value === goalTypeGameActivityUdtModel?.intervalSourceId.toString());
			onchangeIntervalSource(item);
		}
	}, [staticDataSourceOptions]);
	//Events
	const loadDataGameActivity = async () => {
		if ((action !== GoalSettingCommons.EDIT && action !== GoalSettingCommons.VIEW) && goalTypeGameActivityUdtModel === undefined) {
			return
		}
		if (goalTypeGameActivityUdtModel?.goalTypeTransactionTypeId) {
			const transactionTypeOptions = masterReferenceGoalActivity
				.filter((obj) => obj.masterReferenceParentId == MasterReference.GameActivityTransactionType)
				.map((obj) => obj.options);
			setTransactionType(transactionTypeOptions.find((mt) => mt.value === goalTypeGameActivityUdtModel?.goalTypeTransactionTypeId.toString()));
		}

		if (goalTypeGameActivityUdtModel?.goalTypeProductId) {
			const productOptions = await masterReferenceGoalActivity
				.filter((obj) => obj.masterReferenceParentId == MasterReference.GameActivityProductType)
				.map((obj) => obj.options);

			const arrayProduct = goalTypeGameActivityUdtModel?.goalTypeProductId.split(',') || [];;
			
			const mappedProduct = arrayProduct.map(item => productOptions.find(x => x.value === item)).filter(Boolean);

			setProduct(mappedProduct);
		}

		if (goalTypeGameActivityUdtModel?.thresholdTypeId) {
			const thresholdTypeptions = masterReferenceGoalActivity
				.filter((obj) => obj.masterReferenceParentId == MasterReference.ThresholdDepositTransactionType)
				.map((obj) => obj.options);
			setThresholdType(thresholdTypeptions.find((mt) => mt.value === goalTypeGameActivityUdtModel?.thresholdTypeId.toString()));
		}

		if (goalTypeGameActivityUdtModel?.goalTypeDataSourceId) {
			const dataSourceOptions = masterReferenceGoalActivity
				.filter((obj) => obj.masterReferenceParentId == MasterReference.GameActivityDateSource)
				.map((obj) => obj.options);

			onchangeDataSource(dataSourceOptions.find((mt) => mt.value.toString() === goalTypeGameActivityUdtModel?.goalTypeDataSourceId.toString()));
		}

		//setInterval - relationalOperator
		if (goalTypeGameActivityUdtModel?.intervalRelationalOperatorId) {
			const intervalRelationalOperator = masterReferenceGoalActivity
				.filter((obj) => obj.masterReferenceParentId == MasterReference.GoalTypeIntervalRelationalOperator)
				.map((obj) => obj.options);
			onchangeIntervalGameActivity(intervalRelationalOperator.find((d) => d.value === goalTypeGameActivityUdtModel?.intervalRelationalOperatorId.toString()));
		}

		//for interval data source
		gameActivityIntervalDatasource(goalTypeGameActivityUdtModel);

		if (goalTypeGameActivityUdtModel?.goalTypePeriodId) {
			const commOptions = masterReferenceGoalActivity.filter((obj) => obj.masterReferenceParentId == MasterReference.DepositPeriod).map((obj) => obj.options);
			onchangeCommRecordPeriod(commOptions.find((mt) => mt.value.toString() === goalTypeGameActivityUdtModel?.goalTypePeriodId.toString()));
		}
		if (goalTypeGameActivityUdtModel?.intervalNumber) {
			setIntervalNumber(goalTypeGameActivityUdtModel?.intervalNumber);
		}
	};
	const gameActivityIntervalDatasource=(goalTypeGameActivityUdtModel?: GoalTypeGameActivityUdtModel) => {
		if (goalTypeGameActivityUdtModel && goalTypeGameActivityUdtModel?.intervalSourceGoalTypeId > 0) {
			const item = existingGoalTypeList.find((d) => +d.value === goalTypeGameActivityUdtModel?.intervalSourceGoalTypeId);
			if (item) onchangeExistingGoalName(item);
		} else if (goalTypeGameActivityUdtModel?.intervalSourceGoalTypeGUID) {
			const item = existingGoalTypeList.find((d) => d.data.goalTypeGuid === goalTypeGameActivityUdtModel?.intervalSourceGoalTypeGUID);
			if (item) onchangeExistingGoalName(item);
		} else if (goalTypeGameActivityUdtModel?.intervalSourceGoalTypeId === 0) {
			onchangeExistingGoalName({ label: 'static', value: '0' });
		}
	}
	const onchangeTransactionType = (val: any) => {
		if (goalTypeGameActivityUdtModel) {
			goalTypeGameActivityUdtModel.goalTypeTransactionTypeId = +val?.value;
			setGoalTypeGameActivityUdtModel(goalTypeGameActivityUdtModel);
		}
		setTransactionType(val);
	};
	const onchangeProduct = (val: Array<any>) => {
		if (goalTypeGameActivityUdtModel) {
			const results = val.map((d) => d.value);
			goalTypeGameActivityUdtModel.goalTypeProductId = String(results);
			setGoalTypeGameActivityUdtModel(goalTypeGameActivityUdtModel);
		}
		setProduct(val);
	};
	const onchangeThresholdType = (val: any) => {
		if (goalTypeGameActivityUdtModel) {
			goalTypeGameActivityUdtModel.thresholdTypeId = +val?.value;
			setGoalTypeGameActivityUdtModel(goalTypeGameActivityUdtModel);
		}
		setThresholdType(val);
	};
	const onchangeDataSource = (val: any) => {
		if (goalTypeGameActivityUdtModel) {
			goalTypeGameActivityUdtModel.goalTypeDataSourceId = +val?.value;
			goalTypeGameActivityUdtModel.goalTypeDataSourceName = val?.label;
			setGoalTypeGameActivityUdtModel(goalTypeGameActivityUdtModel);
		}
		setDataSource(val);
	};

	const onchangeIntervalGameActivity = (val: any) => {
		if (goalTypeGameActivityUdtModel) {
			goalTypeGameActivityUdtModel.intervalRelationalOperatorId = +val?.value;
			goalTypeGameActivityUdtModel.intervalRelationalOperatorName = val?.label;
			setGoalTypeGameActivityUdtModel(goalTypeGameActivityUdtModel);
		}
		if (
			goalTypeGameActivityUdtModel &&
			(goalTypeGameActivityUdtModel.intervalRelationalOperatorId == MasterReferenceChild.OnorAfter ||
				goalTypeGameActivityUdtModel.intervalRelationalOperatorId == MasterReferenceChild.OnorBefore)
		) {
			setDisableIntervalNumberGameActivity(true);
			setIntervalNumber('');
		} else setDisableIntervalNumberGameActivity(false);
		setInterval(val);
	};
	const onchangeIntervalSource = (val:any) => {
		if (goalTypeGameActivityUdtModel) {
			goalTypeGameActivityUdtModel.intervalSourceId = +val?.value;
			goalTypeGameActivityUdtModel.intervalSourceName = val?.label;
			setGoalTypeGameActivityUdtModel(goalTypeGameActivityUdtModel);
		}
		setIntervalSource(val);
	};
	const onchangeCommRecordPeriod = (val:any) => {
		if (goalTypeGameActivityUdtModel) {
			goalTypeGameActivityUdtModel.goalTypePeriodId = +val?.value;
			goalTypeGameActivityUdtModel.goalTypePeriodName = val?.label;
			setGoalTypeGameActivityUdtModel(goalTypeGameActivityUdtModel);
		}
		setCommRecordPeriod(val);
	};
	const enforceNumberValidationGameActivity = (e: any) => {
		let checkIfNumber;
		if (e.key !== undefined) {
			// Check if it's a "e", "+" or "-"
			checkIfNumber = e.key === 'e' || e.key === '+' || e.key === '-';
		} else if (e.keyCode !== undefined) {
			// Check if it's a "e" (69), "." (190), "+" (187) or "-" (189)
			checkIfNumber = e.keyCode === 69 || e.keyCode === 190 || e.keyCode === 187 || e.keyCode === 189;
		}
		return checkIfNumber && e.preventDefault();
	};
	const onChangeIntervalNumberGameActivity = (val:any) => {
		if (goalTypeGameActivityUdtModel) {
			goalTypeGameActivityUdtModel.intervalNumber = +val.target.value;
			setGoalTypeGameActivityUdtModel(goalTypeGameActivityUdtModel);
		}
		setIntervalNumber(val.target.value);
	};
	const onchangeExistingGoalName = (val:any) => {
		if (goalTypeGameActivityUdtModel) {
			const results = masterReferenceGoalActivity
				.filter((obj) => {
					if (obj.masterReferenceParentId == MasterReference.GoalTypeCommunicationIntervalSource) return obj;
				})
				.map((obj) => obj.options);
			setIntervalSource(null);
			if (val?.label === 'static') {
				setStaticDataSourceOptions(results);
				setDisableIntervalSource(false);
				goalTypeGameActivityUdtModel.intervalSourceGoalTypeGUID = undefined;
				if (results.findIndex((d) => d.value === goalTypeGameActivityUdtModel?.intervalSourceId.toString()) == -1) {
					goalTypeGameActivityUdtModel.intervalSourceId = 0;
					goalTypeGameActivityUdtModel.intervalSourceName = '';
				}
			} else {
				setDisableIntervalSource(true);
				const selectedGoalDataSource = {value: String(val.data.goalTypeDataSourceId), label: val.data.goalTypeDataSourceName};
				setStaticDataSourceOptions([selectedGoalDataSource]);
				onchangeIntervalSource(selectedGoalDataSource);
				goalTypeGameActivityUdtModel.intervalSourceGoalTypeGUID = val?.data?.goalTypeGuid;
			}

			goalTypeGameActivityUdtModel.intervalSourceGoalTypeId = +val.value;
			goalTypeGameActivityUdtModel.intervalSourceGoalTypeName = val.label;
			setGoalTypeGameActivityUdtModel(goalTypeGameActivityUdtModel);
		}
		setExistingGoalName(val);
	};
	const onCurrencyChangedAdd = (currencyValue: number, currencyId: number,  minMax: string, storedGoalTypeGameActivityCurrencyListData : Array<GoalTypeGameActivityCurrMinMaxUdtModel> , currencyIndex : number) => {
		if (currencyIndex !== -1) {
			const requestGoalTypeGameActivityCurrencyMinUdtModelGameActivity: GoalTypeGameActivityCurrMinMaxUdtModel = {
				goalTypeGameActivityCurrMinMaxId: storedGoalTypeGameActivityCurrencyListData[currencyIndex].goalTypeGameActivityCurrMinMaxId,
				currencyId: storedGoalTypeGameActivityCurrencyListData[currencyIndex].currencyId,
				goalTypeGameActivityId: storedGoalTypeGameActivityCurrencyListData[currencyIndex].goalTypeGameActivityId,
				min: minMax === GoalSettingCommons.MIN ? currencyValue : storedGoalTypeGameActivityCurrencyListData[currencyIndex].min,
				createdBy: userAccessId,
				updatedBy: userAccessId,
				goalTypeGuid: goalTypeGuidId,
			};

			const goalTypGameActivityCurrencyMinUdtModelListTemp = goalTypeGameActivityCurrMinMaxUdtModelList.filter(
				(d) => d.currencyId !== requestGoalTypeGameActivityCurrencyMinUdtModelGameActivity.currencyId
			);
			setGoalTypeGameActivityCurrMinMaxUdtModelList([
				...goalTypGameActivityCurrencyMinUdtModelListTemp,
				...[requestGoalTypeGameActivityCurrencyMinUdtModelGameActivity],
			]);
		} else {
			const requestGoalTypeGameActivityCurrencyListDataGameActivity: GoalTypeGameActivityCurrMinMaxUdtModel = {
				goalTypeGameActivityCurrMinMaxId: 0,
				goalTypeGameActivityId: 0,
				currencyId: currencyId,
				min: minMax === GoalSettingCommons.MIN ? currencyValue : 0,
				createdBy: userAccessId,
				updatedBy: userAccessId,
				goalTypeGuid: goalTypeGuidId,
			};
			setGoalTypeGameActivityCurrMinMaxUdtModelList([
				...storedGoalTypeGameActivityCurrencyListData,
				...[requestGoalTypeGameActivityCurrencyListDataGameActivity],
			]);
		}
	}
	const onCurrencyChangedNotAdd = (currencyValue: number, currencyId: number,  minMax: string, storedGoalTypeGameActivityCurrencyListData : Array<GoalTypeGameActivityCurrMinMaxUdtModel> , currencyIndex : number) => {
		if (currencyIndex !== -1) {
			const requestGoalTypeGameActivityCurrencyMinUdtModelGameActivity: GoalTypeGameActivityCurrMinMaxUdtModel = {
				goalTypeGameActivityCurrMinMaxId: storedGoalTypeGameActivityCurrencyListData[currencyIndex].goalTypeGameActivityCurrMinMaxId,
				currencyId: storedGoalTypeGameActivityCurrencyListData[currencyIndex].currencyId,
				goalTypeGameActivityId: storedGoalTypeGameActivityCurrencyListData[currencyIndex].goalTypeGameActivityId,
				min: minMax === GoalSettingCommons.MIN ? currencyValue : storedGoalTypeGameActivityCurrencyListData[currencyIndex].min,
				createdBy: userAccessId,
				updatedBy: userAccessId,
				goalTypeGuid: goalTypeGuidId,
			};

			const goalTypGameActivityCurrencyMinUdtModelListTempGameActivity = goalTypeGameActivityCurrMinMaxUdtModelList.filter(
				(d) => d.currencyId !== requestGoalTypeGameActivityCurrencyMinUdtModelGameActivity.currencyId
			);
			setGoalTypeGameActivityCurrMinMaxUdtModelList([
				...goalTypGameActivityCurrencyMinUdtModelListTempGameActivity,
				...[requestGoalTypeGameActivityCurrencyMinUdtModelGameActivity],
			]);
		} else {
			const requestGoalTypeGameActivityCurrencyMinUdtModelGameActivity: GoalTypeGameActivityCurrMinMaxUdtModel = {
				goalTypeGameActivityCurrMinMaxId: 0,
				currencyId: currencyId,
				goalTypeGameActivityId: 0,
				min: minMax === GoalSettingCommons.MIN ? currencyValue : 0,
				createdBy: userAccessId,
				updatedBy: userAccessId,
				goalTypeGuid: goalTypeGuidId,
			};
			setGoalTypeGameActivityCurrMinMaxUdtModelList([
				...goalTypeGameActivityCurrMinMaxUdtModelList,
				...[requestGoalTypeGameActivityCurrencyMinUdtModelGameActivity],
			]);
		}
	}
	const onCurrencyChanged = (currencyValue: number, currencyId: number, currencyCode: string, minMax: string) => {
		let storedGoalTypeGameActivityCurrencyListData =
			goalTypeGameActivityCurrMinMaxUdtModelList !== undefined ? goalTypeGameActivityCurrMinMaxUdtModelList : [];
		let currencyIndex = goalTypeGameActivityCurrMinMaxUdtModelList.findIndex(
			(c: any) => c.currencyId === currencyId && c.goalTypeGuid === goalTypeGuidId
		);
		if (action === GoalSettingCommons.ADD) {
			onCurrencyChangedAdd(currencyValue,currencyId,minMax,storedGoalTypeGameActivityCurrencyListData,currencyIndex);
		} else {
			onCurrencyChangedNotAdd(currencyValue,currencyId,minMax,storedGoalTypeGameActivityCurrencyListData,currencyIndex);
		}
	};
	return (
		<>
			<Row style={{marginTop: 10}}>
				<Col sm={12}>
					<label className='form-label-sm required'>Transaction Type</label>
					<Select
						style={{width: '100%'}}
						options={masterReferenceGoalActivity
							.filter((obj) => obj.masterReferenceParentId == MasterReference.GameActivityTransactionType)
							.map((obj) => obj.options)}
						onChange={onchangeTransactionType}
						value={transactionType}
						isDisabled={viewMode || isMapped}
					/>
				</Col>
			</Row>
			<Row style={{marginTop: 10}}>
				<Col sm={12}>
					<label className='form-label-sm required'>Product</label>
					<Select
						isMulti
						style={{width: '100%'}}
						options={masterReferenceGoalActivity
							.filter((obj) => obj.masterReferenceParentId == MasterReference.GameActivityProductType)
							.map((obj) => obj.options)}
						onChange={onchangeProduct}
						value={product}
						isDisabled={viewMode}
					/>
				</Col>
			</Row>
			<Row style={{marginTop: 10}}>
				<Col sm={12}>
					<label className='form-label-sm required'>Threshold Type</label>
					<Select
						style={{width: '100%'}}
						options={masterReferenceGoalActivity
							.filter((obj) => obj.masterReferenceParentId == MasterReference.ThresholdDepositTransactionType)
							.map((obj) => obj.options)}
						onChange={onchangeThresholdType}
						value={thresholdType}
						isDisabled={viewMode}
					/>
				</Col>
			</Row>
			<Row style={{marginTop: 10}}>
				<Col sm={12}>
					<label className='form-label-sm required'>Date Source</label>
					<Select
						style={{width: '100%'}}
						options={masterReferenceGoalActivity
							.filter(
								(obj) =>
									obj.masterReferenceParentId == MasterReference.GameActivityDateSource &&
									obj.options.value === MasterReferenceChild.AggEndDateGameActivity.toString()
							)
							.map((obj) => obj.options)}
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
						options={masterReferenceGoalActivity
							.filter((obj) => obj.masterReferenceParentId == MasterReference.GoalTypeIntervalRelationalOperator)
							.map((obj) => obj.options)}
						onChange={onchangeIntervalGameActivity}
						value={interval}
						isDisabled={viewMode}
					/>
				</Col>
				<Col sm={4}>
					<label className='form-label-sm'></label>
					<Select
						style={{width: '100%'}}
						options={existingGoalTypeList}
						onChange={onchangeExistingGoalName}
						value={existingGoalName}
						isDisabled={viewMode}
					/>
				</Col>
				<Col sm={3}>
					<label className='form-label-sm'></label>
					<Select
						style={{width: '100%'}}
						options={staticDataSourceOptions}
						onChange={onchangeIntervalSource}
						value={intervalSource}
						isDisabled={disableIntervalSource || viewMode}
					/>
				</Col>
				<Col sm={2}>
					<label className='form-label-sm'></label>
					<input
						type='number'
						className='form-control form-control-sm'
						aria-label='{c.currencCode} Min'
						min='1'
						value={intervalNumber}
						onChange={onChangeIntervalNumberGameActivity}
						disabled={disableIntervalNumberGameActivity || viewMode}
						onKeyPress={enforceNumberValidationNoPeriod}
					/>
				</Col>
			</Row>
			<Row style={{marginTop: 10}}>
				<Col sm={12}>
					<label className='form-label-sm required'>Period</label>
					<Select
						style={{width: '100%'}}
						options={masterReferenceGoalActivity.filter((obj) => obj.masterReferenceParentId == MasterReference.DepositPeriod).map((obj) => obj.options)}
						onChange={onchangeCommRecordPeriod}
						value={commRecordPeriod}
						isDisabled={viewMode}
					/>
				</Col>
			</Row>
			<Row style={{marginTop: 10}}>
				{action === GoalSettingCommons.ADD
					? currencyList.map((key: any, index: number) => {
							return (
								<Col key={key.label} sm={4}>
									<label className='form-label-sm required'>
										{key.label} Min {thresholdType?.label}
									</label>
									<input
										disabled={isDisableMinMax}
										type='number'
										className='form-control form-control-sm'
										aria-label='{c.currencCode} Min'
										min='1'
										onKeyPress={
											thresholdType && thresholdType.value === ThresholdDeposit.Count.toString()
												? enforceNumberValidationNoPeriod
												: enforceNumberValidationGameActivity
										}
										max={
											thresholdType &&
											transactionType &&
											thresholdType.value === MasterReferenceChild.ThresholdTypeCount.toString() &&
											transactionType.value === MasterReferenceChild.TransactionTypeLoss.toString()
												? 1
												: 999999
										}
										value={goalTypeGameActivityCurrMinMaxUdtModelList.find((d) => d.currencyId.toString() === key.value)?.min}
										onChange={(value) => onCurrencyChanged(parseFloat(value.target.value), parseInt(key.value), key.label, GoalSettingCommons.MIN)}
									/>
								</Col>
							);
					  })
					: currencyList.map((key: any, index: number) => {
							return (
								<Col key={key.label} sm={4}>
									<label className='form-label-sm required'>
										{key.label} Min {thresholdType?.label}
									</label>
									<input
										disabled={isDisableMinMax || viewMode}
										type='number'
										className='form-control form-control-sm'
										aria-label='{c.currencCode} Min'
										min='1'
										onKeyPress={
											thresholdType && thresholdType.value === ThresholdDeposit.Count.toString()
												? enforceNumberValidationNoPeriod
												: enforceNumberValidationGameActivity
										}
										max={
											thresholdType &&
											transactionType &&
											thresholdType.value === MasterReferenceChild.ThresholdTypeCount.toString() &&
											transactionType.value === MasterReferenceChild.TransactionTypeLoss.toString()
												? 1
												: 999999
										}
										value={goalTypeGameActivityCurrMinMaxUdtModelList.find((d) => d.currencyId == key.value)?.min}
										onChange={(value) => onCurrencyChanged(parseFloat(value.target.value), parseInt(key.value), key.label, GoalSettingCommons.MIN)}
									/>
								</Col>
							);
					  })}
			</Row>
		</>
	);
};

export default GoalTypeGameActivity;
