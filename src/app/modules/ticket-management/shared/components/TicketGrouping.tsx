import React, { useContext, useEffect, useState } from "react";
import {Col, Row} from "react-bootstrap-v5";
import useTicketConstant from "../../constants/TicketConstant";
import { TicketInfoModel } from "../../models/TicketInfoModel";
import { GroupingConfigurationModel } from "../../models/ticket-config/GroupingConfigurationModel";
import TicketGroupRendering from "./TicketGroupRendering";
import { TicketContext } from "../../context/TicketContext";

interface GroupProps {
  fieldsPerSection?: any[],
  triggerEvent?: any,
  dynamicTicketForm: any,
  updateDynamicTicket: any,
  viewOnly: any,
  handleTextInputSearching?: any
  currentTicketId: number
  updateTextInputSearchValidation?: any
  stateData?: TicketInfoModel
  assigneeList?: any,
  showAutoAssign?: boolean
  recordCurrentStatus?: any
  autoAssignedId?: number
  superSedeFields?: any
}

const TicketGrouping = ({ fieldsPerSection, triggerEvent, dynamicTicketForm, updateDynamicTicket, viewOnly, handleTextInputSearching, currentTicketId, updateTextInputSearchValidation, stateData, assigneeList, showAutoAssign = false, recordCurrentStatus, autoAssignedId, superSedeFields = []}: GroupProps) => {
  const [ticketGroup, setTicketGroup] = useState<any>([])
  const { TICKET_GROUP } = useTicketConstant()
  const { ticketGroupingConfig } = useContext(TicketContext)

  const getDistinctGroups = () => {
    return fieldsPerSection?.reduce((acc: any, current: any) => {
      const { ticketGroupId, ticketGroupName } = current;
      if (!acc.some((item: any) => item.ticketGroupId === ticketGroupId && item.ticketGroupName === ticketGroupName)) {
        acc.push({ ticketGroupId, ticketGroupName });
      }
      return acc;
    }, []).sort((a: any, b: any) => a.groupOrder - b.groupOrder);
  };

  useEffect(() => {
    if (!fieldsPerSection) return;
    console.log(fieldsPerSection);
    const group = getDistinctGroups() ?? [];
    setTicketGroup(group);
  }, [fieldsPerSection])

  return (
    <>
      {ticketGroup ? ticketGroup.map((group: any, index: number) => {
        let idx = index
        return (
          <div className='p-4' key={idx}>
            {group.ticketGroupId !== TICKET_GROUP.Information &&
              <>
                <Col sm={12}>
                  <p className='fw-bolder'>{group.ticketGroupName}</p>
                </Col>
                <Row className="ticket-left-dynamic-fields">
                  <TicketGroupRendering
                    group={group}
                    fieldsPerGroup={fieldsPerSection?.filter((d: any) => d.ticketGroupId === group.ticketGroupId) ?? []}
                    dynamicTicketForm={dynamicTicketForm}
                    columnConfiguration={ticketGroupingConfig?.find((grouping: GroupingConfigurationModel) => grouping.groupId === group?.ticketGroupId)?.columnCount ?? TICKET_GROUP.Config.DefaultColumn}                    
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
                    superSedeFields={superSedeFields}
                  />
                </Row>
              </>
            }

          </div>
        )

      }) : null}

    </>
  )
}

export default TicketGrouping;



