const useAgentMonitoringConstants = () => {

  const CAMPAIGN_STATUS = {
    Onhold: 30,
    Ended: 31,
    Completed: 32,
    Inactive: 33,
  }

  const AGENT_MONITORING_MESSAGES ={
    Multiple_Statuses: 'Please select agents with same status for batch change',
    Select_Campaign_Type: 'Please select Campaign type',
    Select_Campaign_Name: 'Please select Campaign name',
    Agent_Status_Success: 'Agent status was changed',
    Settings_Error: 'Problem setting changed',
    Call_List_Validation_Error: 'Problem in getting Call list validation filters'
  }

  return {
    CAMPAIGN_STATUS,
    AGENT_MONITORING_MESSAGES
  }
}

export default useAgentMonitoringConstants