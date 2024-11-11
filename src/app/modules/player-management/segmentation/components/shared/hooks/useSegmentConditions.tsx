import React, {useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../../../setup';
import {SegmentConditionType} from '../../../../../../constants/Constants';
import {SegmentConditionModel, SegmentConditionSaveRequestModel} from '../../../models';
import {ISegmentationState} from '../../../redux/SegmentationRedux';

const useSegmentConditions = () => {
	const {segmentLookups} = useSelector<RootState>(({segment}) => segment, shallowEqual) as ISegmentationState;
	const [segmentConditions, setSegmentConditions] = useState<Array<SegmentConditionModel>>([]);

	const updateSegmentConditions = (list: Array<SegmentConditionModel>) => {
		setSegmentConditions(list);
	};

	const mapToSegmentConditionModel = (isStatic: boolean, list: Array<SegmentConditionSaveRequestModel>) => {
		const segmentConditionModelList = list.map((item: SegmentConditionSaveRequestModel) => {
			const fieldObj = segmentLookups?.fieldList.find((i) => i.id === item.segmentConditionFieldId);
			const opObj = segmentLookups?.operatorList.find((i) => i.id === item.relationalOperatorId);
			const condition: SegmentConditionModel = {
				segmentConditionId: item.segmentConditionId,
				segmentConditionType: item.segmentConditionType as SegmentConditionType,
				segmentConditionLogicOperator: item.segmentConditionLogicOperator,
				segmentConditionFieldId: item.segmentConditionFieldId,
				fieldValue: fieldObj ? fieldObj.value : '',
				relationalOperatorId: item.relationalOperatorId,
				relationalOperatorValue: opObj ? opObj.value : '',
				segmentConditionValue: isStatic
					? item.segmentConditionValue.substring(0, item.segmentConditionValue.length > 500 ? 500 : item.segmentConditionValue.length)
					: item.segmentConditionValue,
				segmentConditionValue2: item.segmentConditionValue2,
				key: item.key,
				parentKey: item.parentKey,
			};
			return condition;
		});
		return segmentConditionModelList;
	};

	return {segmentConditions, updateSegmentConditions, mapToSegmentConditionModel};
};

export default useSegmentConditions;
