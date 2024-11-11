import React, { useMemo, useState } from "react";
import { MLAB_DEFAULT, PLAYER_INFO_DEFAULT, TICKET_DEFAULT, TRANSACTION_DEFAULT } from "../constants/TicketDefault";
import { TicketPlayerResponseModel } from "../models/response/TicketPlayerResponseModel";
import { TransactionDataModel } from "../models/TransactionDataModel";
import { getFmboTransactionData, getIcoreTransactionData, getPlayerInfo, getTicketThreshold, getTransactionStatusReference, getAssigneeListById, getAutoAssigned, getTicketInfoById, RequestTicketHistory, GetTicketHistory, RequestTicketCollaborator, GetTicketCollaborator, ValidateUserTier, GetAllPaymentProcessor } from "../services/TicketManagementApi";
import { useAsyncFn } from 'react-use'
import swal from 'sweetalert';
import useConstant from "../../../constants/useConstant";
import { FmboTransactionDataRequestModel } from "../models/request/FmboTransactionDataRequestModel";
import useTicketConstant from "../constants/TicketConstant";
import { TicketThresholdResponseModel } from "../models/response/TicketThresholdResponseModel";
import { TransactionStatusReferenceResponseModel } from "../models/response/TransactionStatusReferenceResponseModel";
import { TicketInfoModel } from "../models/TicketInfoModel";
import { LookupModel } from "../../../shared-models/LookupModel";
import { TicketTypeResponseModel } from "../models/ticket-config/TicketTypeResponseModel";
import { getTicketFieldMapping, getTicketTypes } from "../services/TicketConfigurationApi";
import { disableSplashScreen } from "../../../utils/helper";
import { GroupingConfigurationModel } from "../models/ticket-config/GroupingConfigurationModel";
import { GetTicketHistoryCollaboratorRequestModel } from "../models/request/GetTicketHistoryCollaboratorRequestModel";
import { AllLookUpOptionsModel } from "../models/ticket-config/AllLookUpOptionsModel";
import { TicketDetailModel } from "../models/TicketDetailModel";
import { useTicketManagementHooks } from "../shared/hooks/useTicketManagementHooks";
import { GetAutoAssignedIdRequestModel } from "../models/request/GetAutoAssignedIdRequestModel";
import * as hubConnection from '../../../../setup/hub/MessagingHub';
import { HttpStatusCodeEnum } from "../../../constants/Constants";
import { ValidateUserTierRequestModel } from "../models/request/ValidateUserTierRequestModel";
import { GetAllProcessorResponseModel } from "../models/response/GetAllProcessorResponseModel";

interface IProps {
  selectedPlayer: TicketPlayerResponseModel
  selectedLatestTransactionData: TransactionDataModel
  getPlayerInfoByFilterAsync: (...args: any) => Promise<void>
  fetchingPlayer: boolean
  getLatestTransactionDataAsync: (...args: any) => Promise<void>
  fetchingLatestTransaction: boolean
  selectedTicketThresholds: Array<TicketThresholdResponseModel>
  getTicketThresholdsAsync: (...args: any) => Promise<void>
  setForModal: (val: any) => void
  isForModal: boolean
  transactionStatusReference: Array<TransactionStatusReferenceResponseModel>
  getTransactionStatusReferenceAsync: () => Promise<void>
  currentPlatformStatusId: number
  currentPaymentSystemStatusId: number
  setCurrentPlatformStatus: (status: number) => void;
  setCurrentPaymentStatus: (status: number) => void;
  selectedTicketInformation: TicketInfoModel
  setCurrentTicketInfo: (ticketInfo: TicketInfoModel) => void
  isFetchedPlayer: boolean
  assigneeList: LookupModel[]
  fetchingAssigneeList: boolean
  getAssigneeListAsync: (...args: any) => Promise<void>
  autoAssignedId: number | null,
  getAutoAssignedId: (val: any) => void
  currentPaymentMethodId: number
  setCurrentPaymentMethod: (val: any) => void
  isFetchedAssigneeList: boolean
  ticketInformation: TicketInfoModel
  fetchingTicketInformation: boolean
  isFetchTicketInformation: boolean
  getTicketInformationByTicketCodeAsync: (...args: any) => Promise<void>
  ticketConfigTypes: Array<TicketTypeResponseModel>,
  fetchingTicketConfigTypes: boolean
  getTicketConfigTypesAsync: () => Promise<void>
  ticketFieldMapping: any
  fetchingTicketFieldMapping: boolean
  getFieldMappingAsync: (...args: any) => Promise<void>
  ticketGroupingConfig: any,
  ticketHistoryData: any,
  fetchingTicketHistoryData: boolean,
  ticketHistoryAsync: (...args: any) => Promise<void>,
  setHistoryFilters: (val: any) => void,
  historyFilter: any,
  allLookUpOptions: AllLookUpOptionsModel[],
  setAllTicketManagementOptions: (val: any) => void,
  allOldValue: TicketDetailModel[],
  setAllFieldsOldValue: (val: any) => void,
  currentDepartment: number,
  setCurrentDepartmentId: (val: any) => void
  setDefaultAutoAssignee: () => void,
  isLoading: boolean,
  ticketCollaboratorData: any
  fetchingTicketCollaboratorData: boolean,
  getTicketCollaboratorListAsync: (...args: any) => Promise<void>,
  isFetchingApi: boolean
  fetchingError: boolean
  isUserValidTier: boolean | null;
  validateUserTier: (...args: any) => Promise<void>,
  assigneePopupList: LookupModel[]
  fetchingAssigneePopupList: boolean
  getAssigneePopupListAsync: (...args: any) => Promise<void>,
  setDefaultAssigneeList: () => void
  processorData: Array<GetAllProcessorResponseModel>
  fetchingProcessorData: boolean,
  getAllProcessorListAsync: () => Promise<void>,
}

export const TicketContext = React.createContext<IProps>({
  selectedPlayer: PLAYER_INFO_DEFAULT,
  selectedLatestTransactionData: TRANSACTION_DEFAULT,
  getPlayerInfoByFilterAsync: async (...args: any) => { },
  fetchingPlayer: false,
  getLatestTransactionDataAsync: async (...args: any) => { },
  fetchingLatestTransaction: false,
  selectedTicketThresholds: [],
  getTicketThresholdsAsync: async (...args: any) => { },
  setForModal: () => { },
  isForModal: false,
  transactionStatusReference: [],
  getTransactionStatusReferenceAsync: async () => { },
  currentPlatformStatusId: 0,
  currentPaymentSystemStatusId: 0,
  setCurrentPlatformStatus: () => { },
  setCurrentPaymentStatus: () => { },
  selectedTicketInformation: TICKET_DEFAULT,
  setCurrentTicketInfo: (ticketInfo: TicketInfoModel) => { },
  isFetchedPlayer: false,
  assigneeList: [],
  fetchingAssigneeList: false,
  getAssigneeListAsync: async (...args: any) => { },
  autoAssignedId: 0,
  getAutoAssignedId: () => { },
  currentPaymentMethodId: 0,
  setCurrentPaymentMethod: () => { },
  isFetchedAssigneeList: false,
  ticketInformation: TICKET_DEFAULT,
  fetchingTicketInformation: false,
  isFetchTicketInformation: false,
  getTicketInformationByTicketCodeAsync: async (...args: any) => { },
  ticketConfigTypes: [],
  fetchingTicketConfigTypes: false,
  getTicketConfigTypesAsync: async () => { },
  ticketFieldMapping: [],
  fetchingTicketFieldMapping: false,
  getFieldMappingAsync: async (...args: any) => { },
  ticketGroupingConfig: [],
  ticketHistoryData: [],
  fetchingTicketHistoryData: false,
  ticketHistoryAsync: async (...args: any) => { },
  setHistoryFilters: () => { },
  historyFilter: {},
  allLookUpOptions: [],
  setAllTicketManagementOptions: () => { },
  allOldValue: [],
  setAllFieldsOldValue: () => { },
  currentDepartment: 0,
  setCurrentDepartmentId: () => { },
  setDefaultAutoAssignee: () => { },
  isLoading: false,
  ticketCollaboratorData: [],
  fetchingTicketCollaboratorData: false,
  getTicketCollaboratorListAsync: async (...args: any) => { },
  isFetchingApi: false,
  fetchingError: false,
  isUserValidTier: null,
  validateUserTier: async (...args: any) => { },
  assigneePopupList: [],
  fetchingAssigneePopupList: false,
  getAssigneePopupListAsync: async (...args: any) => { },
  setDefaultAssigneeList: () => { },
  processorData: [],
  fetchingProcessorData: false,
  getAllProcessorListAsync: async () => { },
})

export const TicketContextProvider: React.FC = ({ children }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<TicketPlayerResponseModel>(PLAYER_INFO_DEFAULT);
  const [selectedLatestTransactionData, setSelectedLatestTransactionData] = useState<TransactionDataModel>(TRANSACTION_DEFAULT);
  const [selectedTicketThresholds, setSelectedTicketThresholds] = useState<Array<TicketThresholdResponseModel>>([]);
  const [transactionStatusReference, setTransactionStatusReference] = useState<Array<TransactionStatusReferenceResponseModel>>([]);
  const { successResponse, SwalServerErrorMessage, TicketManagementConstants, SwalFailedMessage, HubConnected } = useConstant();
  const { TICKET_FIELD } = useTicketConstant()
  const [isForModal, setIsForModal] = useState<boolean>(false);
  const [currentPlatformStatusId, setCurrentPlatformStatusId] = useState<number>(0);
  const [currentPaymentSystemStatusId, setCurrentPaymentSystemStatusId] = useState<number>(0);
  const [selectedTicketInformation, setSelectedTicketInformation] = useState<TicketInfoModel>(TICKET_DEFAULT);
  const [isFetchedPlayer, setIsFetchedPlayer] = useState<boolean>(false);
  const [assigneeList, setAssigneeList] = useState<LookupModel[]>([]);
  const [autoAssignedId, setAutoAssignedId] = useState<number | null>(null);
  const [currentPaymentMethodId, setCurrentPaymentMethodId] = useState<number>(0);
  const [isFetchedAssigneeList, setIsFetchedAssigneeList] = useState<boolean>(false);
  const [ticketInformation, setTicketInformation] = useState<TicketInfoModel>(TICKET_DEFAULT)
  const [isFetchTicketInformation, setIsFetchTicketInformation] = useState<boolean>(false);
  const [ticketConfigTypes, setTicketConfigTypes] = useState<TicketTypeResponseModel[]>([])
  const [ticketFieldMapping, setTicketFieldMapping] = useState<any[]>([])
  const [ticketGroupingConfig, setTicketGroupingConfig] = useState<GroupingConfigurationModel[]>([])
  const [ticketHistoryData, setTicketHistoryData] = useState<any>();
  const [historyFilter, setHistoryFilter] = useState<any>();
  const [allLookUpOptions, setAllLookUpOptions] = useState<Array<AllLookUpOptionsModel>>([]);
  const [allOldValue, setAllOldValue] = useState<TicketDetailModel[]>([]);
  const [currentDepartment, setCurrentDepartment] = useState<number>(0);
  const {getSourceRequest } = useTicketManagementHooks()
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [ticketCollaboratorData, setTicketCollaboratorData] = useState<any>();
  const [isFetchingApi, setIsFetchingApi] = useState<boolean>(false);
  const [fetchingError, setFetchingError] = useState<boolean>(false);
  const [isUserValidTier, setIsUserValidTier] = useState<boolean | null>(null);

  const [assigneePopupList, setAssigneePopupList] = useState<LookupModel[]>([]);
  const [isFetchedAssigneePopupList, setIsFetchedAssigneePopupList] = useState<boolean>(false);
  const [processorData, setProcessorData] =useState<GetAllProcessorResponseModel[]>([]);

  const [{ loading: fetchingPlayer }, getPlayerInfoByFilterAsync] = useAsyncFn(async (...args) => {
    const [keyword] = args;
    setSelectedPlayer(PLAYER_INFO_DEFAULT);
    setIsFetchedPlayer(false)
    try {
      await getPlayerInfo(keyword).then((result: any) => {
        if (result.status === successResponse) {
          setSelectedPlayer(result.data);
          setIsFetchedPlayer(true)
        } else {
          swal(SwalServerErrorMessage.title, TicketManagementConstants.NoPlayer, SwalServerErrorMessage.icon);
          setIsFetchedPlayer(true);
        }
      });
    } catch {
      swal(SwalServerErrorMessage.title, TicketManagementConstants.NoPlayer, SwalServerErrorMessage.icon);
      setIsFetchedPlayer(true);
    }

  }, [setSelectedPlayer])

  const [{ loading: fetchingLatestTransaction }, getLatestTransactionDataAsync] = useAsyncFn(async (...args) => {
    setIsFetchingApi(true)
    const [keyword] = args;
    getIcoreTransactionData(keyword).then((icore: any) => {
      if(icore.status === successResponse){
          const sourceTypeId = getSourceRequest(keyword.ticketTypeId);
          const fmboRequest: FmboTransactionDataRequestModel = {
              source: sourceTypeId,
              transactionId: icore.data.providerTransactionId ,
              userId: keyword.userId
          }
          getFmboTransactionData(fmboRequest).then((fmboResult: any) => {
              if(fmboResult){
              const newTransactionData: TransactionDataModel = {
              userId: keyword.userId,
              mlabTransactionData: MLAB_DEFAULT
              };
                newTransactionData.iCoreTransactionData = icore.data
                newTransactionData.fmboTransactionData = fmboResult.data.responseData
                setSelectedLatestTransactionData(newTransactionData);
                setIsFetchingApi(false)
              }else{
                swal(SwalServerErrorMessage.title, TicketManagementConstants.UnableToUpdatePaymentSystemStatus, SwalServerErrorMessage.icon);
                setIsFetchingApi(false)
                setFetchingError(true)
              }
          })
      }else{
          swal(SwalServerErrorMessage.title, TicketManagementConstants.UnableToUpdatePlatformStatus, SwalServerErrorMessage.icon);
          setIsFetchingApi(false)
          setFetchingError(true)
      }
  })


  }, [setSelectedLatestTransactionData])

  const [{ loading: fetchingTicketThresholds }, getTicketThresholdsAsync] = useAsyncFn(async (...args) => {
    try {
      const [keyword] = args;
      const response = await getTicketThreshold(keyword);

      if (response.status === successResponse) {
        setSelectedTicketThresholds(response.data);
      } else {
        swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
        console.log('Fetching ticket threshold' , response)
      }
    } catch (ex) {
      swal(SwalFailedMessage.title, SwalFailedMessage.textNoTicketTresholdFound, SwalFailedMessage.icon);
    }

  }, [setSelectedTicketThresholds])


  const [{ loading: fetchingTransactionStatusReference }, getTransactionStatusReferenceAsync] = useAsyncFn(async () => {
    try {
      const response = await getTransactionStatusReference();
      if (response.status === successResponse) {
        setTransactionStatusReference(response.data as any);
      } else {
        swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
        console.log('Fetching transaction status reference' , response)
      }
    }
    catch (ex) {
      swal(SwalFailedMessage.title, SwalFailedMessage.textNoTransactionFieldMappingFound, SwalFailedMessage.icon);
    }

  }, [setTransactionStatusReference])

  const [{ loading: fetchingAssigneeList }, getAssigneeListAsync] = useAsyncFn(async (...args) => {
    try {
      const [keyword] = args;
      await getAssigneeListById(keyword.statusId, keyword.ticketTypeId, keyword.paymentMethodId, keyword.mlabPlayerId, keyword.ticketId, keyword.departmentId, keyword.adjustmentAmount).then((result: any) => {
        if (result.status === successResponse) {
          let assigneePageLookUp: LookupModel[] = result.data.map((user: any) => ({
            value: user.userId.toString(),
            label: user.fullName.toString()
          }));
          setAssigneeList(assigneePageLookUp);
          setAllLookUpsAssignee(assigneePageLookUp)
          setIsFetchedAssigneeList(true)
        } else {
          swal(SwalServerErrorMessage.title, TicketManagementConstants.NoAssigneeList, SwalServerErrorMessage.icon);
        }
      });
    } catch (ex) {
      swal(SwalServerErrorMessage.title, TicketManagementConstants.Error, SwalServerErrorMessage.icon);
    }

  }, [setAssigneeList])


  const [{ loading: fetchingAssigneePopupList }, getAssigneePopupListAsync] = useAsyncFn(async (...args) => {
    try {
      const [keyword] = args;
      await getAssigneeListById(keyword.statusId, keyword.ticketTypeId, keyword.paymentMethodId, keyword.mlabPlayerId, keyword.ticketId, keyword.departmentId, keyword.adjustmentAmount).then((result: any) => {
        if (result.status === successResponse) {
          let assigneeLookUp: LookupModel[] = result.data.map((user: any) => ({
            value: user.userId.toString(),
            label: user.fullName.toString()
          }));
          setAssigneePopupList(assigneeLookUp);
          setAllLookUpsAssignee(assigneeLookUp)
          setIsFetchedAssigneePopupList(true)
        } else {
          swal(SwalServerErrorMessage.title, TicketManagementConstants.NoAssigneeList, SwalServerErrorMessage.icon);
        }
      });
    } catch (ex) {
      swal(SwalServerErrorMessage.title, TicketManagementConstants.Error, SwalServerErrorMessage.icon);
    }

  }, [setAssigneePopupList])

  const setAllLookUpsAssignee = (assigneeLookUp: LookupModel[]) => {
    const allLookUps = allLookUpOptions
    const assigneeOption = allLookUpOptions.filter(x => x.fieldId === TICKET_FIELD.Assignee)
    if (assigneeOption.length > 0) {
      allLookUpOptions.map(x => {
        if (x.fieldId === TICKET_FIELD.Assignee) {
          const newArray = x.optionList.concat(assigneeLookUp.filter(o2 => !x.optionList.some(ol => ol.value === o2.value)))
          x.optionList = newArray
        }
      })
    } else {
      allLookUps.push({
        fieldId: TICKET_FIELD.Assignee,
        optionList: assigneeLookUp
      })
    }
    setAllTicketManagementOptions(allLookUps)
  }

  const getAutoAssignedId = (request: GetAutoAssignedIdRequestModel) => {
    try {
      setAutoAssignedId(null)
      getAutoAssigned(request).then((result: any) => {
        if (result.status === successResponse) {
          const { errMsg } = result.data ?? { userId: 0, errMsg: null }
          if (errMsg) {
            swal(SwalServerErrorMessage.title, TicketManagementConstants.Error, SwalServerErrorMessage.icon); // An error Occured during auto assign 
          } else {
  
            setAutoAssignedId(result.data.userId)
          }
        } else {
          setAutoAssignedId(0)
        }
      });
    
    } catch (ex) {
      setAutoAssignedId(null)
      swal(SwalServerErrorMessage.title, TicketManagementConstants.Error, SwalServerErrorMessage.icon);
    }

  }

  const [{ loading: fetchingTicketInformation }, getTicketInformationByTicketCodeAsync] = useAsyncFn(async (...args) => {
    try {
      const [keyword] = args;
      const response: any = await getTicketInfoById(keyword);
      if (response.status === successResponse) {
        let { ticketId, ticketDetails, ticketPlayer, ticketAttachments } = response.data
        setTicketInformation({ ...ticketInformation, ticketId: ticketId ?? 0, ticketTypeId: keyword.ticketTypeId ?? 0, ticketDetails: ticketDetails ?? [], ticketPlayerIds: ticketPlayer ?? [], ticketAttachments: ticketAttachments ?? [] });
        setAllFieldsOldValue(ticketDetails ?? [])
        setIsFetchTicketInformation(true)
        if (ticketId === 0) {
          swal(SwalServerErrorMessage.title, TicketManagementConstants.NoTicket, SwalServerErrorMessage.icon);
        }
      } else {
        swal(SwalServerErrorMessage.title, TicketManagementConstants.NoTicket, SwalServerErrorMessage.icon);
      }
    } catch (ex) {
      swal(SwalServerErrorMessage.title, TicketManagementConstants.Error, SwalServerErrorMessage.icon);
    }

  }, [setAutoAssignedId])

  const setForModal = (val: any) => {
    setIsForModal(val)
  }
  const setCurrentPlatformStatus = (val: any) => {
    setCurrentPlatformStatusId(val)
  }

  const setCurrentPaymentStatus = (val: any) => {
    setCurrentPaymentSystemStatusId(val)
  }

  const setCurrentTicketInfo = (val: any) => {
    setSelectedTicketInformation(val)
  }

  const setCurrentPaymentMethod = (val: any) => {
    setCurrentPaymentMethodId(val)
  }

  const setDefaultAutoAssignee = () => {
    setAutoAssignedId(null)
  }

  const setDefaultAssigneeList = () => {
    setAssigneeList([])
  }

  const [{ loading: fetchingTicketConfigTypes }, getTicketConfigTypesAsync] = useAsyncFn(async () => {
    try {
      const response = await getTicketTypes();
      if (response.status === successResponse) {
        setTicketConfigTypes(response.data);
      } else {
        swal(SwalServerErrorMessage.title, TicketManagementConstants.NoTicketTypes, SwalServerErrorMessage.icon);
      }
    }
    catch (ex) {
      swal(SwalFailedMessage.title, TicketManagementConstants.Error, SwalServerErrorMessage.icon);
    }
    disableSplashScreen();
  }, [setTicketConfigTypes])

  const [{ loading: fetchingTicketFieldMapping }, getFieldMappingAsync] = useAsyncFn(async (...args) => {
    try {
      const [keyword] = args;
      const response: any = await getTicketFieldMapping(keyword);
      if (response.status === successResponse) {
        const { formConfigurations, groupConfiguration } = response.data ?? { formConfigurations: [], groupConfiguration: [] };
        setTicketFieldMapping(formConfigurations);
        setTicketGroupingConfig(groupConfiguration)
      } else {
        swal(SwalServerErrorMessage.title, TicketManagementConstants.NoFieldMapping, SwalServerErrorMessage.icon);
      }
    } catch (ex) {
      swal(SwalFailedMessage.title, TicketManagementConstants.Error, SwalServerErrorMessage.icon);
    }
  }, [setTicketFieldMapping])

  // history
  const [{ loading: fetchingTicketHistoryData }, ticketHistoryAsync] = useAsyncFn(async (...args) => {
    try {
      const [keyword] = args;
      getTicketHistoryList(keyword);
    } catch (ex) {
      swal(SwalFailedMessage.title, TicketManagementConstants.Error, SwalServerErrorMessage.icon);
    }
  }, [setTicketHistoryData])

  const getTicketHistoryList = (request: GetTicketHistoryCollaboratorRequestModel) => {
    setIsLoading(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				RequestTicketHistory(request).then((response: any) => {
					if (response.status !== HttpStatusCodeEnum.Ok) {
						messagingHub.stop();
						return;
					}
					messagingHub.on(request.queueId.toString(), (message) => {
						GetTicketHistory(message.cacheId)
							.then((data) => {
								let resultData = Object.assign({} as any, data.data);
								setTicketHistoryData(resultData);
								messagingHub.off(request.queueId.toString());
								messagingHub.stop();
								setIsLoading(false);
							})
							.catch(() => {
								setIsLoading(false);
                console.log('Fetching ticket history' , response)
							});
					});
					setTimeout(() => {
						if (messagingHub.state === HubConnected) {
							messagingHub.stop();
						}
					}, 30000);
				});
			});
		}, 1000);
	};

  //collaborator
  const [{ loading: fetchingTicketCollaboratorData }, getTicketCollaboratorListAsync] = useAsyncFn(async (...args) => {
    try {
      const [keyword] = args;
      getCollaboratorList(keyword);
    } catch (ex) {
      swal(SwalFailedMessage.title, TicketManagementConstants.Error, SwalServerErrorMessage.icon);
    }
  }, [setTicketCollaboratorData])

  const getCollaboratorList = (request: GetTicketHistoryCollaboratorRequestModel) => {
    setIsLoading(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				RequestTicketCollaborator(request).then((response: any) => {
					if (response.status !== HttpStatusCodeEnum.Ok) {
						messagingHub.stop();
						return;
					}
					messagingHub.on(request.queueId.toString(), (message) => {
						GetTicketCollaborator(message.cacheId)
							.then((data) => {
								let resultData = Object.assign({} as any, data.data);
								setTicketCollaboratorData(resultData);
								messagingHub.off(request.queueId.toString());
								messagingHub.stop();
								setIsLoading(false);
							})
							.catch(() => {
								setIsLoading(false);
                console.log('Fetching ticket collaborator' , response)
							});
					});
					setTimeout(() => {
						if (messagingHub.state === HubConnected) {
							messagingHub.stop();
						}
					}, 30000);
				});
			});
		}, 1000);
	};


  const setHistoryFilters = (val: any) => {
    setHistoryFilter(val)
  }

  const setAllTicketManagementOptions = (val: any) => {
    setAllLookUpOptions(val)
  }

  const setAllFieldsOldValue = (val: any) => {
    setAllOldValue(val);
  }
  
  const setCurrentDepartmentId = (val: any) => {
    setCurrentDepartment(val)
  }

  const validateUserTier = async (request: ValidateUserTierRequestModel) => {
    try {
      const result: any = await ValidateUserTier(request);
      if (result.status === successResponse) {
        setIsUserValidTier(result.data)
      } 
    } catch (ex) {
      setIsUserValidTier(false);
      swal(SwalServerErrorMessage.title, TicketManagementConstants.Error, SwalServerErrorMessage.icon);
    }
  };


  const [{ loading: fetchingProcessorData }, getAllProcessorListAsync] = useAsyncFn(async () => {
    try {
      const result: any = await GetAllPaymentProcessor();
      if (result.status === successResponse) {
        setProcessorData(result.data)
      } 
    } catch (ex) {
      swal(SwalFailedMessage.title, TicketManagementConstants.ErrorProcessor, SwalServerErrorMessage.icon);
    }
  }, [setProcessorData])

  
  const value: IProps = useMemo(() => {
    // Group related properties
    const playerInfo = {
      selectedPlayer,
      getPlayerInfoByFilterAsync,
      fetchingPlayer,
      isFetchedPlayer,
    };
  
    const transactionData = {
      selectedLatestTransactionData,
      getLatestTransactionDataAsync,
      fetchingLatestTransaction,
      transactionStatusReference,
      getTransactionStatusReferenceAsync,
      fetchingTransactionStatusReference,
      isFetchingApi,
      fetchingError
    };
  
    const ticketDetails = {
      selectedTicketThresholds,
      getTicketThresholdsAsync,
      fetchingTicketThresholds,
      selectedTicketInformation,
      setCurrentTicketInfo,
      isFetchTicketInformation,
      ticketInformation,
      fetchingTicketInformation,
      getTicketInformationByTicketCodeAsync,
      ticketConfigTypes,
      getTicketConfigTypesAsync,
      fetchingTicketConfigTypes,
      ticketFieldMapping,
      getFieldMappingAsync,
      fetchingTicketFieldMapping,
    };
  
    const platformStatus = {
      currentPlatformStatusId,
      setCurrentPlatformStatus,
      currentPaymentSystemStatusId,
      setCurrentPaymentStatus,
      currentPaymentMethodId,
      setCurrentPaymentMethod,
    };
  
    const ticketHistory = {
      ticketHistoryData,
      fetchingTicketHistoryData,
      ticketHistoryAsync,
      historyFilter,
      setHistoryFilters,
      isLoading,
      ticketCollaboratorData,
      fetchingTicketCollaboratorData,
      getTicketCollaboratorListAsync
    };
  
    const assigneeData = {
      assigneeList,
      fetchingAssigneeList,
      getAssigneeListAsync,
      autoAssignedId,
      getAutoAssignedId,
      isFetchedAssigneeList,
      setDefaultAutoAssignee,
      isUserValidTier,
      validateUserTier,
      assigneePopupList,
      fetchingAssigneePopupList,
      isFetchedAssigneePopupList,
      getAssigneePopupListAsync,
      setDefaultAssigneeList
    };
  
    const modalSettings = {
      isForModal,
      setForModal,
    };
  
    const departmentInfo = {
      currentDepartment,
      setCurrentDepartmentId,
    };
  
    const allOptions = {
      allLookUpOptions,
      setAllTicketManagementOptions,
      allOldValue,
      setAllFieldsOldValue,
    };

    const processorDataInfo = {
      processorData,
      fetchingProcessorData,
      getAllProcessorListAsync,
    };
  
    return {
      ...playerInfo,
      ...transactionData,
      ...ticketDetails,
      ...platformStatus,
      ...ticketHistory,
      ...assigneeData,
      ...modalSettings,
      ...departmentInfo,
      ...allOptions,
      ...processorDataInfo,
      ticketGroupingConfig,
    };
  }, [
    selectedPlayer,
    selectedLatestTransactionData,
    getPlayerInfoByFilterAsync,
    fetchingPlayer,
    getLatestTransactionDataAsync,
    fetchingLatestTransaction,
    selectedTicketThresholds,
    getTicketThresholdsAsync,
    fetchingTicketThresholds,
    isForModal,
    setForModal,
    transactionStatusReference,
    getTransactionStatusReferenceAsync,
    fetchingTransactionStatusReference,
    currentPlatformStatusId,
    currentPaymentSystemStatusId,
    setCurrentPlatformStatus,
    setCurrentPaymentStatus,
    selectedTicketInformation,
    setCurrentTicketInfo,
    isFetchedPlayer,
    assigneeList,
    fetchingAssigneeList,
    getAssigneeListAsync,
    autoAssignedId,
    getAutoAssignedId,
    currentPaymentMethodId,
    setCurrentPaymentMethod,
    isFetchedAssigneeList,
    ticketInformation,
    fetchingTicketInformation,
    isFetchTicketInformation,
    getTicketInformationByTicketCodeAsync,
    fetchingTicketConfigTypes,
    ticketConfigTypes,
    getTicketConfigTypesAsync,
    fetchingTicketFieldMapping,
    ticketFieldMapping,
    getFieldMappingAsync,
    processorData,
    fetchingProcessorData,
    getAllProcessorListAsync,
    ticketGroupingConfig,
    ticketHistoryData,
    fetchingTicketHistoryData,
    ticketHistoryAsync,
    historyFilter,
    setHistoryFilters,
    allLookUpOptions,
    setAllTicketManagementOptions,
    allOldValue,
    setAllFieldsOldValue,
    currentDepartment,
    setCurrentDepartmentId,
    setDefaultAutoAssignee,
    isLoading,
    ticketCollaboratorData,
    fetchingTicketCollaboratorData,
    getTicketCollaboratorListAsync,
    isFetchingApi,
    fetchingError,
    isUserValidTier,
    validateUserTier,
    assigneePopupList,
    fetchingAssigneePopupList,
    isFetchedAssigneePopupList,
    getAssigneePopupListAsync,
    setDefaultAssigneeList
  ]);

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>
}

