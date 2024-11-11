import storage from 'redux-persist/lib/storage'
import {persistReducer} from 'redux-persist'
import {Action} from '@reduxjs/toolkit'
import { CallValidationListResponseModel } from '../models/response/CallValidationListResponseModel'
import { LookupModel } from '../../../common/model'

export interface ICallListValidationState {
  filterResponse?: CallValidationListResponseModel
  pageSize?: number
  currentPage?: number
  sortColumn?: string
  sortOrder?: string
  loadList?: string,
  loading?: boolean,
  currentUser?: string,
  leaderJustificationSettings?:Array<LookupModel>
}

const initialAgentWorkspaceState: ICallListValidationState = {
  filterResponse: {
    callValidations: [],
    agentValidations: [],
    leaderValidations: [],
    callEvaluations: [],
    recordCount: 0,
  },
  pageSize: 20,
  currentPage: 1,
  sortColumn: undefined,
  sortOrder: undefined,
  loadList: '',
  loading: false,
  currentUser: '',
  leaderJustificationSettings: []
}

export interface ActionWithPayload<T> extends Action {
  payload?: T
}

export const actionTypes = {
  setFilterResponse: 'setFilterResponse',
  setPageSize: 'setPageSize',
  setCurrentPage: 'setCurrentPage',
  setSortColumn: 'setSortColumn',
  setSortOrder: 'setSortOrder',
  loadList: 'loadList',
  setLoading: 'setLoading',
  clear: 'clear',
  setCurrentUser: 'setCurrentUser',
  setLeaderJustificationSettings: 'leaderJustificationSettings'
}

export const actions = {
  setFilterResponse: (filterResponse: CallValidationListResponseModel) => ({
    type: actionTypes.setFilterResponse,
    payload: {filterResponse},
  }),
  setPageSize: (pageSize: number) => ({type: actionTypes.setPageSize, payload: {pageSize}}),
  setCurrentPage: (currentPage: number) => ({
    type: actionTypes.setCurrentPage,
    payload: {currentPage},
  }),
  setSortColumn: (sortColumn: string) => ({
    type: actionTypes.setSortColumn,
    payload: {sortColumn},
  }),
  setSortOrder: (sortOrder: string) => ({type: actionTypes.setSortOrder, payload: {sortOrder}}),
  loadList: (loadList: string) => ({ type: actionTypes.loadList, payload: {loadList}}),
  setLoading: (loading: boolean) => ({ type: actionTypes.setLoading, payload: { loading }}),
  clear: () => ({ type: actionTypes.clear }),
  setCurrentUser: (currentUser: string) => ({type: actionTypes.setCurrentUser, payload: {currentUser}}),
  setLeaderJustificationSettings: (leaderJustificationSettings: Array<LookupModel>) => ({
    type: actionTypes.setLeaderJustificationSettings,
    payload: {leaderJustificationSettings},
  }),
}

export const reducer = persistReducer(
  {
    storage,
    key: 'mlab-persist-call-list-validation',
    whitelist: [
      'filterResponse',
      'pageSize',
      'currentPage',
      'sortColumn',
      'sortOrder',
      'loadList',
      'loading',
      'clear',
      'currentUser',
    ],
  },
  (
    state: ICallListValidationState = initialAgentWorkspaceState,
    action: ActionWithPayload<ICallListValidationState>
  ) => {
    switch (action.type) {
      case actionTypes.setFilterResponse: {
        const getData = action.payload?.filterResponse
        return {...state, filterResponse: getData}
      }
      case actionTypes.setPageSize: {
        const getData = action.payload?.pageSize
        return {...state, pageSize: getData}
      }
      case actionTypes.setCurrentPage: {
        const getData = action.payload?.currentPage
        return {...state, currentPage: getData}
      }
      case actionTypes.setSortColumn: {
        const getData = action.payload?.sortColumn
        return {...state, sortColumn: getData}
      }
      case actionTypes.setSortOrder: {
        const getData = action.payload?.sortOrder
        return {...state, sortOrder: getData}
      }
      case actionTypes.loadList: {
        const getData = action.payload?.loadList
        return {...state, loadList: getData}
      }
      case actionTypes.setLoading: {
        const getData = action.payload?.loading
        return {...state, loading: getData}
      }
      case actionTypes.clear: {
        return initialAgentWorkspaceState
      }
      case actionTypes.setCurrentUser: {
        const getData = action.payload?.currentUser
        return {...state, currentUser: getData}
      }
      case actionTypes.setLeaderJustificationSettings: {
        const getData = action.payload?.leaderJustificationSettings
        return {...state, leaderJustificationSettings: getData}
      }
      default:
        return state
    }
  }
)
