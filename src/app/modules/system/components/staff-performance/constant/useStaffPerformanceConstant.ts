const useStaffPerformanceConstant = () => {
    const MODAL_HEADERS = {
        ReviewPeriod: {
            Add: 'Add Review Period',
            Edit: 'Edit Review Period'
        }
    }

    const DEFAULT_PAGE_CONFIG = {
      SortColumn: "Position",
      SortOrder: "ASC"
    }

    const STAFF_PERFORMANCE_MODULE = {
      ReviewPeriod: {
        Id: 405,
        Header: 'Search Communication Review Period',
        DefaultSortColumn: "CommunicationReviewPeriodId",
        DefaultSortOrder: "DESC",
        DefaultPageStart: 1,
        DefaultPageTotal: 0,
        SortingOrder: ["ASC", "DESC"],
        ConfirmToggleStatus: (updatedStatus: string) : string => {
          return `This action will change the record status to ${updatedStatus}. Please confirm`          
        },
      }
    }

  return {
    MODAL_HEADERS,
    DEFAULT_PAGE_CONFIG,
    STAFF_PERFORMANCE_MODULE
  };
}

export default useStaffPerformanceConstant;