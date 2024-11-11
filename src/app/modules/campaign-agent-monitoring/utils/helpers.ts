import useAgentMonitoringConstants from "../constants/useAgentMonitoringConstants";
// This logic would verify if the array having multiple data has different statuses
export const HasMultipleStatus = (data: any) => {
  const statusSet = new Set(data.map((item: any) => item.status));
  return statusSet.size > 1
}

export const IsDisabledAgentStatusBasedOnCampaignStatus = (status: number): boolean => {
  let isDisabled: boolean = false
  const { CAMPAIGN_STATUS } = useAgentMonitoringConstants();
  if (
    status === CAMPAIGN_STATUS.Onhold ||
    status === CAMPAIGN_STATUS.Ended ||
    status === CAMPAIGN_STATUS.Inactive ||
    status === CAMPAIGN_STATUS.Completed
  ) {
    isDisabled = true
  }
  return isDisabled
}

export const IsDisabledDailyReportBasedOnCampaignStatus = (status: number): boolean => {
  let isDisabled: boolean = false
  const { CAMPAIGN_STATUS } = useAgentMonitoringConstants();
  if (status === CAMPAIGN_STATUS.Completed) {
    isDisabled = true
  }
  return isDisabled
}