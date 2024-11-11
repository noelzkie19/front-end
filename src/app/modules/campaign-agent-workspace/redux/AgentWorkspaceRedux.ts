import {Action} from '@reduxjs/toolkit'
import {persistReducer} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import {CampaignPlayerFilterResponseModel} from '../models'

export interface IAgentWorkspaceState {
  filterResponse?: CampaignPlayerFilterResponseModel
  pageSize?: number
  currentPage?: number
  sortColumn?: string
  sortOrder?: string
  loadList?: string
  loading?: boolean
  currentUser?: string
}

const initialAgentWorkspaceState: IAgentWorkspaceState = {
  filterResponse: {
    campaignPlayers: [],
    recordCount: 0,
  },
  pageSize: 20,
  currentPage: 1,
  sortColumn: 'registeredDate',
  sortOrder: 'DESC',
  loadList: '',
  loading: false,
  currentUser: '',
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
}

export const actions = {
  setFilterResponse: (filterResponse: CampaignPlayerFilterResponseModel) => ({
    type: actionTypes.setFilterResponse,
    payload: {filterResponse},
  }), 
  setCurrentPage: (currentPage: number) => ({
    type: actionTypes.setCurrentPage,
    payload: {currentPage},
  }),
  setPageSize: (pageSize: number) => ({type: actionTypes.setPageSize, payload: {pageSize}}),
  setSortOrder: (sortOrder: string) => ({type: actionTypes.setSortOrder, payload: {sortOrder}}),
  setSortColumn: (sortColumn: string) => ({
    type: actionTypes.setSortColumn,
    payload: {sortColumn},
  }),
  loadList: (loadList: string) => ({type: actionTypes.loadList, payload: {loadList}}),
  setLoading: (loading: boolean) => ({type: actionTypes.setLoading, payload: {loading}}),
  setCurrentUser: (currentUser: string) => ({
    type: actionTypes.setCurrentUser,
    payload: {currentUser},
  }),
  clear: () => ({type: actionTypes.clear}),
}

export const reducer = persistReducer(
  {
    storage,
    key: 'mlab-persist-agent-workspace',
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
    state: IAgentWorkspaceState = initialAgentWorkspaceState,
    action: ActionWithPayload<IAgentWorkspaceState>
  ) => {
    switch (action.type) {
      case actionTypes.setFilterResponse: {
        const getData = action.payload?.filterResponse
        return {...state, filterResponse: getData}
      }
      case actionTypes.setCurrentPage: {
        const getData = action.payload?.currentPage
        return {...state, currentPage: getData}
      }
      case actionTypes.setPageSize: {
        const getData = action.payload?.pageSize
        return {...state, pageSize: getData}
      }
      case actionTypes.setSortOrder: {
        const getData = action.payload?.sortOrder
        return {...state, sortOrder: getData}
      }
      case actionTypes.setSortColumn: {
        const getData = action.payload?.sortColumn
        return {...state, sortColumn: getData}
      }
      case actionTypes.loadList: {
        const getData = action.payload?.loadList
        return {...state, loadList: getData}
      }
      case actionTypes.setLoading: {
        const getData = action.payload?.loading
        return {...state, loading: getData}
      }
      case actionTypes.setCurrentUser: {
        const getData = action.payload?.currentUser
        return {...state, currentUser: getData}
      }
      case actionTypes.clear: {
        return initialAgentWorkspaceState
      }
      
      default:
        return state
    }
  }
)
