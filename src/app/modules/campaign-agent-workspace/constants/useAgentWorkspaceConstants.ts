const useAgentWorkspaceConstants = () => {

  const CAMPAIGN_STATUS = {
    Onhold: 30,
    Ended: 31,
    Completed: 32,
    Inactive: 33,
  }

  const LABELS = {
    View_Case: 'View Case',
    Create_Case: 'Create Case'
  }

  const AGENT_WORKSPACE_MODULE = {
    SmallestPageSize: 10,
    DefaultPageSize: 20,
  }

  const MESSAGES = {
    TagToAnotherUser: 'Unable to proceed. The player has been tagged to another user.',
    TagSuccess: 'Player successfully tagged!'
  }

  return {
    CAMPAIGN_STATUS,
    AGENT_WORKSPACE_MODULE,
    LABELS,
    MESSAGES
  }
}

export default useAgentWorkspaceConstants