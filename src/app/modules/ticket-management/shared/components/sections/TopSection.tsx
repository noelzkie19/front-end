import { useState, useEffect, useContext } from 'react'
import { Col, Row } from 'react-bootstrap-v5'
import TicketManagementContainer from '../TicketManagementContainer'
import { TicketTypeResponseModel } from '../../../models/ticket-config/TicketTypeResponseModel'
import { FieldMappingResponseModel } from '../../../models/ticket-config/FieldMappingResponseModel'
import { LookupModel } from '../../../../../shared-models/LookupModel'
import SelectFilter from '../../../../relationship-management/shared/components/SelectFilter'
import { TicketInfoModel } from '../../../models/TicketInfoModel'
import useTicketConstant from '../../../constants/TicketConstant'
import { DynamicFormField } from '../DynamicFormField'
import { TicketContext } from '../../../context/TicketContext'


interface SectionProps {
  isColored?: string
  ticketTypeOption?: TicketTypeResponseModel[]
  onChangeTicketType: any
  fieldMapping?: FieldMappingResponseModel[]
  selectedTicket?: LookupModel 
  dynamicTicketForm?: any
  updateDynamicTicket?: any
  viewOnly?: boolean
  stateData: TicketInfoModel,
  stateChange?: any
  recordCurrentStatus?: any
}

const TopSection = ({ isColored = "transparent", ticketTypeOption = [], onChangeTicketType, fieldMapping, selectedTicket, dynamicTicketForm, updateDynamicTicket, viewOnly , stateData , stateChange, recordCurrentStatus}: SectionProps) => {
  const [ticketTypeOptionList, setTicketTypeOptionList] = useState<LookupModel[]>([])
  const [fieldsPerSection, setFieldsPerSection] = useState<any>([])
  const { TICKET_SECTION  } = useTicketConstant();
  const { ticketInformation , ticketConfigTypes  } = useContext(TicketContext);
  const [selectedValue, setSelectedValue] = useState<LookupModel>()

  useEffect(() => {
    if (ticketConfigTypes.length < 1) return
    const ticketTypeLookUp = ticketConfigTypes.reduce((acc: any, curr: any) => {
      acc.push({ value: curr.ticketId, label: curr.ticketName })
      return acc
    }, [])
    setTicketTypeOptionList(ticketTypeLookUp)
    return () => {

    }
  }, [ticketConfigTypes])

  useEffect(() => {
    if(ticketInformation.ticketId > 0 && ticketTypeOptionList.length > 0) {
      const lookupValue = ticketTypeOptionList.find((d: any) => d.value === ticketInformation.ticketTypeId)
      setSelectedValue(lookupValue)
    }
  },[ticketInformation, ticketTypeOptionList])

  useEffect(() => {
    if (fieldMapping && fieldMapping.length > 0) {
      const topSectionFields = fieldMapping.filter((d: any) => d.ticketSectionId === TICKET_SECTION.Top)
      const sortedTopFields = topSectionFields.slice().sort((a:any, b:any) => a.fieldOrder - b.fieldOrder);
      setFieldsPerSection(sortedTopFields);
      return () => {
      }
    }
  }, [fieldMapping])

  const changeTicketType = (ticketType: LookupModel) => {
    onChangeTicketType(ticketType)
  } 

  return (
    <>   
    {(ticketTypeOptionList.length > 0) && (
      <TicketManagementContainer color={isColored}>
        <div className='p-4'>
          <Col sm={12}>
            <p className='fw-bolder'>Information</p>
          </Col>
          <div className='container p-0'>
              <Row>
                {ticketInformation.ticketId === 0 &&ticketTypeOptionList.length > 0 ? <div style={{ paddingRight: '1rem' }} className='col-lg-3 col-md-4 col-sm-4'>
                    <div className={`col-form-label col-sm required`}>Ticket Type</div>
                    <SelectFilter
                      isMulti={false}
                      options={ticketTypeOptionList}
                      isRequired={true}
                      label=''
                      onChange={(ticketType: LookupModel) => {
                        changeTicketType(ticketType)
                      }}
                      value={selectedValue}
                      isDisabled={!!ticketInformation.ticketTypeId || !!selectedTicket}
                    /> 
                  </div> : null}
                
                
                  {fieldsPerSection ? fieldsPerSection.map((field: any, index: number) => {
                    let idx = index
                    return (
                      <DynamicFormField
                        key={idx}
                        field={field}
                        dynamicTicketForm={dynamicTicketForm}
                        updateDynamicTicket={updateDynamicTicket}
                        viewOnly={viewOnly}
                        currentTicketId={stateData.ticketId ?? 0}
                        recordCurrentStatus={recordCurrentStatus}
                      />
                    )
                  }) : null}
                </Row>
          </div>
        </div>
      </TicketManagementContainer>
      )}
    </>
  )
}

export default TopSection