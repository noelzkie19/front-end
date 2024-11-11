import { useContext} from 'react'
import LeftSection from './sections/LeftSection'
import TopSection from './sections/TopSection'
import RightSection from './sections/RightSection'
import BottomSection from './sections/BottomSection'
import MainContainer from '../../../../custom-components/containers/MainContainer'
import { TicketContext } from '../../context/TicketContext'
import "../../styles/TicketDetails.css";

const TicketSectioning = ({ selectedTicketConfig, ticketCustomGroupings, 
  hasLeftSection, hasRightSection, hasRightCustomSection,
  changeTicketType, ticketMapping, dynamicTicketForm, updateDynamicTicket, 
  handleTextInputSearching, viewOnly, ticketInfo, setTicketInfo, userId, displayComment, updateTextInputSearchValidation 
    , refreshComment , refreshTicketComment, recordCurrentStatus, autoAssignedId ,
   verifiedPlayerId, superSedeFields, assigneeList
}: any) => {

  const { ticketConfigTypes } = useContext(TicketContext)

  return (
    <MainContainer>
        
      <div className='p-4'>
        <div className='d-flex'>
          <div className='' style={{ width: '70%' }}>
            <TopSection isColored='#ECF5FF'
              ticketTypeOption={ticketConfigTypes}
              onChangeTicketType={changeTicketType}
              fieldMapping={ticketMapping}
              selectedTicket={selectedTicketConfig}
              dynamicTicketForm={dynamicTicketForm}
              updateDynamicTicket={updateDynamicTicket}
              viewOnly={viewOnly}
              stateData={ticketInfo}
              stateChange={setTicketInfo}
              recordCurrentStatus={recordCurrentStatus}             
            />
            {hasLeftSection &&
              <>
                <div style={{ padding: '0.5rem' }}></div>
                <LeftSection isColored='#ECF5FF'
                  fieldMapping={ticketMapping}
                  handleTextInputSearching={handleTextInputSearching}
                  dynamicTicketForm={dynamicTicketForm}
                  updateDynamicTicket={updateDynamicTicket}
                  viewOnly={viewOnly}
                  stateData={ticketInfo} 
                  updateTextInputSearchValidation={updateTextInputSearchValidation}
                  superSedeFields={superSedeFields}
                />
              </>
            }
          </div>
          <div style={{ padding: '1rem' }}></div>
          <div className='' style={{ width: '30%' }}>
            {(hasRightSection || hasRightCustomSection) && <RightSection isColored='#ECF5FF'
              fieldMapping={ticketMapping}
              customGrouping={ticketCustomGroupings}
              updateDynamicTicket={updateDynamicTicket}
              dynamicTicketForm={dynamicTicketForm}
              viewOnly={viewOnly}
              stateData={ticketInfo} 
              assigneeList={assigneeList}
              showAutoAssign={false}
              autoAssignedId={autoAssignedId}
              verifiedPlayerId={verifiedPlayerId}
            />}
          </div>
        </div>
        <BottomSection viewOnly={viewOnly} isColored={'#ECF5FF'} stateData={ticketInfo} stateChange={setTicketInfo} customGrouping={ticketCustomGroupings} userId={userId} displayComment={displayComment} 
        refreshComment = {refreshComment} refreshTicketComment={refreshTicketComment}/>
      </div>
    </MainContainer>
  )
}

export default TicketSectioning