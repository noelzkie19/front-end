import { useState, useEffect } from 'react'
import { FieldMappingResponseModel } from '../../../models/ticket-config/FieldMappingResponseModel'
import { DynamicTicketModel } from '../../../models/ticket-config/DynamicTicketModel'
import TicketGrouping from '../TicketGrouping'
import useTicketConstant from '../../../constants/TicketConstant'
import TicketManagementContainer from '../TicketManagementContainer'
import { TicketInfoModel } from '../../../models/TicketInfoModel'

interface SectionProps {
  isColored?: string
  fieldMapping?: FieldMappingResponseModel[]
  handleTextInputSearching?: any
  dynamicTicketForm?: DynamicTicketModel[]
  updateDynamicTicket?: any
  viewOnly?: boolean
  stateData: TicketInfoModel,
  updateTextInputSearchValidation?: any,
  superSedeFields?: any
}

const LeftSection = ({ isColored = "transparent", fieldMapping, handleTextInputSearching, dynamicTicketForm, updateDynamicTicket,  viewOnly, stateData, updateTextInputSearchValidation, superSedeFields}: SectionProps) => {
  const [fieldsPerSection, setFieldsPerSection] = useState<any>([])
  const { TICKET_SECTION  } = useTicketConstant();

  useEffect(() => {
    if (!fieldMapping) return
    const leftSectionFields = fieldMapping.filter((d: any) => d.ticketSectionId === TICKET_SECTION.Left)
    const sortedLeftFields = leftSectionFields.slice().sort((a:any, b:any) => a.fieldOrder - b.fieldOrder);
    setFieldsPerSection(sortedLeftFields);
   
    return () => {
    }
  }, [fieldMapping])

  return (
    <>
      <TicketManagementContainer color={isColored}>
        <TicketGrouping
              fieldsPerSection={fieldsPerSection}
              dynamicTicketForm={dynamicTicketForm}
              updateDynamicTicket={updateDynamicTicket}
              viewOnly={viewOnly}
              handleTextInputSearching={handleTextInputSearching}
              currentTicketId={stateData.ticketId ?? 0}
              updateTextInputSearchValidation={updateTextInputSearchValidation}
              stateData={stateData}
              superSedeFields={superSedeFields}
            />
      </TicketManagementContainer>
      <div style={{ padding: '0.5rem' }}></div>
    </>
  )
}

export default LeftSection
