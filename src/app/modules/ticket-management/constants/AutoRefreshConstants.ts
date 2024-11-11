const useAutoRefreshConstants = () => {
    const AUTO_REFRESH_OPTION: Array<any> = [
        {
            value: 300000,
            label: "5 minutes"
        },
        {
            value: 600000,
            label: "10 minutes"
        },
        {
            value: 1800000,
            label: "30 minutes"
        },
        {
            value: 3600000,
            label: "1 hour"
        }
    ]

    return {
        AUTO_REFRESH_OPTION
    }
}

export default useAutoRefreshConstants;