import { useContext, useState } from 'react';
import swal from 'sweetalert';
import {
  getTicketLookUpByFieldId,
  getTicketCustomGroupingByTicketType,
} from '../../services/TicketConfigurationApi';
import useConstant from '../../../../constants/useConstant';
import { LookupModel } from '../../../../shared-models/LookupModel';
import { TicketContext } from '../../context/TicketContext';

export const useTicketConfigurationHooks = () => {
  const { successResponse} = useConstant();
  const [ticketMgmntLookUps, setTicketMgmntLookUps] = useState<LookupModel[]>([])
  const [ticketCustomGroupings, setTicketCustomGroupings] = useState<any>([])
  const { setAllTicketManagementOptions, allLookUpOptions } = useContext(TicketContext);

  const getTicketManagementLookUpsByFieldId = async (fieldId: number) => {    
    try {
      const response: any = await getTicketLookUpByFieldId(fieldId);
      let lookUpOptValue = allLookUpOptions;

      if (response.status === successResponse) {
        setTicketMgmntLookUps(response.data);
      
        if (response.data.length > 0) {
          const isLookUpExist = lookUpOptValue.filter(a => a.fieldId === fieldId)
          if (isLookUpExist.length > 0) {
            lookUpOptValue.map(x => {
              if (x.fieldId === fieldId) {
                x.optionList = response.data
              }
            })
          } else {
            lookUpOptValue.push({
              fieldId: fieldId,
              optionList: response.data
            })
          }
        } else {
          lookUpOptValue.push({
            fieldId: fieldId,
            optionList: response.data
          })
        }

        setAllTicketManagementOptions(lookUpOptValue);
      } else {
        swal('Error', 'No data was found', 'error');
      }
    } catch (ex) {
      swal('Failed', 'Error on fetching data', 'error');
    }
  }


  const getCustomGrouping = async (ticketTypeId: string) => {
    try {
      const response: any = await getTicketCustomGroupingByTicketType(ticketTypeId);
      if (response.status === successResponse) {
        setTicketCustomGroupings(response.data);
      } else {
        swal('Error', 'No Custom Groups found', 'error');
      }
    } catch (ex) {
      swal('Failed', 'Error on fetching data', 'error');
    }
  }

 

  return {
    getTicketManagementLookUpsByFieldId,
    ticketMgmntLookUps,
    getCustomGrouping,
    ticketCustomGroupings
  };
};
