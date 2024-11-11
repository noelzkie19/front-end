import moment from 'moment';
import { useEffect, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../../../../../../../setup';
import {
	SegmentConditionDataTypesEnum,
	SegmentConditionLogicSubstringEnum,
	SegmentConditionOperatorsEnum,
	SegmentConditionType,
	SegmentConditionTypes,
	SegmentSourceTypes
} from '../../../../../../constants/Constants';
import { SegmentConditionModel, SegmentQueryItemModel } from '../../../models';
import { ISegmentationState } from '../../../redux/SegmentationRedux';
import useSegmentLookups from './useSegmentLookups';

const useQueryForm = (segmentConditions: Array<SegmentConditionModel>) => {
	const [stringQuery, setStringQuery] = useState('');
	const [stringQueryMLab, setStringQueryMLab] = useState('');
	const [stringQueryTableau, setStringQueryTableau] = useState('');
	const [tableJoins, setTableJoins] = useState('');
	const [styledQuery, setStyledQuery] = useState<Array<SegmentQueryItemModel>>([]);
	const {segmentLookups} = useSelector<RootState>(({segment}) => segment, shallowEqual) as ISegmentationState;
	const {getSegmentLookup} = useSegmentLookups();

	useEffect(() => {
		const {flattenedForm, styledForm, tableJoinForm} = generateQueryForm();
		const joinList = tableJoinForm.split('|||');
		const distinctList = joinList.filter((c, index) => {
			return joinList.indexOf(c) === index;
		});

		let mlabConditions = styledForm.filter(i => i.sourceTypeId ===  SegmentSourceTypes.Mlab).map(i => i.query).join(' ');
		let tableauConditions = styledForm.filter(i => i.sourceTypeId ===  SegmentSourceTypes.Tableau).map(i => i.query).join(' ');
		setStringQuery(flattenedForm);
		setStyledQuery([...styledForm]);
		setStringQueryMLab(removeHeadingConditionLogic(mlabConditions));
		setStringQueryTableau(removeHeadingConditionLogic(tableauConditions));
		setTableJoins(distinctList.join(' '));
	}, [segmentConditions]);

	const removeHeadingConditionLogic = (query: string) => {
		if(query.trim().indexOf(SegmentConditionLogicSubstringEnum.AND) === 0) {
			query = query.substring(4, query.length)
		} 

		if(query.trim().indexOf(SegmentConditionLogicSubstringEnum.OR) === 0) {
			query = query.substring(3, query.length)
		}

		return query;
	}

	const generateQueryForm = (conditions?: Array<SegmentConditionModel>) => {
		let tableJoinForm = '';
		let flattenedForm = '';
		let dynamicFieldLookupValue = '';
		let dynamicFieldValue: any;
		let styledForm: Array<SegmentQueryItemModel> = [];

		let conList: Array<SegmentConditionModel> = conditions ?? segmentConditions.filter((i) => i.parentKey === '' || i.parentKey === null);
		

		//Evaluate MLAB Conditions first
		conList = conList.sort(function (x, y) {
			let a = x.segmentConditionSourceId ? x.segmentConditionSourceId : segmentConditions?.find(i => i.parentKey === x.key && i.key !== x.key) ? segmentConditions?.find(i => i.parentKey === x.key && i.key !== x.key)?.segmentConditionSourceId : SegmentSourceTypes.Mlab,
				b = y.segmentConditionSourceId ? y.segmentConditionSourceId : segmentConditions?.find(i => i.parentKey === y.key && i.key !== y.key) ? segmentConditions?.find(i => i.parentKey === y.key && i.key !== y.key)?.segmentConditionSourceId : SegmentSourceTypes.Mlab;

			return a === b ? 0 : (a ?? 0) > (b ?? 0) ? 1 : -1;
		});
		
		//Generate Query Form
		conList.forEach((condition, index) => {
			const fieldInfo = segmentLookups?.fieldList.find((i) => i.id === condition.segmentConditionFieldId);
			const operatorInfo = segmentLookups?.operatorList.find((i) => i.id === condition.relationalOperatorId);

			if (fieldInfo) {
				tableJoinForm += `${index > 0 ? '|||' : ''}` + (fieldInfo.fieldSourceTable ? fieldInfo.fieldSourceTable : '');
			}

			if (condition.segmentConditionType === SegmentConditionType.Condition && fieldInfo?.segmentConditionTypeId === SegmentConditionTypes.Single) {
				let field = fieldInfo?.value;
				let operator = operatorInfo ? operatorInfo?.value : '';
				let value = condition.segmentConditionValue;
				// Check if enclosed in percentage
				if (
					operatorInfo &&
					(operatorInfo.value === SegmentConditionOperatorsEnum.Like || operatorInfo.value === SegmentConditionOperatorsEnum.NotLike)
				) {
					value = value.trim() !== '' ? `%${condition.segmentConditionValue}%` : '';
				}

				// Check if string or numeric
				if (
					fieldInfo &&
					(fieldInfo.dataType === SegmentConditionDataTypesEnum.varchar ||
						fieldInfo.dataType === SegmentConditionDataTypesEnum.datetime ||
						(operatorInfo &&
							(operatorInfo.value === SegmentConditionOperatorsEnum.Like || operatorInfo.value === SegmentConditionOperatorsEnum.NotLike)))
				) {
					if (fieldInfo.dataType === SegmentConditionDataTypesEnum.datetime) {
						field = `CAST(${field} AS DATETIME)`;
						value = value !== null && value !== undefined && value !== '' ? moment(value).format('YYYY-M-D HH:mm:ss') : '';
					}
					if(operatorInfo?.label !== SegmentConditionOperatorsEnum.InFile){
						value = value.trim() !== '' ? `'${value}'` : '';
					}
				}

				// Check if enclosed in Parenthesis
				if (operatorInfo && (operatorInfo.value === SegmentConditionOperatorsEnum.In || operatorInfo.value === SegmentConditionOperatorsEnum.NotIn)) {
					value = condition.segmentConditionValue.trim() !== '' ? `(${condition.segmentConditionValue})` : '';
				
					if (fieldInfo && fieldInfo.dataType === SegmentConditionDataTypesEnum.varchar) {
						const valueArray = condition.segmentConditionValue.split(',');
						value = valueArray.map((i) => `'${i.trim()}'`).join(',');
						value = value.trim() !== '' ? `(${value})` : '';
					}
				}

				//Check if operator is TRUE
				if (operatorInfo && operatorInfo.label === SegmentConditionOperatorsEnum.True) {
					//field = condition.fieldValue;
					operator = '=';
					value = '1';
				}

				//Check if operator is FALSE
				if (operatorInfo && operatorInfo.label === SegmentConditionOperatorsEnum.False) {
					//field = condition.fieldValue;
					operator = '=';
					value = '0';
				}

				// Added Special Condition for 'IsTaggedOnCampaignID'
				if (condition && condition.fieldValue === SegmentConditionOperatorsEnum.IsTagged) {
					field = '(CASE WHEN (SELECT COUNT(*) FROM CampaignPlayer CP WHERE CP.PlayerId = PlayerId) > 0 THEN 1 ELSE 0 END)';
				}

				//Dynamic field value assigment
				if (condition.segmentConditionFieldId == 87) {
					dynamicFieldLookupValue = value;
				}

				//Check if field is dynamic
				if (fieldInfo.isFieldDynamic) {
					//For Bonus Context - Status and Date Mapping
					let dynamicOptions = getSegmentLookup(fieldInfo.fieldLookupSource);
					const bonusContextDate = dynamicOptions.filter(x => x.value == dynamicFieldLookupValue);
					dynamicFieldValue = bonusContextDate ? bonusContextDate[0]?.label : '';
					field = field.replace('#1#', dynamicFieldValue);
				}

				let joinedCondition = `${field} ${operator} ${value}`;
				if (operatorInfo?.isTemplate) {
					let dynamicAlias = fieldInfo?.value.split('#1#');
					let templateFieldValue = fieldInfo.isFieldDynamic ? dynamicAlias[0] + dynamicFieldValue : fieldInfo?.value;
					joinedCondition = operatorInfo.value.replaceAll('#1#', templateFieldValue).replaceAll('#2#', condition.segmentConditionValue);
				}

				// Build condition
				let queryForm = (index > 0 ? ` ${condition.segmentConditionLogicOperator} ` : '') + joinedCondition;
			
				// Push to style query array
				styledForm.push({query: queryForm, sourceTypeId: fieldInfo.segmentConditionSourceId});

				// Append Condition to Query String
				flattenedForm += queryForm;
			} else {
				//Pass the child conditions to same function and repeat the process
				const innerQuery = generateQueryForm(segmentConditions.filter((i) => i.parentKey === condition.key));

				// Build result
				const queryForm = (index > 0 ? ` ${condition.segmentConditionLogicOperator} ` : '') + '(' + innerQuery.flattenedForm + ')';

				// Push to style query array
				const groupSourceTypeId = innerQuery.styledForm.length > 0 ? innerQuery.styledForm[0].sourceTypeId: SegmentSourceTypes.Mlab;
				styledForm.push({query: queryForm, sourceTypeId: groupSourceTypeId});


				// Append Condition to Query String
				flattenedForm += queryForm;
				tableJoinForm += innerQuery.tableJoinForm;
			}
		});

		return {flattenedForm, styledForm, tableJoinForm};
	};

	const getStaticQueryForm = (playerIds: string) => {
		return ' p.PlayerId IN (' + playerIds + ') ';
	};


	return {stringQuery, styledQuery, stringQueryMLab, stringQueryTableau, tableJoins, getStaticQueryForm};
};

export default useQueryForm;
