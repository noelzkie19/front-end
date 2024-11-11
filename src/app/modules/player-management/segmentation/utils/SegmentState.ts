import {SegmentStateActionTypes} from '../../../../constants/Constants';
import {SegmentConditionModel, SegmentState} from '../models';
import {InFileSegmentPlayerModel} from '../models/InFileSegmentPlayerModel';
import {SegmentVarianceModel} from '../models/SegmentVarianceModel';

const initialSegmentState: SegmentState = {
	segmentId: 0,
	segmentName: '',
	segmentDescription: '',
	isActive: true,
	isStatic: false,
	staticParentId: undefined,
	staticPlayerIds: undefined,
	queryForm: '',
	segmentConditions: [] as Array<SegmentConditionModel>,
	segmentTypeId: 0,
	segmentVariances: [] as Array<SegmentVarianceModel>,
	InFileSegmentPlayer: [] as Array<InFileSegmentPlayerModel>,
	isReactivated: false,
};

const segmentReducer = (state: SegmentState = initialSegmentState, action: any) => {
	switch (action.type) {
		case SegmentStateActionTypes.SegmentInitialState:
			return {...state, ...action.payload};
		case SegmentStateActionTypes.SegmentName:
			return {...state, segmentName: action.payload};
		case SegmentStateActionTypes.SegmentDescription:
			return {...state, segmentDescription: action.payload};
		case SegmentStateActionTypes.SegmentStatus:
			return {...state, isActive: action.payload};
		case SegmentStateActionTypes.SegmentType:
			return {...state, segmentTypeId: action.payload};
		case SegmentStateActionTypes.SegmentQuery:
			return {...state, queryForm: action.payload};
		case SegmentStateActionTypes.SegmentConditions:
			return {...state, segmentConditions: action.payload};
		case SegmentStateActionTypes.SegmentVarianceList:
			return {...state, segmentVariances: action.payload};
		case SegmentStateActionTypes.ResetState:
			return initialSegmentState;
		default:
			return state;
	}
};

export {initialSegmentState, segmentReducer};
