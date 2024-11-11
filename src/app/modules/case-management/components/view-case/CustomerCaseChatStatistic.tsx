import React, { useEffect, useState } from 'react'
import { FormGroupContainer } from '../../../../custom-components';
import ChatStatisticSkillSegment from './ChatStatisticSkillSegment';
import ChatStatisticAgentSegment from './ChatStatisticAgentSegment';
import ChatStatisticChatAbandonment from './ChatStatisticChatAbandonment';
import ChatStatisticChatInformation from './ChatStatisticChatInformation';
import { getChatStatisticsByCommunicationId } from '../../services/CustomerCaseApi';
import useConstant from '../../../../constants/useConstant';
import { CaseCommunicationChatStatisticModel } from '../../models/response/CaseCommunicationChatStatisticModel';
import { ChatStatisticsChatInformation } from '../../models/response/ChatStatisticsChatInformation';
import { ChatStatisticsAbandonment } from '../../models/response/ChatStatisticsAbandonment';
import { ChatStatisticsAgentSegment } from '../../models/response/ChatStatisticsAgentSegment';
import { ChatStatisticsSkillSegment } from '../../models/response/ChatStatisticsSkillSegment';
import swal from 'sweetalert';
import ChatStatisticSkeletonLoading from './ChatStatisticSkeletonLoading';

interface ChatStatisticProps {
	communicationId?: any;
  messageType?: string;
  isChatStatisticTabSelected?: boolean;
}

const styles = {
  
    boxHeader: {
        padding: "10px 0px 10px 0px"
    },
    subHeaderPaading: {
        paddingLeft: "0px",
    }
  };
  

export const CustomerCaseChatStatistic: React.FC<ChatStatisticProps> = ({communicationId, messageType, isChatStatisticTabSelected}) => {
    const { successResponse, SwalServerErrorMessage	} = useConstant();
    const [chatInformation, setChatInformation] = useState<ChatStatisticsChatInformation>();
    const [chatAbandonment, setChatAbandonment] = useState<ChatStatisticsAbandonment>();
    const [chatAgentSegment, setChatAgentSegment] = useState<Array<ChatStatisticsAgentSegment>>();
    const [chatAgentSegmentRecordCount, setChatAgentSegmentRecordCount] = useState<number>();
    const [chatSkillSegment, setChatSkillSegment] = useState<Array<ChatStatisticsSkillSegment>>();
    const [chatSkillSegmentRecordCount, setChatSkillSegmentRecordCount] = useState<number>();
    const [loading, setLoading] = useState<boolean>(false);
    
	useEffect(() => {
    
      if(communicationId > 0 && isChatStatisticTabSelected)
        getChatStatisticsDetailsByCommunicationId(communicationId)
    },[communicationId, isChatStatisticTabSelected])

  const getChatStatisticsDetailsByCommunicationId = async (communicationId: number) => {
      setLoading(true)
      
        await getChatStatisticsByCommunicationId(communicationId)
            .then((response) => {
                setTimeout(() => {
                      if (response.status === successResponse) {

                        let chatStatistics: CaseCommunicationChatStatisticModel = response.data;                    

                        setChatInformation(chatStatistics.chatInformationModel)
                        setChatAbandonment(chatStatistics.chatAbandonmentModel)
                        setChatAgentSegment(chatStatistics.chatAgentSegmentModel)
                        setChatAgentSegmentRecordCount(chatStatistics.chatStatisticsAgentSegmentRecordCountModel.agentSegmentRecordCount)
                        setChatSkillSegment(chatStatistics.chatStatisticsSkillSegmentModel)
                        setChatSkillSegmentRecordCount(chatStatistics.chatStatisticsSkillSegmentRecordCountModel.skillSegmentRecordCount)
                        setLoading(false)
                      }
                      else {
                        setLoading(false)
                        swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);

                      }              
                }, 200)
            })
            .catch((ex) => {
              console.log('[ERROR] Chat Statistic details error: ' + ex);
              setLoading(false)
            });


      
	}

  return (
    <>

      {loading ? <ChatStatisticSkeletonLoading/> : 
        <FormGroupContainer>
                  <div className='row mt-4'>
                      <div className='col-lg-3' style={styles.subHeaderPaading}>
                          <span className='fw-bold'>Chat Statistics: </span>
                          <span>{messageType}</span>
                      </div>
                  </div>

                  <ChatStatisticChatInformation chatInformation={chatInformation}/>

                  <ChatStatisticChatAbandonment chatAbandonment={chatAbandonment}/>
                
                  <ChatStatisticAgentSegment chatAgentSegment={chatAgentSegment} recordCount={chatAgentSegmentRecordCount} isLoading={loading}/>
                  
                  <ChatStatisticSkillSegment chatSkillSegment={chatSkillSegment} recordCount={chatSkillSegmentRecordCount} isLoading={loading}/>
            </FormGroupContainer>
      }
    </>
  )
}

export default CustomerCaseChatStatistic
