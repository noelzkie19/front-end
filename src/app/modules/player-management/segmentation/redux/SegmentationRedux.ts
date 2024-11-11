import {SegmentSaveRequestModel} from './../models/requests/SegmentSaveRequestModel';
import storage from 'redux-persist/lib/storage';
import {persistReducer} from 'redux-persist';
import {Action} from '@reduxjs/toolkit';
import {InFileSegmentPlayerModel, SegmentFilterFieldResponseModel, SegmentFilterOperatorResponseModel, SegmentLookupsResponseModel} from '../models';
import {SegmentConditionModel} from '../models/SegmentConditionModel';
import { SegmentVarianceModel } from '../models/SegmentVarianceModel';
import { InFilePlayersResponseModel } from '../models/response/InFilePlayersResponseModel';

export interface ISegmentationState {
	segmentInfo?: SegmentSaveRequestModel;
	segmentConditions?: Array<SegmentConditionModel>;
	filterFields?: Array<SegmentFilterFieldResponseModel>;
	filterOperators?: Array<SegmentFilterOperatorResponseModel>;
	isView?: boolean;
	isStatic?: boolean;
	segmentLookups?: SegmentLookupsResponseModel;
	segmentVarianceList?: Array<SegmentVarianceModel>;
	segmentInFilePlayerIdsList?: Array<InFileSegmentPlayerModel>;
}

const initialSegmentationState: ISegmentationState = {
	segmentInfo: undefined,
	segmentConditions: [],
	filterFields: [],
	filterOperators: [],
	isView: false,
	isStatic: false,
	segmentLookups: undefined,
	segmentVarianceList: [],
	segmentInFilePlayerIdsList: []
};

export interface ActionWithPayload<T> extends Action {
	payload?: T;
}

export const actionTypes = {
	segmentInfo: 'setSegmentInfo',
	setSegmentConditions: 'segSegmentConditions',
	setFilterFields: 'setFilterFields',
	setFilterOperators: 'setFilterOperators',
	setIsView: 'setIsView',
	resetForm: 'resetForm',
	setIsStatic: 'setIsStatic',
	setSegmentLookups: 'setSegmentLookups',
	setSegmentVarianceList: 'setSegmentVarianceList',
	setSegmentInFilePlayerIdsList: 'setSegmentInFilePlayerIdsList'
};

export const actions = {
	setSegmentInfo: (segmentInfo: SegmentSaveRequestModel) => ({
		type: actionTypes.segmentInfo,
		payload: {segmentInfo},
	}),
	setSegmentConditions: (segmentConditions: SegmentConditionModel[]) => ({
		type: actionTypes.setSegmentConditions,
		payload: {segmentConditions},
	}),
	setFilterFields: (filterFields: SegmentFilterFieldResponseModel[]) => ({
		type: actionTypes.setFilterFields,
		payload: {filterFields},
	}),
	setFilterOperators: (filterOperators: SegmentFilterOperatorResponseModel[]) => ({
		type: actionTypes.setFilterOperators,
		payload: {filterOperators},
	}),
	setIsView: (isView: boolean) => ({type: actionTypes.setIsView, payload: {isView}}),
	setIsStatic: (isStatic: boolean) => ({type: actionTypes.setIsStatic, payload: {isStatic}}),
	resetForm: () => ({type: actionTypes.resetForm}),
	setSegmentLookups: (segmentLookups: SegmentLookupsResponseModel) => ({
		type: actionTypes.setSegmentLookups,
		payload: {segmentLookups},
	}),
	setSegmentVarianceList: (segmentVarianceList: SegmentVarianceModel[]) => ({
		type: actionTypes.setSegmentVarianceList,
		payload: {segmentVarianceList}
	}),
	setSegmentInFilePlayerIdsList: (segmentInFilePlayerIdsList: InFileSegmentPlayerModel[]) => ({
		type: actionTypes.setSegmentInFilePlayerIdsList,
		payload: {segmentInFilePlayerIdsList}
	}),
};

export const reducer = persistReducer(
	{
		storage,
		key: 'mlab-persist-segment',
		whitelist: ['segmentInfo', 'segmentConditions', 'filterFields', 'filterOperators', 'isView', 'isStatic', 'segmentLookups', 'segmentVarianceList', 'segmentInFilePlayerIdsList'],
	},
	(state: ISegmentationState = initialSegmentationState, action: ActionWithPayload<ISegmentationState>) => {
		switch (action.type) {
			case actionTypes.segmentInfo: {
				const getData = action.payload?.segmentInfo;
				return {...state, segmentInfo: getData};
			}
			case actionTypes.setSegmentConditions: {
				const getData = action.payload?.segmentConditions;
				return {...state, segmentConditions: getData};
			}
			case actionTypes.setFilterFields: {
				const getData = action.payload?.filterFields;
				return {...state, filterFields: getData};
			}
			case actionTypes.setFilterOperators: {
				const getData = action.payload?.filterOperators;
				return {...state, filterOperators: getData};
			}
			case actionTypes.setIsView: {
				const getData = action.payload?.isView;
				return {...state, isView: getData};
			}
			case actionTypes.setIsStatic: {
				const getData = action.payload?.isStatic;
				return {...state, isStatic: getData};
			}
			case actionTypes.resetForm: {
				return {
					...state,
					segmentInfo: {} as SegmentSaveRequestModel,
					segmentConditions: [],
					isView: false,
					isStatic: false,
				};
			}
			case actionTypes.setSegmentLookups: {
				const getData = action.payload?.segmentLookups;
				return {...state, segmentLookups: getData};
			}			
			case actionTypes.setSegmentVarianceList: {
				const getData = action.payload?.segmentVarianceList;
				return {...state, segmentVarianceList: getData};
			}			
			case actionTypes.setSegmentInFilePlayerIdsList: {
				const getData = action.payload?.segmentInFilePlayerIdsList;
				return {...state, segmentInFilePlayerIdsList: getData};
			}
			default:
				return state;
		}
	}
);
