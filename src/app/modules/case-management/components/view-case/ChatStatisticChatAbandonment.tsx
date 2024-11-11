import React from 'react'
import { FormGroupContainer } from '../../../../custom-components'
import { ChatStatisticsAbandonment } from '../../models/response/ChatStatisticsAbandonment';

interface ChatStatisticProps {
	chatAbandonment?: ChatStatisticsAbandonment;
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
  
const ChatStatisticChatAbandonment:React.FC<ChatStatisticProps> = ({chatAbandonment}) => {
  return (
    <div>
       <FormGroupContainer>
                <span className='fw-bolder mt-2' style={styles.boxHeader}>Chat Abandonment</span>
                <div style={styles.box}>
                    <div className='row'>
                        <div className='col-lg-4'>
                            <span className='fw-bold'>IsLastAgentAbandonedAssigned: </span>
                            <span>{chatAbandonment?.isLastAgentAbandonedAssigned}</span>
                        </div>

                        <div className='col-lg-4'>
                            <span className='fw-bold'>IsLastSkillAbandonedQueue: </span>
                            <span>{chatAbandonment?.isLastSkillAbandonedQueue}</span>
                        </div>
                    </div>
                </div>
                <span className='fw-bolder mt-2' style={styles.boxHeader}>Last Agent | Last Skill  Information</span>
                <div style={styles.box}>
                    <div className='row'>
                        <div className='col-lg-4'>
                            <span className='fw-bold'>lastAgentAvgDuration: </span>
                            <span>{chatAbandonment?.lastAgentAvgDuration}</span>
                        </div>

                        <div className='col-lg-4'>
                            <span className='fw-bold'>lastAgentAvgWaitingTime: </span>
                            <span>{chatAbandonment?.lastAgentAvgWaitingTime}</span>
                        </div>

                        <div className='col-lg-4'>
                            <span className='fw-bold'>lastAgentAvgContactDuration: </span>
                            <span>{chatAbandonment?.lastAgentAvgContactDuration}</span>
                        </div>

                    </div>

                    <div className='row mt-4'>
                        <div className='col-lg-4'>
                            <span className='fw-bold'>lastAgentTotDuration: </span>
                            <span>{chatAbandonment?.lastAgentTotDuration}</span>
                        </div>

                        <div className='col-lg-4'>
                            <span className='fw-bold'>lastAgentTotWaitingTime: </span>
                            <span>{chatAbandonment?.lastAgentTotWaitingTime}</span>
                        </div>

                        <div className='col-lg-4'>
                            <span className='fw-bold'>lastAgentTotContactDuration: </span>
                            <span>{chatAbandonment?.lastAgentTotContactDuration}</span>
                        </div>

                    </div>

                    <div className='row mt-4'>
                        <div className='col-lg-4'>
                            <span className='fw-bold'>lastAgentAvgResponseTime: </span>
                            <span>{chatAbandonment?.lastAgentAveResponseTime}</span>
                        </div>

                        <div className='col-lg-4'>
                            <span className='fw-bold'>lastSkillAvgDuration: </span>
                            <span>{chatAbandonment?.lastSkillAvgDuration}</span>
                        </div>

                        <div className='col-lg-4'>
                            <span className='fw-bold'>lastSkillTotDuration: </span>
                            <span>{chatAbandonment?.lastSkillTotDuration}</span>
                        </div>
                    </div>
                </div>
                </FormGroupContainer>
    </div>
  )
}

export default ChatStatisticChatAbandonment
