export default function useCaseManagementConstant() {

 let pageActions = {
    createCase : "CreateCustomerServiceCase",
    editCase : "EditCustomerServiceCase",
    addCommunication: "AddCommunicationCustomerService",
    editCommunication: "EditCommunicationCustomerService"
 }

 let postDateFormat = 'MM/D/yyyy HH:mm';
 let pcsOptions = [{label : 'Filled ',value: 'Filled '},{label : 'Not Filled',value: 'Not Filled'}, {label : 'All',value: 'All'} ]

 let flyFoneStatus = {
   successCallResultCode : 1
 }

 let hooksMessages = {
    getAllCampaignErrorMessage: 'Problem in getting campaign names list',
    getActionOptionsErrorMessage: 'Problem in getting PCS Communication ProviderOption list',
    getAllActiveCampaignErrorMessage: 'Problem in getting Active Campaign Name List',
    problemConnectingToServerErrorMessage: 'Problem connecting to the server, Please refresh'
 }

  return {pageActions, postDateFormat, pcsOptions, flyFoneStatus, hooksMessages}
}
