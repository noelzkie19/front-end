import { Action } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { RoleFilterModel } from '../models/RoleFilterModel'
import { RoleRequestModel } from '../models/RoleRequestModel'
import { RoleIdRequestModel } from '../models/RoleIdRequestModel'
import { TeamFilterModel } from '../models/TeamFilerModel'
import { TeamIdRequestModel } from '../models/TeamIdRequestModel'
import { TeamRequestModel } from '../models/TeamRequestModel'
import { BaseModel } from '../models/BaseModel'
import { UserFilterModel } from '../models/UserFilterModel'
import { UserIdRequestModel } from '../models/UserIdRequestModel'
import { UserRequestModel } from '../models/UserRequestModel'
import { LockUserRequestModel } from '../models/LockUserRequestModel'

export interface ActionWithPayload<T> extends Action {
    payload?: T
}

export const actionTypes = {
    sendGetRoleList: 'sendGetRoleList',
    GetRoleList: 'GetRoleList',
    addRole: 'addRole',
    updateRole: 'updateRole',
    getRoleById: 'getRoleById',
    getRoleByIdInfo: 'getRoleByIdInfo',
    getAllRole: 'getAllRole',
    getAllRoleResult: 'getAllRoleResult',
    getTeamList: 'getTeamList',
    getTeamListResult: 'getTeamListResult',
    getTeamById: 'GetTeamById',
    getTeamByIdInfo: 'GetTeamByIdInfo',
    addTeam: 'addTeam',
    updateTeam: 'updateTeam',
    getUserList: 'getUserList',
    getUserListResult: 'getUserListResult',
    getUserById: 'getUserById',
    getUserByIdInfo: 'getUserByIdInfo',
    addUser: 'addUser',
    updateUser: 'updateUser',
    lockUser: 'lockUser'
}



const initialUserManagementState: IUserManagementState = {
    request: undefined,
    cachedId: undefined,
    createRole: undefined,
    updateRole: undefined,
    roleId: undefined,
    roleCacheId: undefined,
    teamFilter: undefined,
    teamIdRequest: undefined,
    createTeam: undefined,
    updateTeam: undefined,
    baseRequest: undefined,
    userFilter : undefined,
    userIdRequest : undefined,
    createUser : undefined,
    updateUser : undefined,
    lockUser : undefined
}

export interface IUserManagementState {
    request?: RoleFilterModel,
    cachedId?: string,
    createRole?: RoleRequestModel
    updateRole?: RoleRequestModel,
    roleId?: RoleIdRequestModel,
    roleCacheId?: string,
    teamFilter?: TeamFilterModel,
    teamIdRequest?: TeamIdRequestModel,
    createTeam?: TeamRequestModel,
    updateTeam?: TeamRequestModel,
    baseRequest?: BaseModel,
    userFilter? : UserFilterModel,
    userIdRequest? : UserIdRequestModel,
    createUser? : UserRequestModel,
    updateUser? : UserRequestModel,
    lockUser? : LockUserRequestModel
}

export const reducer = persistReducer(
    { storage, key: 'v100-demo1-auth', whitelist: ['result'] },
    (state: IUserManagementState = initialUserManagementState, action: ActionWithPayload<IUserManagementState>) => {
        switch (action.type) {
            case actionTypes.sendGetRoleList: {
                return { request: undefined }
            }
            case actionTypes.GetRoleList: {
                return { cachedId: undefined }
            }
            case actionTypes.addRole: {
                return { createRole: undefined }
            }
            case actionTypes.updateRole: {
                return { updateRole: undefined }
            }
            case actionTypes.getRoleById: {
                return { roleId: undefined }
            }
            case actionTypes.getRoleByIdInfo: {
                return { roleCacheId: undefined }
            }
            case actionTypes.getAllRole: {
                return { baseRequest: undefined }
            }
            case actionTypes.getAllRoleResult: {
                return { request: undefined }
            }
            case actionTypes.getTeamList: {
                return { teamFilter: undefined }
            }
            case actionTypes.getTeamListResult: {
                return { request: undefined }
            }
            case actionTypes.getTeamById: {
                return { teamIdRequest: undefined }
            }
            case actionTypes.getTeamByIdInfo: {
                return { request: undefined }
            }
            case actionTypes.addTeam: {
                return { createTeam: undefined }
            }
            case actionTypes.updateTeam: {
                return { updateTeam: undefined }
            }
            case actionTypes.getUserList: {
                return { userFilter: undefined }
            }
            case actionTypes.getUserListResult: {
                return { request: undefined }
            }
            case actionTypes.getUserById: {
                return { userIdRequest: undefined }
            }
            case actionTypes.getUserByIdInfo: {
                return { request: undefined }
            }
            case actionTypes.addUser: {
                return { createUser: undefined }
            }
            case actionTypes.updateUser: {
                return { updateUser: undefined }
            }
            case actionTypes.lockUser: {
                return { lockUser: undefined }
            }
            default:
                return state
        }
    },

)

export const actions = {
    sendGetRoleList: (request: RoleFilterModel) => ({ type: actionTypes.sendGetRoleList, payload: { request } }),
    GetRoleList: (cachedId: string) => ({ type: actionTypes.GetRoleList, payload: { cachedId } }),
    addRole: (createRole: RoleRequestModel) => ({ type: actionTypes.addRole, payload: { createRole } }),
    updateRole: (updatedRole: RoleRequestModel) => ({ type: actionTypes.updateRole, payload: { updatedRole } }),
    getRoleById: (roleId: RoleIdRequestModel) => ({ type: actionTypes.getRoleById, payload: { roleId } }),
    getRoleByIdInfo: (roleCacheId: string) => ({ type: actionTypes.getRoleByIdInfo, payload: { roleCacheId } }),
    getAllRole: (baseRequest: BaseModel) => ({ type: actionTypes.getAllRole, payload: { baseRequest } }),
    getAllRoleResult: (request: string) => ({ type: actionTypes.getAllRoleResult, payload: { request } }),
    getTeamList: (teamFilter: TeamFilterModel) => ({ type: actionTypes.getTeamList, payload: { teamFilter } }),
    getTeamListResult: (request: string) => ({ type: actionTypes.getTeamListResult, payload: { request } }),
    getTeamById: (teamIdRequest: TeamIdRequestModel) => ({ type: actionTypes.getTeamById, payload: { teamIdRequest } }),
    getTeamByIdInfo: (request: string) => ({ type: actionTypes.getTeamByIdInfo, payload: { request } }),
    addTeam: (createTeam: TeamRequestModel) => ({ type: actionTypes.addTeam, payload: { createTeam } }),
    updateTeam: (updateTeam: TeamRequestModel) => ({ type: actionTypes.updateTeam, payload: { updateTeam } }),
    getUserList: (userFilter: UserFilterModel) => ({ type: actionTypes.getUserList, payload: { userFilter } }),
    getUserListResult: (request: string) => ({ type: actionTypes.getUserListResult, payload: { request } }),
    getUserById: (userIdRequest: UserIdRequestModel) => ({ type: actionTypes.getUserById, payload: { userIdRequest } }),
    getUserByIdInfo: (request: string) => ({ type: actionTypes.getUserByIdInfo, payload: { request } }),
    addUser: (createUser: UserRequestModel) => ({ type: actionTypes.addUser, payload: { createUser } }),
    updateUser: (updateUser: UserRequestModel) => ({ type: actionTypes.updateUser, payload: { updateUser } }),
    lockUser: (lockUser: LockUserRequestModel) => ({ type: actionTypes.lockUser, payload: { lockUser } }),
}
