import axios from 'axios';
import {AppConfiguration} from 'read-appsettings-json';
import {CommReviewReportFilterRequestModel} from '../components/models/requests/CommReviewReportFilterRequestModel';

// Global Configuration for axios
const API_GATEWAY_URL: string = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL!;

const GET_COMMUNICATION_REVIEW_LOOKUPS: string = `${API_GATEWAY_URL}casemanagement/GetCommunicationReviewLookups`;
export function getCommunicationReviewLookups() {
	return axios.get(GET_COMMUNICATION_REVIEW_LOOKUPS);
}

const GENERATE_COMM_REVIEW_REPORT: string = `${API_GATEWAY_URL}Reports/ExportCommunicationReviewReport`;
export async function GenerateCommunicationReviewReport(request: CommReviewReportFilterRequestModel) {
	return axios.post(GENERATE_COMM_REVIEW_REPORT, request);
}

const GENERATE_COMM_REVIEW_LIST: string = `${API_GATEWAY_URL}Reports/CommunicationReviewReportListing`;
export async function GenerateCommunicationReviewList(request: CommReviewReportFilterRequestModel) {
	return axios.post(GENERATE_COMM_REVIEW_LIST, request);
}

const GENERATE_COMM_REVIEW_GRID: string = `${API_GATEWAY_URL}Reports/CommunicationReviewReportGrid`;
export async function GenerateCommunicationReviewGrid(request: CommReviewReportFilterRequestModel) {
	return axios.post(GENERATE_COMM_REVIEW_GRID, request);
}
