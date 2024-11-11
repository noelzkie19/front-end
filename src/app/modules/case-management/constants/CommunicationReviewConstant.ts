const useCommunicationReviewConstant = () => {

    const ACTION_MODE = {
        Create: 1,
        View: 2
    };

    const EVENT_TYPES = {
        ClickMarkAsRead: 345
    };

    const ACTION_LABELS = {
        MarkAsRead: 'Mark As Read',
        Read: 'Read',
        StartReview: 'Start Review',
        CancelReview: 'Cancel Review',
        Submit: 'Submit',
        Draft: 'Draft',
        Loading: 'Please wait...',
    }

    const MEASUREMENT_TYPE = {
        main: 347,
        miscellaneous: 348
    }
    
    const TOOLTIPS = {
        MarkAsReadText: 'Mark as Read Count'
    }

    const REVIEW_STATUS = {
        notReviewed: {id: 343, description: 'Not Reviewed'},
        reviewed: {id: 342, description: 'Reviewed'}
    }

    const FIELD_LABELS = {
        TotalScore: 'Total Score'
    }

    return {
        ACTION_MODE,
        EVENT_TYPES,
        ACTION_LABELS,
        MEASUREMENT_TYPE,
        TOOLTIPS,
        REVIEW_STATUS,
        FIELD_LABELS
    };
}
export default useCommunicationReviewConstant;
