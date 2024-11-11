import React, { useMemo, useState } from "react";
import { ReviewPeriodListModel, REVIEW_PERIOD_LIST_DEFAULT } from "../../../models/staffperformance/response/ReviewPeriodListResponseModel";
import { StaffPerformanceInformationModel, STAFF_PERFORMANCE_INFO_DEFAULT } from "../../../models/staffperformance/response/StaffPerformanceInformationModel";
import { STAFF_PERFORMANCE_SETTING_LIST_DEFAULT, StaffPerformaneSettingResponseModel } from "../../../models/staffperformance/response/StaffPerformanceSettingResponseModel";
import { useAsyncFn } from "react-use";
import useConstant from "../../../../../constants/useConstant";
import { getStaffPermormanceSettingList, getStaffPerformanceInfo } from "../../../redux/SystemService";
import swal from "sweetalert";
interface IProps {
  selectedReviewPeriod: ReviewPeriodListModel,
  setSelectedReviewPeriod: React.Dispatch<React.SetStateAction<ReviewPeriodListModel>>;
  staffPerformanceHeader: StaffPerformanceInformationModel
  setStaffPerformanceHeader: React.Dispatch<React.SetStateAction<StaffPerformanceInformationModel>>;
  getStaffPerformanceInfoAsync: (...args: any) => Promise<void>,
  fetchingStaffPerformanceInfo: boolean,
  getStaffPermormanceSettingListAsync: (...args: any) => Promise<void>,
  fetchingStaffPerformanceSettingList: boolean,
  staffPerformanceSettingData: StaffPerformaneSettingResponseModel
}

export const StaffPerformanceContext = React.createContext<IProps>({
  selectedReviewPeriod: REVIEW_PERIOD_LIST_DEFAULT,
  setSelectedReviewPeriod: () => { },
  staffPerformanceHeader: STAFF_PERFORMANCE_INFO_DEFAULT,
  setStaffPerformanceHeader: () => { },
  getStaffPerformanceInfoAsync: async (...args: any) => { },
  fetchingStaffPerformanceInfo: false,
  getStaffPermormanceSettingListAsync: async (...args: any) => { },
  fetchingStaffPerformanceSettingList: false,
  staffPerformanceSettingData: STAFF_PERFORMANCE_SETTING_LIST_DEFAULT
})

export const StaffPerformanceContextProvider: React.FC = ({ children }) => {
  const [selectedReviewPeriod, setSelectedReviewPeriod] = useState<ReviewPeriodListModel>(REVIEW_PERIOD_LIST_DEFAULT);
  const [staffPerformanceHeader, setStaffPerformanceHeader] = useState<StaffPerformanceInformationModel>(STAFF_PERFORMANCE_INFO_DEFAULT)
  const { successResponse, SwalServerErrorMessage , SwalFailedMessage, TicketManagementConstants } = useConstant();
  const [staffPerformanceSettingData, setStaffPerformanceSettingData] = useState<StaffPerformaneSettingResponseModel>(STAFF_PERFORMANCE_SETTING_LIST_DEFAULT);


  const [{ loading: fetchingStaffPerformanceSettingList }, getStaffPermormanceSettingListAsync] = useAsyncFn(async (...args) => {
    try {
      const [keyword] = args;
      const response: any = await getStaffPermormanceSettingList(keyword);
      if (response.status === successResponse) {
        setStaffPerformanceSettingData(response.data);
      }
    } catch (ex) {
      swal(SwalFailedMessage.title, TicketManagementConstants.Error, SwalServerErrorMessage.icon);
    }
  }, [setStaffPerformanceSettingData])

  const [{ loading: fetchingStaffPerformanceInfo }, getStaffPerformanceInfoAsync] = useAsyncFn(async (...args) => {    
    try {      
      const [keyword] = args;
      const response: any = await getStaffPerformanceInfo(keyword);
      if (response.status === successResponse) {
        setStaffPerformanceHeader(response.data);
      }
    } catch (ex) {
      swal(SwalFailedMessage.title, TicketManagementConstants.Error, SwalServerErrorMessage.icon);
    }
  }, [setStaffPerformanceHeader])

  const value: IProps = useMemo(() => {
    return {
      selectedReviewPeriod,
      setSelectedReviewPeriod,
      staffPerformanceHeader,
      setStaffPerformanceHeader,
      getStaffPerformanceInfoAsync,
      fetchingStaffPerformanceInfo,
      getStaffPermormanceSettingListAsync,
      fetchingStaffPerformanceSettingList,
      staffPerformanceSettingData
    }
  }, [
    selectedReviewPeriod,
    setSelectedReviewPeriod,
    staffPerformanceHeader,
    setStaffPerformanceHeader,
    getStaffPerformanceInfoAsync,
    fetchingStaffPerformanceInfo,
    getStaffPermormanceSettingListAsync,
    fetchingStaffPerformanceSettingList,
    staffPerformanceSettingData
  ])
  return <StaffPerformanceContext.Provider value={value}>{children}</StaffPerformanceContext.Provider>
}