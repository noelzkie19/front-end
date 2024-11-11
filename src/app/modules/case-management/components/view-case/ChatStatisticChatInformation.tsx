import React from 'react'
import { FormGroupContainer } from '../../../../custom-components'
import { ChatStatisticsChatInformation } from '../../models/response/ChatStatisticsChatInformation';


interface ChatInfoProps {
	chatInformation?: ChatStatisticsChatInformation;
}

const styles = {
    box: {
    margin: "8px",
      border: "1px solid #ccc",
      padding: "16px",
      width: '98%',
      height: "auto",
      backgroundColor: "#f9f9f9",
      
    },
    boxHeader: {
        padding: "10px 0px 10px 0px"
    },
    subHeaderPaading: {
        paddingLeft: "0px",
    }
  };

  
const ChatStatisticChatInformation:React.FC<ChatInfoProps> = ({chatInformation}) => {
  return (
    <div>
      <FormGroupContainer>
                <span className='fw-bolder mt-2' style={styles.boxHeader}>Chat Information</span>
                <div style={styles.box}>
                    <div className='row'>
                        <div className='col-lg-4'>
                            <span className='fw-bold'>ConversationID: </span>
                            <span>{chatInformation?.conversationId}</span>
                        </div>

                        <div className='col-lg-4'>
                            <span className='fw-bold'>startTime: </span>
                            <span>{chatInformation?.startTime}</span>
                        </div>

                        <div className='col-lg-4'>
                            <span className='fw-bold'>conversationEndTime: </span>
                            <span>{chatInformation?.conversationEndTime}</span>
                        </div>

                    </div>
                

                    <div className='row mt-4'>
                        <div className='col-lg-4'>
                            <span className='fw-bold'>endTime: </span>
                            <span>{chatInformation?.endTime}</span>
                        </div>

                        <div className='col-lg-4'>
                            <span className='fw-bold'>latestSkillId: </span>
                            <span>{chatInformation?.latestSkillId}</span>
                        </div>

                        <div className='col-lg-4'>
                            <span className='fw-bold'>latestSkillName: </span>
                            <span>{chatInformation?.latestSkillName}</span>
                        </div>

                    </div>

                    <div className='row mt-4'>
                        <div className='col-lg-4'>
                            <span className='fw-bold'>latestSkillTeamId: </span>
                            <span>{chatInformation?.latestSkillTeamId}</span>
                        </div>

                        <div className='col-lg-4'>
                            <span className='fw-bold'>latestSkillTeamName: </span>
                            <span>{chatInformation?.latestSkillTeamName}</span>
                        </div>

                        <div className='col-lg-4'>
                            <span className='fw-bold'>latestAgentID: </span>
                            <span>{chatInformation?.latestAgentId}</span>
                        </div>

                    </div>

                    <div className='row mt-4'>
                        <div className='col-lg-4'>
                            <span className='fw-bold'>latestAgentName: </span>
                            <span>{chatInformation?.latestAgentName}</span>
                        </div>

                        <div className='col-lg-4'>
                            <span className='fw-bold'>latestQueueState: </span>
                            <span>{chatInformation?.latestQueueState}</span>
                        </div>

                        <div className='col-lg-4'>
                            <span className='fw-bold'>Status: </span>
                            <span>{chatInformation?.status}</span>
                        </div>

                    </div>

                    <div className='row mt-4'>
                        <div className='col-lg-4'>
                            <span className='fw-bold'>conversationAvgResponseTime: </span>
                            <span>{chatInformation?.conversationAvgResponseTime}</span>
                        </div>

                        <div className='col-lg-4'>
                            <span className='fw-bold'>conversationDuration: </span>
                            <span>{chatInformation?.conversationDuration}</span>
                        </div>
                    </div>
                </div>
            </FormGroupContainer>
    </div>
  )
}

export default ChatStatisticChatInformation
