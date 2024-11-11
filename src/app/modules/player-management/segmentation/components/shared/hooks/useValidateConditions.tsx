import {shallowEqual, useSelector} from 'react-redux';
import {useParams} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../../../../setup';
import {
	HttpStatusCodeEnum,
	PROMPT_MESSAGES,
	SegmentConditionOperatorsEnum,
	SegmentConditionType,
	SegmentConditionTypes,
	SegmentPageAction,
	SegmentSourceTypes,
	SegmentTypes,
} from '../../../../../../constants/Constants';
import {SegmentConditionModel, SegmentConditionSaveRequestModel, SegmentFilterFieldResponseModel} from '../../../models';
import {ISegmentationState} from '../../../redux/SegmentationRedux';
import {validateSegmentCustomQuery, validateSegmentName} from '../../../redux/SegmentationService';

const useValidateConditions = () => {
	const {actionName} = useParams();
	const {segmentLookups} = useSelector<RootState>(({segment}) => segment, shallowEqual) as ISegmentationState;

	const validateConditions = (segmentConditions: Array<SegmentConditionSaveRequestModel>) => {
		let isValid = true;

		// Check if no conditions
		if (segmentConditions.length === 0 || segmentConditions.filter((i) => i.segmentConditionType === SegmentConditionType.Condition).length === 0) {
			isValid = false;
			swal(PROMPT_MESSAGES.FailedValidationTitle, 'Unable to proceed, kindly fill up the mandatory fields', 'error');
		}

		// Check if there are conditions with no selected field
		const emptyConditionField = segmentConditions.filter(
			(i) => i.segmentConditionType !== SegmentConditionType.Group && i.segmentConditionFieldId === 0
		);
		if (emptyConditionField.length > 0) {
			isValid = false;
			swal(PROMPT_MESSAGES.FailedValidationTitle, 'Unable to proceed, kindly fill up the mandatory fields', 'error');
		}

		// Check if there are empty group conditions
		const groupConditions = segmentConditions.filter((i) => i.segmentConditionType === SegmentConditionType.Group);
		if (groupConditions.length > 0) {
			const GroupWithNoChild = [];
			groupConditions.forEach((i) => {
				const groupChild = segmentConditions.filter((x) => x.parentKey === i.key);
				if (groupChild.length === 0) {
					GroupWithNoChild.push(i);
				}
			});

			// Not Valid if there are empty groups
			if (GroupWithNoChild.length > 0) {
				isValid = false;
				swal(PROMPT_MESSAGES.FailedValidationTitle, 'Unable to proceed, kindly fill up the mandatory fields', 'error');
			}
		}

		// Check the filter value and relational operator value of single conditions
		const singleConditionFields =
			segmentLookups?.fieldList.filter((i) => i.segmentConditionTypeId === SegmentConditionTypes.Single).map((i) => i.id) ?? [];
		const forValidateSegmentConditions = segmentConditions.filter(
			(i) => i.segmentConditionFieldId && singleConditionFields.includes(i.segmentConditionFieldId)
		);

		const invalidConditions = forValidateSegmentConditions.filter((i) => {
			return (
				i.segmentConditionValue.toString().trim() === '' ||
				i.segmentConditionValue.toString().trim() === '( )' ||
				i.segmentConditionFieldId?.toString().trim() === '' ||
				i.relationalOperatorId?.toString().trim() === '0' ||
				i.relationalOperatorId?.toString().trim() === undefined
			);
		}).length;
		if (invalidConditions > 0) {
			isValid = false;
			swal(PROMPT_MESSAGES.FailedValidationTitle, 'Unable to proceed, kindly fill up the mandatory fields', 'error');
		} else {
			//Validate Last x days
			segmentConditions.forEach((e) => {
				const operatorInfo = segmentLookups?.operatorList.find((i) => i.id === e.relationalOperatorId);
				if (operatorInfo && operatorInfo.label.includes('x days') && Number(e.segmentConditionValue) <= 0) {
					isValid = false;
					swal(PROMPT_MESSAGES.FailedValidationTitle, 'Unable to proceed, "' + operatorInfo.label + '" value should be greater than 0', 'error');
				}
			});
		}

		const inFileOperator = segmentLookups?.operatorList.find((i) => i.label === SegmentConditionOperatorsEnum.InFile);
		if (inFileOperator) {
			const inFileCondition = segmentConditions.find((i) => i.relationalOperatorId === inFileOperator?.id);
			if (inFileCondition && segmentConditions.length > 1) {
				isValid = false;
				swal(PROMPT_MESSAGES.FailedValidationTitle, 'Upload condition cannot be combined with other conditions.', 'error');
			}
		}

		return isValid;
	};

	const validateTestSegment = (
		tableauEventQueueId?: string,
		segmentConditions?: SegmentConditionModel[],
		queryFormTableauCurrent?: string,
		queryFormTableauPersisted?: string
	) => {
		let allowTestSegment = false;

		const fieldIdList = segmentConditions?.map((i) => i.segmentConditionFieldId);
		const tableauFields = segmentLookups?.fieldList.filter(
			(i: SegmentFilterFieldResponseModel) => fieldIdList?.includes(i.id) && i.segmentConditionSourceId === SegmentSourceTypes.Tableau
		);

		const tableauSyncCheck = tableauEventQueueId ? true : false;
		const tableauFieldsCheck = tableauFields && tableauFields.length > 0 ? false : true;
		const tableauQueryCheck = queryFormTableauCurrent === queryFormTableauPersisted;

		if (actionName === SegmentPageAction.VIEW) {
			allowTestSegment = tableauFieldsCheck ? tableauFieldsCheck : tableauSyncCheck;
		} else if (actionName === SegmentPageAction.EDIT) {
			allowTestSegment = tableauFieldsCheck ? tableauFieldsCheck : tableauSyncCheck && tableauQueryCheck;
		} else {
			allowTestSegment = tableauFieldsCheck;
		}

		return allowTestSegment;
	};

	const validateCustomQuery = async (customQuery: string) => {
		let isValid = true;
		const NoLock = 'nolock';
		if (customQuery.trim() === '') {
			isValid = false;
			swal(PROMPT_MESSAGES.FailedValidationTitle, 'Unable to proceed, kindly fill up the mandatory fields', 'error');
		} else if (!customQuery.toLowerCase().includes(NoLock)) {
			isValid = false;
			swal(PROMPT_MESSAGES.FailedValidationTitle, 'Unable to proceed, Please implement "NOLOCK" for the tables in the query.', 'error');
		} else if (customQuery.includes(';')) {
			isValid = false;
			swal(PROMPT_MESSAGES.FailedValidationTitle, 'Unable to proceed, Semi-colon is not allowed in the custom query.', 'error');
		}

		const response = await validateSegmentCustomQuery(customQuery);
		if (response.data && response.data.status !== HttpStatusCodeEnum.Ok) {
			isValid = false;
			swal(PROMPT_MESSAGES.FailedValidationTitle, 'Unable to proceed, Prohibited SQL keywords found in the custom query', 'error');
		}

		return isValid;
	};

	const validateRequiredFields = async (
		segmentInputType: string,
		segmentName: string,
		segmentDescription: string,
		segmentType: string,
		segmentObjectVarianceList: any,
		segmentId: number
	) => {
		let isValid = true;

		if (segmentInputType.trim() === '' || segmentName.trim() === '' || segmentDescription.trim() === '' || segmentType.trim() === '') {
			isValid = false;
			swal(PROMPT_MESSAGES.FailedValidationTitle, 'Unable to proceed, kindly fill up the mandatory fields', 'error');
		}

		if (actionName !== SegmentPageAction.VIEW) {
			const response = await validateSegmentName(segmentName, segmentId);
			if (response.data && response.data.status !== HttpStatusCodeEnum.Ok) {
				isValid = false;
				swal(PROMPT_MESSAGES.FailedValidationTitle, 'Unable to proceed, Segment Name already exists', 'error');
			}
		}

		if (segmentType === SegmentTypes.Distribution && segmentObjectVarianceList.length === 0) {
			isValid = false;
			swal(PROMPT_MESSAGES.FailedValidationTitle, 'Unable to proceed, kindly fill up the mandatory fields', 'error');
		}

		if (segmentType === SegmentTypes.Distribution && segmentObjectVarianceList.length > 0) {
			let varianceTotal = segmentObjectVarianceList.reduce(function (prev: any, current: any) {
				return prev + current.percentage;
			}, 0);

			if (varianceTotal < 100) {
				isValid = false;
				swal(
					PROMPT_MESSAGES.FailedValidationTitle,
					'Unable to proceed. Total Distribution percentage should be equal to 100% and a maximum of 3 Variance.',
					'error'
				);
			}
		}

		return isValid;
	};

	return {validateConditions, validateTestSegment, validateCustomQuery, validateRequiredFields};
};

export default useValidateConditions;
