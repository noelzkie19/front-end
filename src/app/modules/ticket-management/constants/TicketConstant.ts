const useTicketConstant = () => {
    const TICKET_SECTION = {
        Top: 4,
        Left: 2,
        Right: 3,
        Bottom: 5
    }

    const TICKET_FIELD = {
        TicketType: 1,
        StatusId: 2, // status field id
        PaymentMethodId: 26,
        AdjustmentAmount: 55,
        Assignee: 6,
        Summary: 5,
        PaymentSystemTransactionId: 25,
        PlatformTransactionId: 23,
        AuditTrail: [63, 60, 61, 62], // fieldId of audit trails
        WagerMultiplier: 64,
        Reason: 65,
        AdjustmentBusinessReasonType: 66,
        Remarks: 42,
        PlatformStatusId: 58,
        PaymentSystemTransactionStatusId: 56,
        CurrencyMethod: 27,
        VendorTransactionStatus: 68,
        Department: 69,
        MissingAmount: 32,
        TransactionAmount: 28,
        MissingType: 31,
        TicketResult: 46,
        CancelReasonMW: 70,
        PendingReason: 45,
        CancelReasonMD: 59,
        PaymentProcessor: 73
    }

    const WITHDRAWAL_MISSING_TYPE = {
        Partial: "33",
        Full: "34"
    }

    const TICKET_GROUP = {
        Config: {
            DefaultColumn: 1
        },
        Detail: 12,
        Information: 11,
        Attachment: 15,
        Comment: 16,
        Player: 19
    }

    const ATTACHMENT_TYPE = {
        Attachment: 59,
        Link: 60
    }

    const BOTTOM_TAB = {
        Comment: "1",
        History: "2",
        PlayerList: "3"
    }

    const MESSAGE = {
        LeaveConfirmation: 'Are you sure you want to leave?'
    }

    const FMBO_TYPE = {
        Deposit: 1,
        Withdrawal: 2
    }
    const VENDOR_TRANSACITON_STATUS_TYPE = {
        VendorReceivedTheFund: "31",
        VendorDidNotConfirmToReceiveTheFUnd: "32"
    }
    const TICKET_TYPE = {
        MissingDeposit: 3,
        MissingWithdrawal:4,
        Issue: 2,
        Task:1
    }

    const TICKET_COMPONENT= {
        Add: 1,
        Edit: 2,
        View: 3,
        Search: 4
    }
    
    const TICKET_STATUSES = {
        ForAdjustment: 38,
        ForPlayerVerification: 46,
        VerificationComplete: 37,
        ForCrediting: 39,
        ForFmVerification: 33,
        ForSmVerification: 34,
        Cancelled: 35,
        Pending: 36,
        Done: 49,
        ForInternalTransfer: 44,
        ForVendorPayout: 45,
        Declined: 42,
        Reopen: 50,
        AdjustmentApproved: 40
    }

    const TRANSACTION_TAG = {
        ICORE: 'ICORE',
        FMBO: 'FMBO'
    }

    const WAGER_MULTIPLIER = {
        WagerMultiplierTag: 1
    }

    const HOLD_WITHDRAWAL = {
        Key: "HoldWithdrawal",
        Value: "true"
    }

    const TRANSACTION_STATUSES = {
        FMBO: {
            REJECT: 2,
            PROCESSED: 1
        },
        ICORE: {
            PENDING: 10,
            DECLINED: 7,
            APPROVED: 1
        }
    }

    const LOWER_THRESHOLD_REASON = {
        SYSTEM_ERROR: 13,
        MISSING_WITHDRAWAL: 26
    }

    const MLAB_TRANSACTION_STATUS = {
        Pending: 10,
        Approved: 1
    }
    const TICKET_TYPE_STATUS = {
        Draft: 'Draft',
        Published:'Published'
    }

    const DEPARTMENT = {
        MLAB: 63,
        CS: 64,
        FM: 65,
        SM: 66
    }

    return {
        TICKET_SECTION,
        TICKET_FIELD,
        TICKET_GROUP,
        ATTACHMENT_TYPE,
        BOTTOM_TAB,
        MESSAGE,
        FMBO_TYPE,
        TICKET_TYPE,
        TICKET_COMPONENT,
        TICKET_STATUSES,
        TRANSACTION_TAG,
        WAGER_MULTIPLIER,
        HOLD_WITHDRAWAL,
        TRANSACTION_STATUSES,
        LOWER_THRESHOLD_REASON,
        MLAB_TRANSACTION_STATUS,
        TICKET_TYPE_STATUS,
        VENDOR_TRANSACITON_STATUS_TYPE,
        DEPARTMENT,
        WITHDRAWAL_MISSING_TYPE
    };
}

export default useTicketConstant;