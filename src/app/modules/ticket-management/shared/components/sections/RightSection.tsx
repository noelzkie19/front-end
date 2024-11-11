
import { useState, useEffect } from 'react'
import PlayerCustomGroupings from '../groups/custom-groupings/PlayerCustomGroupings'
import { FieldMappingResponseModel } from '../../../models/ticket-config/FieldMappingResponseModel'
import TicketGrouping from '../TicketGrouping'
import useTicketConstant from '../../../constants/TicketConstant'
import TicketManagementContainer from '../TicketManagementContainer'
import { TicketInfoModel } from '../../../models/TicketInfoModel'

interface SectionProps {
  isColored?: string
  fieldMapping?: FieldMappingResponseModel[]
  customGrouping?: any[]
  updateDynamicTicket?: any,
  dynamicTicketForm?: any
  viewOnly?: boolean
  stateData: TicketInfoModel,
  assigneeList?: any,
  showAutoAssign: boolean,
  autoAssignedId?: number,
  verifiedPlayerId?: any
}

const RightSection = ({ isColored = "transparent", fieldMapping, customGrouping  ,updateDynamicTicket, dynamicTicketForm, viewOnly, stateData , assigneeList, showAutoAssign, autoAssignedId, verifiedPlayerId }: SectionProps) => {
  const [customMappings, setCustomMappings] = useState<any>([])
  const [fieldsPerSection, setFieldsPerSection] = useState<any>([])
  const { TICKET_SECTION , TICKET_GROUP } = useTicketConstant();
  useEffect(() => {
    if (!fieldMapping) return

    const rightSectionFields = fieldMapping.filter((d: any) => d.ticketSectionId === TICKET_SECTION.Right)
    const sortedRightFields = rightSectionFields.slice().sort((a:any, b:any) => a.fieldOrder - b.fieldOrder);
    setFieldsPerSection(sortedRightFields);
    return () => { }
  }, [fieldMapping])

  useEffect(() => {
    if (!customGrouping || customGrouping.length === 0) return
    setCustomMappings(customGrouping)
    return () => { }
  }, [customGrouping])


  return (
    <div>
      <TicketManagementContainer color={isColored}>
        <div className='d-flex flex-column'>
          <TicketGrouping
            fieldsPerSection={fieldsPerSection}
            dynamicTicketForm={dynamicTicketForm}
            updateDynamicTicket={updateDynamicTicket}
            viewOnly={viewOnly}
            currentTicketId={stateData.ticketId ?? 0}
            stateData={stateData}
            assigneeList={assigneeList}
            showAutoAssign={showAutoAssign}
            autoAssignedId={autoAssignedId}
          />
        </div>
      </TicketManagementContainer>
      <div style={{ padding: '0.5rem' }}></div>
      {customMappings?.find((custom: any) => custom.ticketCustomId === TICKET_GROUP.Player)?.hasAdd && (
        <div>
          <PlayerCustomGroupings isColored={isColored} viewOnly={viewOnly}  verifiedPlayerId={verifiedPlayerId}/>
        </div>
      )}
    </div>
  )
}

export default RightSection