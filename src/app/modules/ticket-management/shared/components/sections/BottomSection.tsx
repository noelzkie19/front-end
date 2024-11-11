import useTicketConstant from '../../../constants/TicketConstant';
import {TicketInfoModel} from '../../../models/TicketInfoModel';
import TicketManagementContainer from '../TicketManagementContainer';
import AttachmentGroupings from '../groups/custom-groupings/AttachmentGroupings';
import DynamicTab from '../DynamicTab';

interface SectionProps {
	isColored?: any;
	stateData: TicketInfoModel;
	stateChange?: any;
	customGrouping?: any[];
	userId?: any;
	displayComment: any;
	viewOnly?: any;
	refreshComment?: boolean;
	refreshTicketComment?: any;
}

const BottomSection = ({ isColored, stateData, stateChange, customGrouping, userId, displayComment , viewOnly , refreshComment , refreshTicketComment }: SectionProps) => {
  const { TICKET_GROUP } = useTicketConstant()
  return (
    <TicketManagementContainer color={isColored}>
      {customGrouping?.find((custom: any) => custom.ticketCustomId === TICKET_GROUP.Attachment)?.hasAdd && (
        <AttachmentGroupings
          viewOnly={viewOnly}
          stateData={stateData}
          stateChange={stateChange}
          userId={userId}
        />
      )}
      {displayComment && <div style={{ padding: '0.5rem' }}></div>}
      {displayComment && <DynamicTab refreshComment = {refreshComment} refreshTicketComment={refreshTicketComment}/>}
    </TicketManagementContainer>
  );
}

export default BottomSection;
