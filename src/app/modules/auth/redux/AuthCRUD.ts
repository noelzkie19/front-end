import axios from 'axios';
import {AuthModel} from '../models/AuthModel';
import {UserModel} from '../models/UserModel';
import {ResponseModel} from '../models/ResponseModel';
import {AppConfiguration} from 'read-appsettings-json';

const API_URL = AppConfiguration.Setting().REACT_APP_API_URL || 'api';

const API_GATEWAY_URL = AppConfiguration.Setting().REACT_APP_MLAB_GATEWAY_URL;

export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/authentication/get-user`;
export const LOGIN_URL = `${API_GATEWAY_URL}authentication/login`;
export const REGISTER_URL = `${API_URL}/authentication/register`;
export const REQUEST_PASSWORD_URL = `${API_GATEWAY_URL}authentication/ResetPassword`;
export const CREATE_NEW_PASSWORD_URL = `${API_GATEWAY_URL}authentication/CreateNewPassword`;

// Server should return AuthModel
export function login(email: string, password: string) {
	return axios.post(LOGIN_URL, {email, password});
}

// Server should return AuthModel
export function register(email: string, firstname: string, lastname: string, password: string) {
	return axios.post<AuthModel>(REGISTER_URL, {
		email,
		firstname,
		lastname,
		password,
	});
}

// Server should return object => { result: boolean } (Is Email in DB)
export function requestPassword(email: string, queueId: string, userId: string) {
	return axios.post<ResponseModel>(REQUEST_PASSWORD_URL, {email, queueId, userId});
}

export function getUserByToken() {
	// Authorization head should be fulfilled in interceptor.
	// Check common redux folder => setupAxios
	return axios.get<UserModel>(GET_USER_BY_ACCESSTOKEN_URL);
}

export function createNewPassword(
	passwordId: string | null,
	newPassword: string,
	confirmPassword: string,
	queueId: string,
	userId: string,
	actionid: string | null
) {
	return axios.post<ResponseModel>(CREATE_NEW_PASSWORD_URL, {passwordId, newPassword, confirmPassword, queueId, userId, actionid});
}

