import { useState } from 'react';
import swal from 'sweetalert';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import { HttpStatusCodeEnum } from '../../../../constants/Constants';
import { AutoDistributionSettingFilterRequest } from "../../models/request/AutoDistributionSettingFilterRequest";
import { GetAllAutoDistributionConfigListOrder, GetAutoDistributionConfigurationCount, GetAutoDistributionSettingAgentsListByFilter, GetAutoDistributionSettingAgentsListResult, GetAutoDistributionSettingConfigsListByFilter, GetAutoDistributionSettingConfigsListResult, SaveAutoDistributionConfiguration, ValidateAutoDistributionConfigurationName } from "../../services/RemSettingApi";
import { RemAutoDistributionConfigListResponse } from '../../models/response/RemAutoDistributionConfigListResponse';
import { RemAutoDistributionAgentListResponse } from '../../models/response/RemAutoDistributionAgentListResponse';
import useConstant from '../../../../constants/useConstant';
import { AutoDistributionSettingConfigsListOrder } from '../../models/response/AutoDistributionSettingConfigsListOrder';
import { AutoDistributionSettingsFilterModel } from '../../models/request/AutoDistributionSettingsFilterModel';
import { PaginationModel } from '../../../../shared-models/PaginationModel';
import { Guid } from 'guid-typescript';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../../../../../setup/redux/RootReducer';
import { AutoDistributionConfigurationRequestModel } from '../../models/request/AutoDistributionConfigurationRequestModel';
import { AutoDistributionConfigurationRequest } from '../../models/request/AutoDistributionConfigurationRequest';

export default function useAutoDistributionSettingHooks() {
    // State
    const messagingHub = hubConnection.createHubConnenction();

    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number;
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<boolean>(false);
    const [autoDistributionConfigList, setAutoDistributionConfigList] = useState<Array<any>>([]);
    const [autoDistributionConfigTotalCount, setAutoDistributionConfigTotalCount] = useState<number>(0);
    const [autoDistributionAgentsList, setAutoDistributionAgentsList] = useState<Array<any>>([]);
    const [autoDistributionAgentsTotalCount, setAutoDistributionAgentsTotalCount] = useState<number>(0);
    const [userConfigurationTotalCount, setUserConfigurationTotalCount] = useState<number>(0);
    const [configurationTotalCount, setConfigurationTotalCount] = useState<number>(0);
    const [configListOrder, setConfigListOrder] = useState<Array<AutoDistributionSettingConfigsListOrder>>([]);
    const { successResponse } = useConstant()

    const generateParam = (search: AutoDistributionSettingsFilterModel, pagination: PaginationModel) => {
        const status = search.configurationStatus?.value.toString() ?? '';
        const requestObj: AutoDistributionSettingFilterRequest = {
            configurationName: search.configurationName ?? '',
            remProfileIds: search.remProfileIds?.length > 0 ? search.remProfileIds.map((i) => i.value).join(',') : undefined,
            status: status === '' ? undefined : status === 'true',
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
            offsetValue: (pagination.currentPage - 1) * pagination.pageSize,
            sortColumn: pagination.sortColumn,
            sortOrder: pagination.sortOrder,
            queueId: Guid.create().toString(),
            userId: userAccessId.toString(),
        }

        return requestObj;
    }

    const generateRequestModel = (request: AutoDistributionConfigurationRequest) => {
        const adsCurrencyType: Array<{ CurrencyId: number }> = request.selectedCurrency.map((i) => { return { CurrencyId: i } });
        const adsVipLevelType: Array<{ VipLevelId: number }> = request.selectedVipLevel.map((i) => { return { VipLevelId: i } });
        const adsCountryType: Array<{ CountryId: number }> = request.selectedCountry.map((i) => { return { CountryId: i } });
        const adsRemAgentType: Array<{ RemProfileId: number }> = request.selectedRemAgents.map((i) => { return { RemProfileId: i } });

        const requestObj: AutoDistributionConfigurationRequestModel = {
            autoDistributionSettingId: request.autoDistributionSettingId,
            configurationName: request.configurationName,
            adsCurrencyType: adsCurrencyType,
            adsVipLevelType: adsVipLevelType,
            adsCountryType: adsCountryType,
            adsRemAgentType: adsRemAgentType,
            queueId: Guid.create().toString(),
            userId: userAccessId.toString(),
        }

        return requestObj;
    }

    const getDistributionConfigList = async (request: AutoDistributionSettingFilterRequest) => {
        await messagingHub
            .start()
            .then(() => {
                if (messagingHub.state === 'Connected') {
                    setSearchLoading(true);
                    GetAutoDistributionSettingConfigsListByFilter(request)
                        .then((response) => {
                            if (response.status === HttpStatusCodeEnum.Ok) {
                                messagingHub.on(request.queueId.toString(), (message) => {
                                    GetAutoDistributionSettingConfigsListResult(message.cacheId)
                                        .then((data) => {
                                            let configList = data.data as RemAutoDistributionConfigListResponse
                                            setAutoDistributionConfigList(configList.configurationList);
                                            setAutoDistributionConfigTotalCount(configList.configurationTotalRecordCount);

                                            messagingHub.off(request.queueId.toString());
                                            messagingHub.stop();
                                            setSearchLoading(false);
                                        })
                                        .catch(() => {
                                            setSearchLoading(false);
                                        });
                                });

                                setTimeout(() => {
                                    if (messagingHub.state === 'Connected') {
                                        messagingHub.stop();
                                    }
                                }, 30000);
                            }
                        })
                }
            })
    }

    const getDistributionAgentList = async (request: AutoDistributionSettingFilterRequest) => {
        await messagingHub
            .start()
            .then(() => {
                if (messagingHub.state === 'Connected') {
                    setSearchLoading(true);
                    GetAutoDistributionSettingAgentsListByFilter(request)
                        .then((response) => {
                            if (response.status === HttpStatusCodeEnum.Ok) {
                                messagingHub.on(request.queueId.toString(), (message) => {
                                    GetAutoDistributionSettingAgentsListResult(message.cacheId)
                                        .then((data) => {
                                            let remProfileObj = data.data as RemAutoDistributionAgentListResponse
                                            setAutoDistributionAgentsList(remProfileObj.remProfileList);
                                            setAutoDistributionAgentsTotalCount(remProfileObj.remProfileTotalRecordCount);
                                            messagingHub.off(request.queueId.toString());
                                            messagingHub.stop();
                                            setSearchLoading(false);
                                        })
                                        .catch(() => {
                                            setSearchLoading(false);
                                        });
                                });

                                setTimeout(() => {
                                    if (messagingHub.state === 'Connected') {
                                        messagingHub.stop();
                                    }
                                }, 30000);
                            }
                        })
                }
            })
    }

    const getAllAutoDistributionConfigListOrder = async () => {
        await GetAllAutoDistributionConfigListOrder()
            .then((response) => {
                if (response.status === successResponse) {
                    setConfigListOrder(response.data);
                }
                else {
                    console.log('Problem in getting config list');
                }
            })
            .catch((ex) => {
                console.log('Error GetAllAutoDistributionConfigListOrder: ' + ex);
            });
    }

    const getUserConfigurationTotalCount = async (userId: number) => {
        await GetAutoDistributionConfigurationCount(userId)
            .then((response) => {
                if (response.status === successResponse) {
                    setUserConfigurationTotalCount(response.data.userConfigurationTotalCount);
                    setConfigurationTotalCount(response.data.configurationTotalCount);
                }
                else {
                    console.log('Problem in getting config count');
                }
            })
            .catch((ex) => {
                console.log('Error GetAutoDistributionConfigurationCountByUserId: ' + ex);
            });
    }

    const isConfigurationNameExisting = async (autoDistributionSettingId: number, configurationName: string) => {
        return await ValidateAutoDistributionConfigurationName(autoDistributionSettingId, configurationName)
            .then((response) => {
                if (response.status === successResponse) {
                    return response.data;
                }
                else {
                    console.log('Problem in validating configuration name');
                }
            })
            .catch((ex) => {
                console.log('Error ValidateAutoDistributionConfigurationName: ' + ex);
            });
    }

    const upsertAutoDistributionConfiguration = async (request: AutoDistributionConfigurationRequestModel) => {
        await messagingHub
            .start()
            .then(() => {
                if (messagingHub.state === 'Connected') {
                    setResetForm(false);
                    SaveAutoDistributionConfiguration(request)
                        .then((response) => {
                            if (response.status === successResponse) {
                                messagingHub.on(request.queueId.toString(), (message) => {
                                    let resultData = JSON.parse(message.remarks);
                                    if (resultData.Status === successResponse) {
                                        swal('Success', 'Transaction successfully submitted', 'success').then((willUpdate) => {
                                            if (willUpdate) {
                                                setResetForm(true);
                                            }
                                        });
                                    } else {
                                        swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
                                    }
                                    messagingHub.off(request.queueId.toString());
                                    messagingHub.stop();
                                });
                                setTimeout(() => {
                                    if (messagingHub.state === 'Connected') {
                                        messagingHub.stop();
                                    }
                                }, 30000);
                            } else {
                                console.log('Problem in validating configuration name');
                            }
                        })
                }
            })
    }

    return {
        getDistributionConfigList,
        autoDistributionConfigList,
        autoDistributionConfigTotalCount,
        getDistributionAgentList,
        autoDistributionAgentsList,
        autoDistributionAgentsTotalCount,
        searchLoading,
        setSearchLoading,
        getAllAutoDistributionConfigListOrder,
        configListOrder,
        generateParam,
        generateRequestModel,
        getUserConfigurationTotalCount,
        userConfigurationTotalCount,
        configurationTotalCount,
        isConfigurationNameExisting,
        upsertAutoDistributionConfiguration,
        resetForm,
    };
}

