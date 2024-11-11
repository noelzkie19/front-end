import { useState } from 'react'
import { ReviewPeriodListRequestModel } from '../../../models/staffperformance/request/ReviewPeriodListRequestModel'
import { getStaffPerformanceReviewPeriodList, getStaffPerformanceReviewPeriodListResult, upsertReviewPeriod } from '../../../redux/SystemService'
import useConstant from '../../../../../constants/useConstant'
import * as hubConnection from '../../../../../../setup/hub/MessagingHub'
import { HttpStatusCodeEnum } from '../../../../../constants/Constants'
import swal from 'sweetalert'
export const useStaffPerformanceHooks = () => {
  const [reviewPeriodList, setReviewPeriodList] = useState<any>()  
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [postLoading, setPostLoading] = useState<boolean>(false)
  const [getLoading, setGetLoading] = useState<boolean>(false)
  const [successfullUpsert, setSuccessfullUpsert] = useState<boolean>(false)

  const { HubConnected, SwalFailedMessage, SwalServerErrorMessage } = useConstant();
  const getReviewPeriodList = (request: ReviewPeriodListRequestModel) => {
    setIsSuccess(false)
    setGetLoading(true)
    setReviewPeriodList(null)
    setTimeout(() => {
      const messagingHub = hubConnection.createHubConnenction();
      messagingHub.start().then((response) => {
        getStaffPerformanceReviewPeriodList(request).then((response) => {
          if (response.status !== HttpStatusCodeEnum.Ok) {
            messagingHub.stop();
            setGetLoading(false)
            return;
          }

          messagingHub.on(request.queueId.toString(), (message) => {
            getStaffPerformanceReviewPeriodListResult(message.cacheId).then(({ data }) => {
              setReviewPeriodList(data)
              setIsSuccess(true)              
              setGetLoading(false)
              messagingHub.off(request.queueId.toString());
              messagingHub.stop();
            });
          });

          setTimeout(() => {
            if (messagingHub.state === HubConnected) {
              messagingHub.stop();
              setGetLoading(false)
            }
          }, 3000);
        });
      });
    }, 1000);
  }

  const upsertReviewPeriodData = async (request: any) => {
    setPostLoading(false)
    setSuccessfullUpsert(false)
    try {      
      const response = await upsertReviewPeriod(request);
      if (response.data.status === HttpStatusCodeEnum.Ok) {
        swal('Successful!', 'The data has been submitted', 'success');
        setPostLoading(false)
        setSuccessfullUpsert(true)
      } else {
        swal(SwalFailedMessage.title, SwalFailedMessage.textStaffPerformanceReviewPeriodPopUpFailed, SwalFailedMessage.icon);
        setPostLoading(false)
        setSuccessfullUpsert(false)        
      }
    } catch (err) {
      swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
      console.log('Error while starting connection: ' + err);
      setPostLoading(false)
      setSuccessfullUpsert(false)  
    }
  }
  return {
    getLoading,
    postLoading,
    isSuccess,
    reviewPeriodList,
    getReviewPeriodList,
    upsertReviewPeriodData,
    successfullUpsert
  }
}