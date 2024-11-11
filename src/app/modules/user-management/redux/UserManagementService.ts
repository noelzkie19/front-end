import axios from 'axios';
import {AppConfiguration} from 'read-appsettings-json';
import {LookupModel} from '../../../shared-models/LookupModel';
import {CommunicationProviderAccountListbyIdResponseModel, CommunicationProviderAccountUdt, UserOptionModel} from '../models';
import {BaseModel} from '../models/BaseModel';
import {CommunicationProviderRequestModel} from '../models/CommunicationProviderRequestModel';
import {LockUserRequestModel} from '../models/LockUserRequestModel';
import {RoleFilterModel} from '../models/RoleFilterModel';
import {RoleIdRequestModel} from '../models/RoleIdRequestModel';
import {RoleModel} from '../models/RoleModel';
import {RoleRequestModel} from '../models/RoleRequestModel';
import {RolesFilterModel} from '../models/RolesFilterModel';
import {TeamFilterModel} from '../models/TeamFilerModel';
import {TeamIdRequestModel} from '../models/TeamIdRequestModel';
import {TeamModel} from '../models/TeamModel';
import {TeamRequestModel} from '../models/TeamRequestModel';
import {TeamsFilterModel} from '../models/TeamsFilterModel';
import {UserFilterModel} from '../models/UserFilterModel';
import {UserIdRequestModel} from '../models/UserIdRequestModel';
import {UserInfoListModel} from '../models/UserInfoListModel';
import {UserModel} from '../models/UserModel';
import {UserRequestModel} from '../models/UserRequestModel';

const API_GATEWAY_URL = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL;
const API_CALLBACK_URL = AppConfiguration.Setting().REACT_APP_MLAB_CALLBACK_URL;

const GET_ROLE_LIST: string = `${API_GATEWAY_URL}usermanagement/GetRoleList`;
const GET_ROLE_LIST_RESULT: string = `${API_CALLBACK_URL}usermanagement/GetRoleList`;

const ADD_ROLE: string = `${API_GATEWAY_URL}usermanagement/AddRole`;
const UPDATE_ROLE: string = `${API_GATEWAY_URL}usermanagement/UpdateRole`;

const GET_ROLE_BY_ID: string = `${API_GATEWAY_URL}usermanagement/GetRoleById`;
const GET_ROLE_BY_ID_INFO: string = `${API_CALLBACK_URL}usermanagement/GetRoleById`;

const GET_ALL_ROLE: string = `${API_GATEWAY_URL}usermanagement/GetAllRole`;
const GET_ALL_ROLE_RESULT: string = `${API_CALLBACK_URL}usermanagement/GetAllRole`;
const GET_TEAM_LIST: string = `${API_GATEWAY_URL}usermanagement/GetTeamList`;
const GET_TEAM_LIST_RESULT: string = `${API_CALLBACK_URL}usermanagement/GetTeamList`;
const GET_TEAM_BY_ID: string = `${API_GATEWAY_URL}usermanagement/GetTeamById`;
const GET_TEAM_BY_ID_INFO: string = `${API_CALLBACK_URL}usermanagement/GetTeamById`;

const ADD_TEAM: string = `${API_GATEWAY_URL}usermanagement/AddTeam`;
const UPDATE_TEAM: string = `${API_GATEWAY_URL}usermanagement/UpdateTeam`;

const GET_USER_LIST: string = `${API_GATEWAY_URL}usermanagement/GetUserList`;
const GET_USER_LIST_RESULT: string = `${API_CALLBACK_URL}usermanagement/GetUserList`;
const GET_USER_BY_ID: string = `${API_GATEWAY_URL}usermanagement/GetUserById`;
const GET_USER_BY_ID_INFO: string = `${API_CALLBACK_URL}usermanagement/GetUserById`;

const ADD_USER: string = `${API_GATEWAY_URL}usermanagement/AddUser`;
const UPDATE_USER: string = `${API_GATEWAY_URL}usermanagement/UpdateUser`;
const LOCK_USER: string = `${API_GATEWAY_URL}usermanagement/LockUser`;

const GET_ROLES_FILTER: string = `${API_GATEWAY_URL}usermanagement/GetRolesFilter`;
const GET_TEAMS_FILTER: string = `${API_GATEWAY_URL}usermanagement/GetTeamsFilter`;
const GET_USER_LOOKUPS: string = `${API_GATEWAY_URL}usermanagement/GetUserLookups`;
const GET_TEAMS_LIST_OPTION: string = `${API_GATEWAY_URL}usermanagement/GetUserListOption`;
const GET_LP_COMM_PROVIDER_USER_LIST: string = `${API_GATEWAY_URL}usermanagement/GetCommProviderUserListOption`;
const GET_LP_TEAM_LIST: string = `${API_GATEWAY_URL}usermanagement/GetTeamListByUserIdOption`;
const GET_USER_OPTIONS: string = `${API_GATEWAY_URL}usermanagement/GetUserOptions`;

const VALIDATE_USER_PROVIDER_NAME: string = `${API_GATEWAY_URL}usermanagement/ValidateUserProviderName`;
const VALIDATE_COMMUNICATION_PROVIDER: string = `${API_GATEWAY_URL}usermanagement/ValidateCommunicationProvider`;

const GET_DATA_RESTRICTION_DETAILS_BY_USERID = `${API_GATEWAY_URL}usermanagement/GetDataRestrictionDetailsByUserId`;

export async function sendGetRoleList(request: RoleFilterModel) {
	return axios.post(GET_ROLE_LIST, request);
}
export async function GetRoleList(request: string) {
	return axios.get<string>(GET_ROLE_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function addRole(createRole: RoleRequestModel) {
	return axios.post(ADD_ROLE, createRole);
}

export async function updateRole(updateRole: RoleRequestModel) {
	return axios.post(UPDATE_ROLE, updateRole);
}

export async function getRoleById(roleId: RoleIdRequestModel) {
	return axios.post(GET_ROLE_BY_ID, roleId);
}

export async function getRoleByIdInfo(roleCacheId: string) {
	return axios.get<RoleModel>(GET_ROLE_BY_ID_INFO, {
		params: {
			cachedId: roleCacheId,
		},
	});
}

export async function getAllRole(baseRequest: BaseModel) {
	return axios.post(GET_ALL_ROLE, baseRequest);
}
export function getAllRoleResult(request: string) {
	return axios.get<Array<RoleModel>>(GET_ALL_ROLE_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function getTeamList(teamFilter: TeamFilterModel) {
	return axios.post(GET_TEAM_LIST, teamFilter);
}
export async function getTeamListResult(request: string) {
	return axios.get<Array<TeamModel>>(GET_TEAM_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export async function getTeamById(teamIdRequest: TeamIdRequestModel) {
	return axios.post(GET_TEAM_BY_ID, teamIdRequest);
}
export async function getTeamByIdInfo(request: string) {
	return axios.get<TeamModel>(GET_TEAM_BY_ID_INFO, {
		params: {
			cachedId: request,
		},
	});
}

export function addTeam(createTeam: TeamRequestModel) {
	return axios.post(ADD_TEAM, createTeam);
}

export function updateTeam(updateTeam: TeamRequestModel) {
	return axios.post(UPDATE_TEAM, updateTeam);
}

export function getUserList(userFilter: UserFilterModel) {
	return axios.post(GET_USER_LIST, userFilter);
}
export function getUserListResult(request: string) {
	return axios.get<Array<UserInfoListModel>>(GET_USER_LIST_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

export function getUserById(userIdRequest: UserIdRequestModel) {
	return axios.post(GET_USER_BY_ID, userIdRequest);
}

export function getUserByIdInfo(request: string) {
	return axios.get<UserModel>(GET_USER_BY_ID_INFO, {
		params: {
			cachedId: request,
		},
	});
}

export function addUser(createUser: UserRequestModel) {
	return axios.post(ADD_USER, createUser);
}

export function updateUser(updateUser: UserRequestModel) {
	return axios.post(UPDATE_USER, updateUser);
}

export function lockUser(lockUser: LockUserRequestModel) {
	return axios.post(LOCK_USER, lockUser);
}

export function getRolesFilter() {
	return axios.get<Array<RolesFilterModel>>(GET_ROLES_FILTER);
}

export function getTeamsFilter() {
	return axios.get<Array<TeamsFilterModel>>(GET_TEAMS_FILTER);
}
export function getUserListOption() {
	return axios.get<Array<UserInfoListModel>>(GET_TEAMS_LIST_OPTION);
}
export function getCommProviderUserListOption() {
	return axios.get<Array<LookupModel>>(GET_LP_COMM_PROVIDER_USER_LIST);
}
export function getTeamListbyUserIdOption(_userId: number) {
	return axios.get<Array<LookupModel>>(GET_LP_TEAM_LIST, {
		params: {
			userId: _userId,
		},
	});
}

export function getUserLookups(filter: string | null) {
	return axios.get<Array<LookupModel>>(GET_USER_LOOKUPS, {
		params: {
			filter: filter,
		},
	});
}
export function GetUserOptions() {
	return axios.get<Array<UserOptionModel>>(GET_USER_OPTIONS);
}

export async function ValidateUserProviderName(userId: any, providerId: any, providerAccount: any) {
	return await axios.post(VALIDATE_USER_PROVIDER_NAME, {userId, providerId, providerAccount});
}

export async function ValidateCommunicationProvider(request: CommunicationProviderRequestModel) {
	return await axios.post(VALIDATE_COMMUNICATION_PROVIDER, request);
}

const GET_COMMUNICATION_PROVIDER_ACCOUNT_LIST_BY_ID: string = `${API_GATEWAY_URL}usermanagement/GetCommunicationProviderAccountListbyId`;
const GET_COMMUNICATION_PROVIDER_ACCOUNT_LIST_BY_ID_RESULT: string = `${API_CALLBACK_URL}usermanagement/GetCommunicationProviderAccountListbyId`;
export function getCommunicationProviderAccountListbyId(userIdRequest: UserIdRequestModel) {
	return axios.post(GET_COMMUNICATION_PROVIDER_ACCOUNT_LIST_BY_ID, userIdRequest);
}

export function getCommunicationProviderAccountListbyIdResult(request: string) {
	return axios.get<Array<CommunicationProviderAccountListbyIdResponseModel>>(GET_COMMUNICATION_PROVIDER_ACCOUNT_LIST_BY_ID_RESULT, {
		params: {
			cachedId: request,
		},
	});
}

const GET_COMMUNICATION_PROVIDER_ACCOUNT_LIST_BY_USERID: string = `${API_GATEWAY_URL}usermanagement/GetCommunicationProviderAccountListByUserId`;
export function getCommunicationProviderAccountListByUserId(userId: number) {
	return axios.get<Array<CommunicationProviderAccountUdt>>(GET_COMMUNICATION_PROVIDER_ACCOUNT_LIST_BY_USERID, {
		params: {
			userId: userId,
		},
	});
}

export function getDataRestrictionAccessByUserId(userId: number) {
	return axios.get(GET_DATA_RESTRICTION_DETAILS_BY_USERID, {
		params: {
			userId: userId,
		},
	});
}
