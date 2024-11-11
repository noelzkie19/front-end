import { useState, useEffect, useContext } from 'react'
import useTicketConstant from '../../constants/TicketConstant'
import { GroupingLayoutMultipleColumns } from '../../utils/helper'
import { DynamicFormField } from './DynamicFormField'
import { Col } from 'react-bootstrap-v5'
import { TicketContext } from '../../context/TicketContext'

const TicketGroupRendering = ({ group, fieldsPerGroup, dynamicTicketForm, columnConfiguration = 1, triggerEvent, updateDynamicTicket, viewOnly, handleTextInputSearching, currentTicketId, updateTextInputSearchValidation, stateData, assigneeList, showAutoAssign = false, recordCurrentStatus, autoAssignedId, superSedeFields = [] }: any) => {
  const [groupLayout, setGroupLayout] = useState<any>([])
  const { TICKET_GROUP } = useTicketConstant();
  const {ticketInformation} = useContext(TicketContext)

  useEffect(() => {
    TICKET_GROUP.Config.DefaultColumn === columnConfiguration ? setGroupLayout(fieldsPerGroup) : setGroupLayout(GroupingLayoutMultipleColumns(fieldsPerGroup, columnConfiguration, superSedeFields, ticketInformation.ticketId))
    return () => { }
  }, [superSedeFields])

  return (
    <>
      {groupLayout ? groupLayout.map((data: any, index: number) => {
        let idx = index;
        return (
          TICKET_GROUP.Config.DefaultColumn === columnConfiguration ? (
            <DynamicFormField
              key={idx}
              field={data}
              triggerEvent={triggerEvent}
              dynamicTicketForm={dynamicTicketForm}
              updateDynamicTicket={updateDynamicTicket}
              handleTextInputSearching={handleTextInputSearching}
              viewOnly={viewOnly}
              currentTicketId={currentTicketId}
              updateTextInputSearchValidation={updateTextInputSearchValidation}
              stateData={stateData}
              assigneeList={assigneeList}
              showAutoAssign={showAutoAssign}
              recordCurrentStatus={recordCurrentStatus}
              autoAssignedId={autoAssignedId}
              defaultSize={TICKET_GROUP.Config.DefaultColumn !== columnConfiguration}
              fromModal={false}
            />
          ) : (
            <Col key={idx}>
              {data.map((rows: any, idx: number) => {
                let rowIndex = idx;
                return (
                  <DynamicFormField
                    key={rowIndex}
                    field={rows}
                    triggerEvent={triggerEvent}
                    dynamicTicketForm={dynamicTicketForm}
                    updateDynamicTicket={updateDynamicTicket}
                    handleTextInputSearching={handleTextInputSearching}
                    viewOnly={viewOnly}
                    currentTicketId={currentTicketId}
                    updateTextInputSearchValidation={updateTextInputSearchValidation}
                    stateData={stateData}
                    assigneeList={assigneeList}
                    showAutoAssign={showAutoAssign}
                    recordCurrentStatus={recordCurrentStatus}
                    autoAssignedId={autoAssignedId}
                    defaultSize={true}
                    fromModal={false}
                  />
                );
              })}
            </Col>
          )
        );
      }) : null}
    </>
  )
}

export default TicketGroupRendering
