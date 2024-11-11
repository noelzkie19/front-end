import {Action} from '@reduxjs/toolkit';
import {persistReducer} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {put, takeLatest} from 'redux-saga/effects';
import {UserModel} from '../models/UserModel';

export interface ActionWithPayload<T> extends Action {
	payload?: T;
}

export const actionTypes = {
	Login: '[Login] Action',
	Logout: '[Logout] Action',
	Register: '[Register] Action',
	UserRequested: '[Request User] Action',
	UserLoaded: '[Load User] Auth API',
	SetUser: '[Set User] Action',
	SetFullName: '[Set FullName] Action',
	AccessRestriction: '[Set Access Restriction Type] Action',
};

const initialAuthState: IAuthState = {
	user: undefined,
	accessToken: undefined,
	userId: undefined,
	access: undefined,
	expiresIn: undefined,
	fullName: undefined,
	accessDataRestrictionList: [{}],
	mcoreUserId: undefined
};

export interface IAuthState {
	user?: UserModel;
	accessToken?: string;
	userId?: string;
	access?: string;
	expiresIn?: string;
	fullName?: string;
	accessDataRestrictionList?: any;
	mcoreUserId?: string;
}

export const reducer = persistReducer(
	{
		storage,
		key: 'mlab-persist-auth',
		whitelist: ['user', 'accessToken', 'userId', 'access', 'expiresIn', 'fullName', 'accessDataRestrictionList', 'mcoreUserId'],
	},
	(state: IAuthState = initialAuthState, action: ActionWithPayload<IAuthState>) => {
		switch (action.type) {
			case actionTypes.Login: {
				const accessToken = action.payload?.accessToken;
				const userId = action.payload?.userId;
				const access = action.payload?.access;
				const expiresIn = action.payload?.expiresIn;
				const fullName = userId !== '0' ? action.payload?.fullName ?? '' : 'System Administrator';
				const mcoreUserId = action.payload?.mcoreUserId;
				return {accessToken, user: undefined, userId, access, expiresIn, fullName: fullName, mcoreUserId};
			}

			case actionTypes.Register: {
				const accessToken = action.payload?.accessToken;
				return {accessToken, user: undefined};
			}

			case actionTypes.Logout: {
				localStorage.setItem('isLoggedIn', 'false');
				return initialAuthState;
			}

			case actionTypes.UserRequested: {
				return {...state, user: undefined};
			}

			case actionTypes.UserLoaded: {
				const user = action.payload?.user;
				return {...state, user};
			}

			case actionTypes.SetUser: {
				const user = action.payload?.user;
				return {...state, user};
			}

			case actionTypes.AccessRestriction: {
				const accessDataRestrictionList = action.payload?.accessDataRestrictionList;
				return {...state, accessDataRestrictionList};
			}

			default:
				return state;
		}
	}
);

export const actions = {
	login: (accessToken: string, userId: string, access: string, expiresIn: string, fullName: string, mcoreUserId: string) => ({
		type: actionTypes.Login,
		payload: {accessToken, userId, access, expiresIn, fullName, mcoreUserId},
	}),
	register: (accessToken: string) => ({
		type: actionTypes.Register,
		payload: {accessToken},
	}),
	logout: () => ({type: actionTypes.Logout}),
	requestUser: () => ({
		type: actionTypes.UserRequested,
	}),
	fulfillUser: (user: UserModel[]) => ({type: actionTypes.UserLoaded, payload: {user}}),
	setUser: (user: UserModel) => ({type: actionTypes.SetUser, payload: {user}}),
	accessRestriction: (accessDataRestrictionList: any) => ({
		type: actionTypes.AccessRestriction,
		payload: {accessDataRestrictionList},
	}),
};

export function* saga() {
	yield takeLatest(actionTypes.Login, function* loginSaga() {
		yield put(actions.requestUser());
	});

	yield takeLatest(actionTypes.Register, function* registerSaga() {
		yield put(actions.requestUser());
	});

	yield takeLatest(actionTypes.UserRequested, function* userRequested() {
		yield put(actions.fulfillUser([]));
	});
}
