import { useState } from 'react';
import swal from 'sweetalert';
import { updateCampaignAgentStatus } from '../redux/AgentMonitoringService';
import useConstant from '../../../constants/useConstant';
import * as hubConnection from '../../../../setup/hub/MessagingHub'
import { UpsertAgentStatusModel, AgentStatusRequestModel } from '../models/request/AgentStatusRequestModel';
import useAgentMonitoringConstants from '../constants/useAgentMonitoringConstants';

export const useAgentMonitoringHooks = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const { HubConnected, successResponse, SwalSuccessMessage, SwalFailedMessage, SwalServerErrorMessage } = useConstant()
  const { AGENT_MONITORING_MESSAGES } = useAgentMonitoringConstants();

  const toggleAgentStatus = async (agentList: UpsertAgentStatusModel[], queueId: string, userId: string) => {
    setIsSuccess(false)
    setIsLoading(true)
    const messagingHub = hubConnection.createHubConnenction()
    messagingHub
      .start()
      .then(() => {
        if (messagingHub.state === HubConnected) {
          const request: AgentStatusRequestModel = {
            queueId: queueId,
            userId: userId,
            agentStatusList: agentList,
          }

          updateCampaignAgentStatus(request)
            .then((response) => {
              if (response.status === successResponse) {
                messagingHub.on(request.queueId.toString(), (message) => {
                  let resultData = JSON.parse(message.remarks)
                  if (resultData.Status !== successResponse) {
                    swal(SwalFailedMessage.title, resultData.Message, SwalFailedMessage.icon)
                    setIsSuccess(false)
                    setIsLoading(false)
                  } else {
                    swal(SwalSuccessMessage.title, AGENT_MONITORING_MESSAGES.Agent_Status_Success, SwalSuccessMessage.icon)
                    setIsSuccess(true)
                    setIsLoading(false)
                  }
                  messagingHub.off(request.queueId.toString())
                  messagingHub.stop()
                })
                setTimeout(() => {
                  if (messagingHub.state === HubConnected) {
                    messagingHub.stop()
                  }
                }, 30000)
              } else {
                swal(SwalFailedMessage.title, response.data.message, SwalFailedMessage.icon)
                setIsSuccess(false)
                setIsLoading(false)
              }
            })
            .catch(() => {
              messagingHub.stop()
              swal(SwalFailedMessage.title, AGENT_MONITORING_MESSAGES.Settings_Error, SwalFailedMessage.icon)
              setIsSuccess(false)
              setIsLoading(false)
            })
        } else {
          messagingHub.stop()
          swal(SwalFailedMessage.title, SwalServerErrorMessage.textError, SwalFailedMessage.icon)
          setIsSuccess(false)
          setIsLoading(false)
        }
      })
      .catch((err) => console.log('Error while starting connection: ' + err))
  }

  return {
    isLoading,
    isSuccess,
    toggleAgentStatus,
  };
};
