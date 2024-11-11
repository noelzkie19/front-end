import axios from 'axios';
import {AppConfiguration} from 'read-appsettings-json';
import {
	SegmentConditionSaveRequestModel,
	SegmentConditionSetResponseModel,
	SegmentDistributionByFilterRequestModel,
	SegmentDistributionByFilterResponseModel,
	SegmentFilterFieldResponseModel,
	SegmentFilterOperatorResponseModel,
	SegmentFilterRequestModel,
	SegmentFilterResponseModel,
	SegmentLookupsResponseModel,
	SegmentSaveRequestModel,
	SegmentTestRequestModel,
	SegmentToStaticRequestModel,
	VarianceDistributionRequestModel,
} from '../models';
import {ValidateInFileRequestModels} from '../models/requests/ValidateInFileRequestModel';
import {InFilePlayersResponseModel} from '../models/response/InFilePlayersResponseModel';

const API_GATEWAY_URL: string = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL!;
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL;

const GET_SEGMENTATION_LIST: string = `${API_GATEWAY_URL}segment/GetSegmentationByFilter`;
const GET_SEGMENTATION_LIST_RESULT: string = `${API_CALLBACK_URL}segment/GetSegmentationByFilter`;

const GET_SEGMENT_BY_ID: string = `${API_GATEWAY_URL}segment/GetSegmentById`;
const VALIDATE_SEGMENT_NAME: string = `${API_GATEWAY_URL}segment/ValidateSegment`;

const DEACTIVATE_SEGMENT: string = `${API_GATEWAY_URL}segment/DeactivateSegment`;

const TEST_SEGMENT: string = `${API_GATEWAY_URL}segment/TestSegment`;
const TEST_SEGMENT_RESULT: string = `${API_CALLBACK_URL}segment/TestSegment`;

const TO_STATIC_SEGMENT: string = `${API_GATEWAY_URL}segment/ConvertToStaticSegment`;
const TO_STATIC_SEGMENT_RESULT: string = `${API_CALLBACK_URL}segment/ToStaticSegment`;

const GET_FILTER_FIELD_LIST: string = `${API_GATEWAY_URL}segment/GetSegmentConditionFilterFields`;
const GET_FILTER_OPERATOR_LIST: string = `${API_GATEWAY_URL}segment/GetSegmentConditionFilterOperators`;

const EXPORT_TO_CSV: string = `${API_GATEWAY_URL}segment/ExportToCSV`;
const TEST_STATIC_SEGMENT: string = `${API_GATEWAY_URL}segment/TestStaticSegment`;

const GET_SEGMENT_LOOKUPS: string = `${API_GATEWAY_URL}segment/GetSegmentLookups`;

const GET_SEGMENT_CONDITIONSET_BY_PARENTID: string = `${API_GATEWAY_URL}segment/GetSegmentConditionSetByParentId`;
const GET_SEGMENT_CAMPAIGNGOALNAMES_BY_CAMPAIGNID: string = `${API_GATEWAY_URL}segment/GetCampaignGoalNamesByCampaignId`;
const GET_SEGMENT_VARIANCE_BY_SEGMENT_ID: string = `${API_GATEWAY_URL}segment/GetVariancesBySegmentId`;

const UPSERT_SEGMENT: string = `${API_GATEWAY_URL}segment/UpsertSegment`;
const TRIGGER_VARIANCE_DISTRIBUTION_SERVICE: string = `${API_GATEWAY_URL}segment/TriggerVarianceDistribution`;
const EXPORT_DISTRIBUTION_TO_CSV: string = `${API_GATEWAY_URL}segment/VarianceDistributionExportToCSV`;

const GET_SEGMENT_CONDITIONS_BY_SEGMENTID = `${API_GATEWAY_URL}segment/GetSegmentConditionsBySegmentId`;

const VALIDATE_IN_FILE_PLAYER_IDS: string = `${API_GATEWAY_URL}segment/ValidateInFilePlayers`;
const CLEANUP_IN_FILE_PLAYER_STG_TABLE: string = `${API_GATEWAY_URL}segment/CleanUpFilePlayerStgTable`;
const GET_MESSAGESTATUS_BY_CASETYPEID: string = `${API_GATEWAY_URL}segment/GetMessageStatusByCaseTypeId`;
const GET_MESSAGERESPONSE_BY_MULTIPLE_STATUSID: string = `${API_GATEWAY_URL}segment/GetMessageResponseByMultipleId`;

const VALIDATE_CUSTOM_QUERY: string = `${API_GATEWAY_URL}segment/ValidateCustomQuery`;

export async function getSegmentationList(request: SegmentFilterRequestModel) {
	return axios.post(GET_SEGMENTATION_LIST, request);
}

export async function getSegmentationListResult(request: string) {
	return axios.get<SegmentFilterResponseModel>(GET_SEGMENTATION_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function getSegmentById(segmentId: number) {
	return axios.get(GET_SEGMENT_BY_ID, {
		params: {
			segmentId: segmentId,
		},
	});
}

export async function validateSegmentName(request: string, segmentId?: number) {
	return axios.get(VALIDATE_SEGMENT_NAME, {
		params: {
			segmentId: segmentId == 0 ? null : segmentId,
			segmentName: request,
		},
	});
}

export async function deactivateSegmentation(segmentId: number, userId: number) {
	return axios.get(DEACTIVATE_SEGMENT, {
		params: {
			segmentId: segmentId,
			userId: userId,
		},
	});
}

export async function testSegment(request: SegmentTestRequestModel) {
	return axios.post(TEST_SEGMENT, request);
}

export async function exportToCsv(request: SegmentTestRequestModel) {
	return axios.post(EXPORT_TO_CSV, request, {
		responseType: 'blob',
	});
}

export async function testSegmentResult(cacheId: string) {
	return axios.get(TEST_SEGMENT_RESULT, {
		params: {
			cachedId: cacheId,
		},
	});
}

export async function toStaticSegment(request: SegmentToStaticRequestModel) {
	return axios.post(TO_STATIC_SEGMENT, request);
}

export async function toStaticSegmentResult(cacheId: string) {
	return axios.get(TO_STATIC_SEGMENT_RESULT, {
		params: {
			cachedId: cacheId,
		},
	});
}

export async function getFilterFields() {
	return axios.get<Array<SegmentFilterFieldResponseModel>>(GET_FILTER_FIELD_LIST);
}

export async function getFilterOperators() {
	return axios.get<Array<SegmentFilterOperatorResponseModel>>(GET_FILTER_OPERATOR_LIST);
}

export async function testStaticSegment(request: SegmentTestRequestModel) {
	return axios.post(TEST_STATIC_SEGMENT, request);
}

export async function getSegmentLookups() {
	return axios.get<SegmentLookupsResponseModel>(GET_SEGMENT_LOOKUPS);
}

export async function getSegmentConditionSetByParentId(parentId: number) {
	return axios.get<Array<SegmentConditionSetResponseModel>>(GET_SEGMENT_CONDITIONSET_BY_PARENTID, {
		params: {
			parentSegmentConditionFieldId: parentId,
		},
	});
}

export async function getCampaignGoalNamesByCampaignId(campaignId: number) {
	return axios.get(GET_SEGMENT_CAMPAIGNGOALNAMES_BY_CAMPAIGNID, {
		params: {
			campaignId: campaignId,
		},
	});
}

export async function getVariancesBySegmentId(segmentId: number) {
	return axios.get(GET_SEGMENT_VARIANCE_BY_SEGMENT_ID, {
		params: {
			segmentId: segmentId,
		},
	});
}

export async function upsertSegment(request: SegmentSaveRequestModel) {
	return axios.post(UPSERT_SEGMENT, request);
}

export async function triggerVarianceDistributionService(request: VarianceDistributionRequestModel) {
	return axios.post(TRIGGER_VARIANCE_DISTRIBUTION_SERVICE, request);
}

const REQUEST_GET_SEGMENT_DISTRIBUTION_BY_FILTER: string = `${API_GATEWAY_URL}segment/GetSegmentDistributionByFilter`;
const GET_SEGMENT_DISTRIBUTION_BY_FILTER: string = `${API_CALLBACK_URL}segment/GetSegmentDistributionByFilter`;

export async function SendGetSegmentDistributionByFilter(request: SegmentDistributionByFilterRequestModel) {
	return axios.post(REQUEST_GET_SEGMENT_DISTRIBUTION_BY_FILTER, request);
}
export async function GetSegmentDistributionByFilter(request: string) {
	return axios.get<SegmentDistributionByFilterResponseModel>(GET_SEGMENT_DISTRIBUTION_BY_FILTER, {
		params: {
			cachedId: request,
		},
	});
}

export async function exportDistributionToCsv(request: SegmentDistributionByFilterRequestModel) {
	return axios.post(EXPORT_DISTRIBUTION_TO_CSV, request, {
		responseType: 'blob',
	});
}

export async function getSegmentConditionsBySegmentId(segmentId: number) {
	return axios.get<Array<SegmentConditionSaveRequestModel>>(GET_SEGMENT_CONDITIONS_BY_SEGMENTID, {
		params: {
			segmentId: segmentId,
		},
	});
}

export async function validateInFilePlayers(request: ValidateInFileRequestModels) {
	return axios.post<InFilePlayersResponseModel>(VALIDATE_IN_FILE_PLAYER_IDS, request);
}

export async function cleanUpStgInFileTable(userId: number) {
	return axios.post(CLEANUP_IN_FILE_PLAYER_STG_TABLE, {
		params: {
			userId: userId,
		},
	});
}

export async function getMessageStatusByCaseTypeId(caseTypeId: any) {
	return axios.get(GET_MESSAGESTATUS_BY_CASETYPEID, {
		params: {
			caseTypeId: caseTypeId,
		},
	});
}

export async function getMessageResponseByMultipleId(messageStatusIds: any) {
	return axios.get(GET_MESSAGERESPONSE_BY_MULTIPLE_STATUSID, {
		params: {
			messageStatusId: messageStatusIds,
		},
	});
}

export async function validateSegmentCustomQuery(customQuery: string) {
	return axios.get(VALIDATE_CUSTOM_QUERY, {
		params: {
			customQuery: customQuery
		},
	});
}