import { useContext, useEffect } from 'react'
import { enableSplashScreen } from '../../../../utils/helper'
import useTicketConstant from '../../constants/TicketConstant'
import { TicketContext } from '../../context/TicketContext'
const useTicketSharedEffectHooks = (
  getTicketSummary : any
) => {

  const { TICKET_FIELD } = useTicketConstant();
  const { ticketInformation } = useContext(TicketContext);
  useEffect(() => {
    enableSplashScreen();
    return () => { }
  }, [])

  useEffect(() => {  
    if (!(ticketInformation.ticketTypeId)) {
      getTicketSummary(null)
      return
    } 

    getTicketSummary(ticketInformation?.ticketDetails?.find((detail: any) => detail.ticketFieldId === TICKET_FIELD.Summary)?.ticketTypeFieldMappingValue ?? '')
    return () => { }
  }, [ticketInformation])
}

export default useTicketSharedEffectHooks