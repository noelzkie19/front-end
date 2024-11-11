import {faComments, faPhoneSquare} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import FileSaver from 'file-saver';
import {useFormik} from 'formik';
import {useEffect, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import * as XLSX from "xlsx";
import * as Yup from 'yup';
import {RootState} from '../../../../setup';
import {LookupModel} from "../../../common/model/LookupModel";
import {AccordionHeaderType, ElementStyle, HttpStatusCodeEnum} from '../../../constants/Constants';
import {FilterAccordion, FormContainer, FormGroupContainer, MlabButton, NumberTextInput, SearchTextInput} from '../../../custom-components';
import DefaultDateRangePicker from '../../../custom-components/date-range-pickers/DefaultDateRangePicker';
import CommonLookups from '../../../custom-functions/CommonLookups';
import {formatDate} from '../../../custom-functions/helper/dateHelper';
import {USER_CLAIMS} from '../../../modules/user-management/components/constants/UserClaims';
import {disableSplashScreen} from '../../../utils/helper';
import {getAllCampaignsList, getCampaignAgentsList, getMessageStatusResponseList} from '../../campaign-agent-workspace/redux/AgentWorkspaceService';
import {getCallListValidationFilter, getCallValidationList} from '../../campaign-call-list-validation/redux/CallListValidationService';
import {getAllCampaignType} from '../../campaign-management/redux/CampaignManagementService';
import {CallValidationFilterRequestModel} from '../models/request/CallValidationFilterRequestModel';
import {CallValidationListRequestModel} from '../models/request/CallValidationListRequestModel';
import {CallValidationFilterResponseModel} from '../models/response/CallValidationFilterResponseModel';
import {CallValidationListResponseModel} from '../models/response/CallValidationListResponseModel';
import {LeaderValidationsResponseModel} from '../models/response/LeaderValidationsResponseModel';
import * as callListValidationMgt from '../redux/CallListValidationRedux';

const initialValues = {
    fTDStartAmount: undefined,
    fTDEndAmount: undefined,
    primaryGoalCount: undefined,
    primaryGoalAmount: undefined,
    callListNotes: '',
    mobileNumber: '',
    callEvaluationStartPoint: undefined,
    callEvaluationEndPoint: undefined,
    callEvaluationNotes: '',
    agentValidationNotes: '',
    leaderValidationNotes: ''
}

const callValidationFilterSchema = Yup.object().shape({
    fTDStartAmount: Yup.number(),
    fTDEndAmount: Yup.number(),
    primaryGoalCount: Yup.number(),
    primaryGoalAmount: Yup.number(),
    callListNotes: Yup.string(),
    mobileNumber: Yup.string(),
    callEvaluationStartPoint: Yup.number(),
    callEvaluationEndPoint: Yup.number(),
    callEvaluationNotes: Yup.string(),
    agentValidationNotes: Yup.string(),
    leaderValidationNotes: Yup.string(),
})

const CallListValidationFilters: React.FC = () => {

    const dispatch = useDispatch()
    const [isFilterLoading, setIsFilterLoading] = useState(false)
    const [isExportLoading, setIsExportLoading] = useState(false)
    const [recordCount, setRecordCount] = useState<number>(0)
    const userId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number
    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string
    const [formikValues, setFormikValues] = useState<any>()
    const [requestFilter, setRequestFilter] = useState<CallValidationListRequestModel>()

    // Dropdown Options
    const [campaignTypeOptions, setCampaignTypeOptions] = useState<Array<LookupModel>>([])
    const [campaignNames, setCampaignNames] = useState<Array<LookupModel>>([])
    const [playerIds, setPlayerIds] = useState<Array<LookupModel>>([])    
    const [usernames, setUsernames] = useState<Array<LookupModel>>([])
    const [mesageStatusAndResponses, setMesageStatusAndResponses] = useState<Array<LookupModel>>([])
    const [agentNames, setAgentNames] = useState<Array<LookupModel>>([])
    const [leaderJustificationSettings, setLeaderJustificationSettings] = useState<Array<LookupModel>>([])
    const [messageStatusResponseOptions, setMessageStatusResponseOptions] = useState<Array<LookupModel>>([])

    // Filter Value
    const [selectedPlayerIds, setSelectedPlayerIds] = useState<Array<LookupModel>|null>([])
    const [selectedCampaign, setSelectedCampaign] = useState<LookupModel|null>(null)
    const [selectedCampaignTypeId, setSelectedCampaignTypeId] = useState<LookupModel|null>(null)
    const [selectedPrimaryGoalReached, setSelectedPrimaryGoalReached] = useState<Array<LookupModel>|null>([])
    const [selectedUsernames, setSelectedUsernames] = useState<Array<any>|null>([])
    const [selectedStatuses, setSelectedStatuses] = useState<Array<any>|null>([])
    const [selectedCurrencies, setSelectedCurrencies] = useState<Array<any>|null>([])
    const [selectedDeposited, setSelectedDeposited] = useState<Array<any>|null>([])
    const [selectedMessageStatusAndResponses, setSelectedMessageStatusAndResponses] = useState<Array<any>|null>([])
    const [selectedAgentnames, setSelectedAgentnames] = useState<Array<any>|null>([])
    const [selectedSystemValidations, setSelectedSystemValidations] = useState<Array<any>|null>([])
    const [selectedAgentValidations, setSelectedAgentValidations] = useState<Array<any>|null>([])
    const [selectedLeaderValidations, setSelectedLeaderValidations] = useState<Array<any>|null>([])
    const [selectedLeaderValidationDetails, setselectedLeaderValidationDetails] = useState<Array<LeaderValidationsResponseModel>>([])    
    const [selectedLeaderJustifications, setSelectedLeaderJustifications] = useState<Array<any>|null>([])
    const [selectedHighDepositAmounts, setSelectedHighDepositAmounts] = useState<Array<any>|null>([])
    const [filterTaggedDate, setFilterTaggedDate] = useState<any>()
    const [filterRegistrationDate, setFilterRegistrationDate] = useState<any>()
    const [filterFTDDate, setFilterFTDDate] = useState<any>()
    const [filterCallCaseCreatedDate, setFilterCallCaseCreatedDate] = useState<any>()
    const [filterMessageStatusReponse, setFilterMessageStatusResponse] = useState([])

    // Filter Value Date Ranges
    const [filterRegistrationStartDate, setFilterRegistrationStartDate] = useState<string|null>(null)
    const [filterRegistrationEndDate, setFilterRegistrationEndDate] = useState<string|null>(null)
    const [filterFTDStartDate, setFilterFTDStartDate] = useState<string|null>(null)
    const [filterFTDEndDate, setFilterFTDEndDate] = useState<string|null>(null)
    const [filterTaggedStartDate, setFilterTaggedStartDate] = useState<string|null>(null)
    const [filterTaggedEndDate, setFilterTaggedEndDate] = useState<string|null>(null)
    const [filterCallCaseCreatedStartDate, setFilterCallCaseCreatedStartDate] = useState<string|null>(null)
    const [filterCallCaseCreatedEndDate, setFilterCallCaseCreatedEndDate] = useState<string|null>(null)

    // SO
    const [isAgentDropdownOptionDisabled, setIsAgentDropdownOptionDisabled] = useState<boolean>(false)

    // Redux
    const loading = useSelector<RootState>(({ callList }) => callList.loading, shallowEqual) as boolean
    const loadList = useSelector<RootState>(({ callList }) => callList.loadList, shallowEqual) as string
    const filterResponseState = useSelector<RootState>(({ callList }) => callList.filterResponse, shallowEqual) as CallValidationListResponseModel
    const pageSize = useSelector<RootState>(({ callList }) => callList.pageSize, shallowEqual) as number
    const currentPage = useSelector<RootState>(({ callList }) => callList.currentPage, shallowEqual) as number
    const sortColumn = useSelector<RootState>(({ callList }) => callList.sortColumn, shallowEqual) as string
    const sortOrder = useSelector<RootState>(({ callList }) => callList.sortOrder, shallowEqual) as string    

    const formik = useFormik({
        initialValues,
        validationSchema: callValidationFilterSchema,
        onSubmit: async (values, { setStatus, setSubmitting, resetForm }) => {
            
            if(selectedCampaign == null){
                swal("Failed", "Please select Campaign name", "error");
                return;
            }

            setFormikValues(values)
            dispatch(callListValidationMgt.actions.setSortColumn('CampaignPlayerId'))
            dispatch(callListValidationMgt.actions.setSortOrder('ASC'))
            dispatch(callListValidationMgt.actions.setCurrentPage(1))
            loadCampaignPlayers(values)

        },
        onReset: async()=>{
             handleReset()
        }
    })   

    const onExportToCsv = async () =>{
        
        setIsExportLoading(true)

        var request : any = requestFilter as CallValidationListRequestModel;
        if(request != null){

            request.offsetValue = 0;
            request.pageSize = filterResponseState.recordCount;
            
            await getCallValidationList(request)
                .then((response) => {

                    let resultData = Object.assign({}, response.data as CallValidationListResponseModel);
                    let returnedData = mapCallListValidationToCSV(resultData);
                    JSONToCSVConvertor((returnedData), 'Call List Validation', true)

                }).catch((ex) => {
                    console.log('ERROR Agent Workspace Search: ', ex)
                })

        }

        setIsExportLoading(false)
        
    }

    const JSONToCSVConvertor = (FilterData: any,ReportTitle: string, _ShowLabel: boolean) => {
        let CSV = "";
        const fileType = "text/csv; charset=utf-18"
        const fileExtension = ".csv"
    
        const filterData = XLSX.utils.json_to_sheet(FilterData)
        CSV +=  XLSX.utils.sheet_to_csv(filterData) + "\r\n";

        FileSaver.saveAs(new Blob(["\uFEFF"+CSV], { type: fileType }), ReportTitle + fileExtension);
    }

    const onLoad = async () =>{
        //clear list in redux
        dispatch(callListValidationMgt.actions.clear())

        await getAllCampaignType()
                .then((response) => {
                    if (response.status  === HttpStatusCodeEnum.Ok) {
                        setCampaignTypeOptions(response.data);
                    }
                })
    }

    const handleReset = () =>{    
        dispatch(callListValidationMgt.actions.clear())           
        setSelectedCampaignTypeId(null)
        setSelectedCampaign(null)
        setFilterTaggedDate([])
        setSelectedPrimaryGoalReached(null)
        setSelectedPlayerIds(null)
        setSelectedUsernames(null)
        setSelectedStatuses(null)
        setSelectedCurrencies(null)
        setFilterRegistrationDate([])
        setSelectedDeposited(null)
        setFilterFTDDate([])
        setSelectedMessageStatusAndResponses(null)
        setFilterCallCaseCreatedDate([])
        setSelectedAgentnames(null)
        setSelectedSystemValidations(null)
        setSelectedAgentValidations(null)
        setSelectedLeaderValidations(null)
        setSelectedLeaderJustifications(null)
        setSelectedHighDepositAmounts(null)
    }

    const loadValidationFilters = async (campaignId: number) => {

        //enableSplashScreen() [MPCS 07/02]: remove loading screen to give option to user to click the buttons
        setAgentNames([])

        const request: CallValidationFilterRequestModel = {
            campaignId: campaignId
        };

        var resultFilters : CallValidationFilterResponseModel | null = null

        await getCallListValidationFilter(request).then((response) => {
            if (response.status  === HttpStatusCodeEnum.Ok) {                       
                resultFilters = response.data; 
            }
        })
        .catch((ex) => {
            console.log("Problem in selecting campaign name")
            console.log(ex)
        })

        if(resultFilters != null){             
            loadMessageStatusResponse(resultFilters)
            loadPlayerIds(resultFilters)
            loadUsernames(resultFilters)
            loadLeaderJustifications(resultFilters)
            loadAgentNames(campaignId)
        }

        disableSplashScreen()
    }

    const loadMessageStatusResponse = async (filters: CallValidationFilterResponseModel) => {
        if(filters.callCaseStatusOutcomes != undefined && filters.callCaseStatusOutcomes.length > 0){
            let options = Array<LookupModel>();
            filters.callCaseStatusOutcomes.forEach(item => {
                let dropdownOption: LookupModel = {
                    value: item,
                    label: item
                };
                options.push(dropdownOption)
            })
            setMesageStatusAndResponses(options)
        }        
    }

    const loadMessageStatusResponseOptions = (campaignId: number) => {
            getMessageStatusResponseList(campaignId)
                .then((response) => {
                    if (response.status === HttpStatusCodeEnum.Ok) {
                        setMessageStatusResponseOptions(response.data)
                    }
                })
            setFilterMessageStatusResponse([])
    }

    const loadPlayerIds = async (filters: CallValidationFilterResponseModel) => {
        if(filters.playerIds != undefined && filters.playerIds.length > 0){
            let options = Array<LookupModel>();
            filters.playerIds.forEach(item => {
                let dropdownOption: LookupModel = {
                    value: item.toString(),
                    label: item.toString()
                };
                options.push(dropdownOption)
            })
            setPlayerIds(options)
        }        
    }

    const loadUsernames = async (filters: CallValidationFilterResponseModel) => {

        if(filters.userNames != undefined && filters.userNames.length > 0){

            let options = Array<LookupModel>();
            filters.userNames.forEach(item => {
                let dropdownOption: LookupModel = {
                    value: item,
                    label: item
                };
                options.push(dropdownOption)
            })
            setUsernames(options)
        }        
    }

    const loadLeaderJustifications = async (filters: CallValidationFilterResponseModel) => {
        if(filters.justifications != undefined && filters.justifications.length > 0){
            let options = Array<LookupModel>();
            filters.justifications.forEach(item => {
                let dropdownOption: LookupModel = {
                    value: item.leaderJustificationId.toString(),
                    label: item.justification
                };
                options.push(dropdownOption)
            })
            setLeaderJustificationSettings(options)
            dispatch(callListValidationMgt.actions.setLeaderJustificationSettings(options))
        }        
    }

    const loadAgentNames = async (campaignId: number) => {
        let options = Array<LookupModel>();
        let hasWriteAccess = userAccess.includes(USER_CLAIMS.ViewCallListAllPlayersWrite)
        setSelectedAgentnames(null)

        getCampaignAgentsList(campaignId)
        .then((response) => {
            if (response.status  === HttpStatusCodeEnum.Ok) {
                response.data.forEach(item => {
                            let dropdownOption: LookupModel = {
                                value: item.value?.toString(),
                                label: item.label
                            };
                    options.push(dropdownOption)
                })   

                if(!hasWriteAccess){
                    options.push({value:'', label: ''})
                }

                setAgentNames(options);
                let currentAgent = options.filter(x => x.value === userId.toString())

                if(currentAgent.length > 0){
                    setSelectedAgentnames(currentAgent)
                }
                else if(!hasWriteAccess){           
                    let optionAgent = options.filter((x) => x.value === '')
                    setSelectedAgentnames(optionAgent)            
                }
                
                // Disable agent name filter when no write-access
                setIsAgentDropdownOptionDisabled(!hasWriteAccess)
            }
        })
    }

    const loadCampaignPlayers = async (values: any) => {
        dispatch(callListValidationMgt.actions.setLoading(true))        

        let offSetValue = (currentPage - 1) * pageSize;

        let request : CallValidationListRequestModel = {
            campaignId: selectedCampaign === null ? undefined : Number(selectedCampaign.value),
            playerId: selectedPlayerIds === null || selectedPlayerIds.length == 0 ? undefined : GetSelectedCommonOptions(selectedPlayerIds),
            username: selectedUsernames === null|| selectedUsernames.length == 0 ? undefined : GetSelectedCommonOptions(selectedUsernames),
            agentName: selectedAgentnames === null|| selectedAgentnames.length == 0 ? undefined : GetSelectedCommonOptions(selectedAgentnames),
            status: selectedStatuses === null|| selectedStatuses.length == 0 ? undefined : GetSelectedCommonOptions(selectedStatuses),
            currency: selectedCurrencies === null|| selectedCurrencies.length == 0 ? undefined : GetSelectedCommonOptions(selectedCurrencies),
            registrationStartDate: filterRegistrationStartDate === null ? undefined : filterRegistrationStartDate,
            registrationEndDate: filterRegistrationEndDate === null ? undefined : filterRegistrationEndDate,
            deposited: selectedDeposited === null|| selectedDeposited.length == 0 ? undefined : GetSelectedCommonOptions(selectedDeposited),
            ftdStartAmount: values?.fTDStartAmount === undefined || values.fTDStartAmount === ""? undefined : values.fTDStartAmount,
            ftdEndAmount: values?.fTDEndAmount === undefined || values.fTDEndAmount === ""? undefined : values.fTDEndAmount,
            ftdStartDate: filterFTDStartDate === null ? undefined : filterFTDStartDate,
            ftdEndDate: filterFTDEndDate === null ? undefined : filterFTDEndDate,
            taggedStartDate: filterTaggedStartDate === null ? undefined : filterTaggedStartDate,
            taggedEndDate: filterTaggedEndDate === null ? undefined : filterTaggedEndDate,
            primaryGoalReached: selectedPrimaryGoalReached === null|| selectedPrimaryGoalReached.length == 0 ? undefined : GetSelectedCommonOptions(selectedPrimaryGoalReached),
            primaryGoalCount: values?.primaryGoalCount === undefined || values.primaryGoalCount === ""? undefined : values.primaryGoalCount,
            primaryGoalAmount: values?.primaryGoalAmount === undefined || values.primaryGoalAmount === ""? undefined : values.primaryGoalAmount,
            callListNotes: values?.callListNotes === undefined || values.callListNotes === ""? undefined : values.callListNotes,
            mobileNumber: values?.mobileNumber === undefined || values.mobileNumber === ""? undefined : values.mobileNumber,
            messageStatusAndResponse: GetSelectedMessageStatusResponseCombination(), //selectedMessageStatusAndResponses === null|| selectedMessageStatusAndResponses.length == 0 ? undefined : GetSelectedCommonOptions(selectedMessageStatusAndResponses),
            callCaseCreatedStartDate: filterCallCaseCreatedStartDate === null ? undefined : filterCallCaseCreatedStartDate,
            callCaseCreatedEndDate: filterCallCaseCreatedEndDate === null ? undefined : filterCallCaseCreatedEndDate,
            systemValidation: selectedSystemValidations === null || selectedSystemValidations.length == 0 ? undefined : GetSelectedCommonOptions(selectedSystemValidations),
            agentValidation: selectedAgentValidations === null || selectedAgentValidations.length == 0 ? undefined : GetSelectedCommonOptions(selectedAgentValidations),
            leaderValidation: selectedLeaderValidations === null || selectedLeaderValidations.length == 0 ? undefined : GetSelectedCommonOptions(selectedLeaderValidations),
            leaderJustification: selectedLeaderJustifications === null || selectedLeaderJustifications.length == 0 ? undefined : GetSelectedCommonOptions(selectedLeaderJustifications),
            callEvaluationStartPoint: values?.callEvaluationStartPoint == undefined || values.callEvaluationStartPoint == ""? undefined : values.callEvaluationStartPoint,
            callEvaluationEndPoint: values?.callEvaluationEndPoint == undefined || values.callEvaluationEndPoint == ""? undefined : values.callEvaluationEndPoint,
            callEvaluationNotes: values?.callEvaluationNotes == undefined || values.callEvaluationNotes == ""? undefined : values.callEvaluationNotes,
            highDepositAmount: selectedHighDepositAmounts === null || selectedHighDepositAmounts.length == 0 ? undefined : GetSelectedCommonOptions(selectedHighDepositAmounts),
            agentValidationNotes: values?.agentValidationNotes == undefined || values.agentValidationNotes == ""? undefined : values.agentValidationNotes,
            leaderValidationNotes: values?.leaderValidationNotes == undefined || values.leaderValidationNotes == ""? undefined : values.leaderValidationNotes,
            pageSize: pageSize,
            offsetValue: offSetValue < 0 ? 0 : offSetValue,
            sortColumn: sortColumn  == undefined ? 'CampaignPlayerId' : sortColumn,
            sortOrder: sortOrder == undefined ? 'ASC' : sortOrder

        };

        setRequestFilter(request)
        
        await getCallValidationList(request)
            .then((response) => {
                let resultData = Object.assign({}, response.data as CallValidationListResponseModel)
                dispatch(callListValidationMgt.actions.setFilterResponse(resultData))
            }).catch((ex) => {
                console.log('ERROR Agent Workspace Search: ', ex)
            })

        dispatch(callListValidationMgt.actions.setLoading(false))
    }

    const handleFilterMessageStatusResponseChange = (val: any) => {
        setFilterMessageStatusResponse(val)
    }

    function GetSelectedMessageStatusResponseCombination() {
        let messageStatusResponseCombi: string = ''
        if (filterMessageStatusReponse.length > 0) {
            messageStatusResponseCombi = filterMessageStatusReponse.map((i: any) => i.value.split('|')[0]).join(',')
                + '|' + filterMessageStatusReponse.map((i: any) => i.value.split('|')[1]).join(',')

            return messageStatusResponseCombi
        } else {
            return undefined
        }
    }

    function GetSelectedCommonOptions(selectedOptions: Array<LookupModel> | null) {
        if(selectedOptions === null)
            return undefined
        else
            return selectedOptions.map(el => el.value).join(',');
    }

    useEffect(() => {
        onLoad()
    }, [])

    useEffect(() => {
        setSelectedCampaign(null)

        // Get Campaigns based from selected campaign type
        var campaignType = selectedCampaignTypeId as LookupModel        
        if(campaignType != undefined && campaignType.value != undefined){            
            getAllCampaignsList(Number(campaignType.value))
                    .then((response) => {        
                        if (response.status  === HttpStatusCodeEnum.Ok && response.data.length > 0) {                            
                            let campaignOptions = Array<LookupModel>();
                            response.data.forEach(item => {
                                let options: LookupModel = {
                                    value: item.value!,
                                    label: item.label
                                };
                                campaignOptions.push(options)
                            })
                            setCampaignNames(campaignOptions)
                        }
                })
        }

    }, [selectedCampaignTypeId])

    useEffect(() => {

        //  Clear dependent filters
        setFilterMessageStatusResponse([])
        setSelectedPlayerIds(null)
        setSelectedUsernames(null)
        setSelectedLeaderJustifications(null)
        setSelectedAgentnames(null)

        // Load other filters based from selected campaign
        var campaign = selectedCampaign as LookupModel
        if(campaign != undefined && campaign.value != undefined){
            loadValidationFilters(Number(campaign.value))
            loadMessageStatusResponseOptions(Number(campaign.value))
        }

    }, [selectedCampaign])

    useEffect(() => {
        if (filterTaggedDate != undefined) {
            setFilterTaggedStartDate(filterTaggedDate[0]);
            setFilterTaggedEndDate(filterTaggedDate[1]);
        }
        else{
            setFilterTaggedStartDate(null);
            setFilterTaggedEndDate(null);
        }
    }, [filterTaggedDate])

    useEffect(() => {
        if (filterRegistrationDate != undefined) {
            setFilterRegistrationStartDate(filterRegistrationDate[0]);
            setFilterRegistrationEndDate(filterRegistrationDate[1]);
        }
        else{
            setFilterRegistrationStartDate(null);
            setFilterRegistrationEndDate(null);
        }
    }, [filterRegistrationDate])

    useEffect(() => {
        if (filterFTDDate != undefined) {
            setFilterFTDStartDate(filterFTDDate[0]);
            setFilterFTDEndDate(filterFTDDate[1]);
        }
        else{
            setFilterFTDStartDate(null);
            setFilterFTDEndDate(null);
        }
    }, [filterFTDDate])

    useEffect(() => {
        if (filterCallCaseCreatedDate != undefined) {
            setFilterCallCaseCreatedStartDate(filterCallCaseCreatedDate[0]);
            setFilterCallCaseCreatedEndDate(filterCallCaseCreatedDate[1]);
        }
        else{
            setFilterCallCaseCreatedStartDate(null);
            setFilterCallCaseCreatedEndDate(null);
        }
    }, [filterCallCaseCreatedDate])

    useEffect(() => {
        if (formikValues !== undefined  && loadList !== null) {
            loadCampaignPlayers(formikValues);
        }        
    }, [loadList])
    
    //To map the fields and convert the value to readable data.
    const mapCallListValidationToCSV = (resultData : any) => {
       return resultData.callValidations.map((i : any) => 
        {
            const item : any = {
                campaignPlayerId: i.campaignPlayerId
                ,callListNotes: i.callListNotes
                ,playerId: i.playerId
                ,username: i.username
                ,playerStatusName: i.playerStatusName
                ,brand: i.brand
                ,currency: i.currency
                ,country: i.country
                ,marketingSource: i.marketingSource
                ,campaignName: i.campaignName
                ,registeredDate: i.registeredDate == '0001-01-01T00:00:00' ? '' : formatDate(i.registeredDate)
                ,deposited: i.deposited ? 'Yes' : 'No'
                ,ftdAmount: i.ftdAmount
                ,ftdDate: i.ftdDate == '0001-01-01T00:00:00' ? '' : formatDate(i.ftdDate) 
                ,lastDepositDate: i.lastDepositDate == '0001-01-01T00:00:00' ? '' : formatDate(i.lastDepositDate)
                ,lastDepositAmount: i.lastDepositAmount
                ,agentName: i.agentName
                ,agentId: i.agentId
                ,taggedBy: i.taggedBy
                ,taggedDate: i.taggedDate == '0001-01-01T00:00:00' ? '' : formatDate(i.taggedDate)
                ,primaryGoalReached: i.primaryGoalReached ? 'Yes' : 'No'
                ,primaryGoalCount: i.primaryGoalCount
                ,primaryGoalAmount: i.primaryGoalAmount
                ,primaryGoalAmountInUSD: i.primaryGoalAmountInUSD
                ,validIncentivePoints: i.validIncentivePoints
                ,validIncentiveSourced: i.validIncentiveSourced
                ,validIncentiveSourcedUSD: i.validIncentiveSourcedUSD
                ,invalidIncentivePoints: i.invalidIncentivePoints
                ,invalidIncentiveSource: i.invalidIncentiveSource
                ,invalidIncentiveSourceUSD: i.invalidIncentiveSourceUSD
                ,incentiveValue: i.incentiveValue
                ,systemValidation: i.systemValidation ? 'Valid' : 'Invalid'
                ,agentValidation: i.agentValidation  ? 'Valid' : 'Invalid'
                ,agentValidationNotes: i.agentValidationNotes
                ,leaderValidation: i.leaderValidation  ? 'Valid' : 'Invalid'
                ,leaderJustification: i.leaderJustification
                ,leaderValidationNotes: i.leaderValidationNotes
                ,callEvaluationPoint : i.callEvaluationPoint
                ,callEvaluationNotes: i.callEvaluationNotes
                ,highDepositAmount: i.highDepositAmount
                ,lastMessageStatus: i.lastMessageStatus
                ,lastCallDate: i.lastCallDate == '0001-01-01T00:00:00' ? '' : formatDate(i.lastCallDate)
                ,callCount: i.callCount
                ,contactableCallCount: i.contactableCallCount
                ,lastContactableCaseDate: i.lastContactableCaseDate == '0001-01-01T00:00:00' ? '' : formatDate(i.lastContactableCaseDate)
                ,totalCallDuration: i.totalCallDuration
                ,firstCallDatetime: i.firstCallDatetime 
                ,firstCallStatus: i.firstCallStatus
                ,secondCallDatetime: i.secondCallDatetime == '0001-01-01T00:00:00' ? '' : formatDate(i.secondCallDatetime)
                ,secondCallStatus: i.secondCallStatus
                ,lastCallDateTimeAfter2nd: i.lastCallDateTimeAfter2nd 
                ,lastCallStatusAfter2nd: i.lastCallStatusAfter2nd
                ,firstCallAttemptCount: i.firstCallAttemptCount
                ,secondCallAttemptCount: i.secondCallAttemptCount
                ,additionalCallAttempt: i.additionalCallAttempt
                ,campaignId: i.campaignId
                ,depositAttempts: i.depositAttempts === 0 ? '' : i.depositAttempts
                ,isAgentValidated: i.isAgentValidated ? 'Yes' : 'No'
                ,isLeaderValidated: i.isLeaderValidated ? 'Yes' : 'No'
                ,campaignStatus: i.campaignStatus
                ,messageStatusAndResponseResult: i.messageStatusAndResponseResult
                ,campaignType: i.campaignType
                ,initialDepositAmount: i.initialDepositAmount
                ,initialDepositDate: i.initialDepositDate == '0001-01-01T00:00:00' ? '' : formatDate(i.initialDepositDate) 
                ,totalDepositAmount: i.totalDepositAmount
                ,totalDepositCount: i.totalDepositCount
            }
        return item
        });
    } 
    return (
        <div className='flex-column flex-lg-row-auto w-100 w-lg-300px w-xxl-350px mb-8 mb-lg-0 me-lg-3 me-5'>

            <FormContainer onSubmit={formik.handleSubmit} onReset={formik.resetForm}>

                <div className="card">
                    <div className='card-body p-5'>
                    <FormGroupContainer>
                        <h5>
                            <i className='bi bi-search'></i> Search Filters
                        </h5>
                    </FormGroupContainer>
                    <div className='separator separator-dashed my-3'></div>
                            <div className="d-flex mb-2">
                                <div style={{ marginRight: 5 }}>
                                    <MlabButton
                                        access={true}
                                        label='Search'
                                        style={ElementStyle.primary}
                                        type={'button'}
                                        weight={'solid'}
                                        size={'sm'}
                                        loadingTitle={'Please wait...'}
                                        disabled={isFilterLoading}
                                        onClick={() => formik.submitForm()}
                                    />
                                </div>
                                
                                <div style={{ marginRight: 5 }}>
                                    <MlabButton
                                        access={true}
                                        label='Clear'
                                        style={ElementStyle.secondary}
                                        type={'reset'}
                                        weight={'solid'}
                                        size={'sm'}
                                    />
                                </div>

                            
                                {
                                    filterResponseState.recordCount > 0 &&
                                    <MlabButton
                                        access={userAccess.includes(USER_CLAIMS.ExportToCSVCallListValidationWrite)}
                                        label='Export to CSV'
                                        style={ElementStyle.primary}
                                        type={'button'}
                                        weight={'solid'}
                                        size={'sm'}
                                        loading={isExportLoading}
                                        loadingTitle={'Please wait...'}
                                        onClick={onExportToCsv}
                                    />
                                }

                            </div>
                            <div className='separator separator-dashed my-3'></div>
                            <FormGroupContainer>
                            <FilterAccordion type={AccordionHeaderType.light} title='Campaign' icon={<i className='bi bi-chat-quote-fill text-primary fs-3' />}>
                                <div className='col-md-12 col-xs-12'>
                                    <p className='p-0 m-0 my-1 filter-label fs-7 required'>Campaign Type</p>
                                    <Select
                                        menuPlacement="auto"
                                        menuPosition="fixed"
                                        size="small"
                                        options={campaignTypeOptions}
                                        onChange={(e:any) => setSelectedCampaignTypeId(e)}
                                        value={selectedCampaignTypeId}
                                    />
                                </div>
                                <div className='col-md-12 col-xs-12'>
                                    <p className='py-2 m-0 my-1 filter-label fs-7 required'>Campaign Name</p>
                                    <Select
                                        menuPlacement="auto"
                                        menuPosition="fixed"
                                        size="small"
                                        options={campaignNames}
                                        onChange={(e:any) => setSelectedCampaign(e)}
                                        value={selectedCampaign}
                                    />
                                </div>
                                <div className='col-lg-12 py-2'>
                                    <span className='py-2 filter-label d-block fs-7'>Tagged Date</span>
                                    <DefaultDateRangePicker
                                        format='yyyy-MM-dd HH:mm:ss'
                                        maxDays={180}
                                        onChange={(e:any) => setFilterTaggedDate(e)}
                                        value={filterTaggedDate}
                                    />
                                </div>

                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">Primary Goal Reached</span>
                                    <div className="col-sm-12">
                                        <Select
                                            menuPlacement="auto"
                                            menuPosition="fixed"
                                            isMulti
                                            size="small"
                                            style={{ width: '100%' }}
                                            options={[{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }]}
                                            onChange={(e:any) => setSelectedPrimaryGoalReached(e)}
                                            value={selectedPrimaryGoalReached}
                                        />
                                    </div>
                                </div>

                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">Primary Goal Count</span>
                                    <NumberTextInput ariaLabel={'Priamry Goal Count'}
                                        {...formik.getFieldProps('primaryGoalCount')}
                                    />
                                </div>

                                 <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">Primary Goal Amount</span>
                                    <NumberTextInput ariaLabel={'Priamry Goal Amount'}
                                        {...formik.getFieldProps('primaryGoalAmount')}
                                    />
                                </div>

                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">Call List Notes</span>
                                    <SearchTextInput ariaLabel={'Call List Notes'}
                                        {...formik.getFieldProps('callListNotes')}
                                    />
                                </div>

                            </FilterAccordion>
                            <FilterAccordion type={AccordionHeaderType.light} title='Player' icon={<i className='bi bi-person-fill text-primary fs-3' />}>
                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">Player Id</span>
                                    <div className="col-sm-12">
                                        <Select
                                            menuPlacement="auto"
                                            menuPosition="fixed"
                                            isMulti
                                            size="small"
                                            style={{ width: '100%' }}
                                            options={playerIds}
                                            onChange={(e:any) => setSelectedPlayerIds(e)}
                                            value={selectedPlayerIds}
                                        />
                                    </div>
                                </div>
                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">Username</span>
                                    <div className="col-sm-12">
                                        <Select
                                            menuPlacement="auto"
                                            menuPosition="fixed"
                                            isMulti
                                            size="small"
                                            style={{ width: '100%' }}
                                            options={usernames}
                                            onChange={(e:any) => setSelectedUsernames(e)}
                                            value={selectedUsernames}
                                        />
                                    </div>
                                </div>

                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">Status</span>
                                
                                    <div className="col-sm-12">
                                        <Select
                                            menuPlacement="auto"
                                            menuPosition="fixed"
                                            isMulti
                                            size="small"
                                            style={{ width: '100%' }}
                                            options={CommonLookups('playerStatuses')}
                                            onChange={(e:any) => setSelectedStatuses(e)}
                                            value={selectedStatuses}
                                        />
                                    </div>
                                </div>

                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">Currency</span>
                                
                                    <div className="col-sm-12">
                                        <Select
                                            menuPlacement="auto"
                                            menuPosition="fixed"
                                            isMulti
                                            size="small"
                                            style={{ width: '100%' }}
                                            options={CommonLookups('currencies')}
                                            onChange={(e:any) => setSelectedCurrencies(e)}
                                            value={selectedCurrencies}
                                        />
                                    </div>
                                </div>

                                <div className='col-lg-12 py-2'>
                                 <span className="filter-label py-2 d-block fs-7">Registration Date</span>
                                    <DefaultDateRangePicker
                                        format='yyyy-MM-dd HH:mm:ss'
                                        maxDays={180}
                                        onChange={(e:any) => setFilterRegistrationDate(e)}
                                        value={filterRegistrationDate}
                                    />
                                </div>

                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">Deposited</span>
                                
                                    <div className="col-sm-12">
                                        <Select
                                            menuPlacement="auto"
                                            menuPosition="fixed"
                                            isMulti
                                            size="small"
                                            style={{ width: '100%' }}
                                            options={[{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }]}
                                            onChange={(e:any) => setSelectedDeposited(e)}
                                            value={selectedDeposited}
                                        />
                                    </div>
                                </div>

                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">FTD Start Amount</span>
                                    <NumberTextInput ariaLabel={'FTD Start Amount'}
                                        {...formik.getFieldProps('fTDStartAmount')}
                                    />
                                </div>

                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">FTD End Amount</span>
                                    <NumberTextInput ariaLabel={'FTD End Amount'}
                                        {...formik.getFieldProps('fTDEndAmount')}
                                    />
                                </div>

                                <div className='col-lg-12 py-2'>
                                 <span className="filter-label py-2 d-block fs-7">FTD Date</span>
                                    <DefaultDateRangePicker
                                        format='yyyy-MM-dd HH:mm:ss'
                                        maxDays={180}
                                        onChange={(e:any) => setFilterFTDDate(e)}
                                        value={filterFTDDate}
                                    />
                                </div>
                               
                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">Mobile Number</span>
                                    <SearchTextInput ariaLabel={'Mobile Number'}
                                        {...formik.getFieldProps('mobileNumber')}
                                    />
                                </div>
                            </FilterAccordion>

                            <FilterAccordion type={AccordionHeaderType.light} title='Communications' icon={ <FontAwesomeIcon icon={faComments} className='fs-3' style={{marginRight: '0.35rem'}} /> }>

                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">Message And Response</span>
                               
                                    <div className="col-sm-12">
                                        <Select
                                            native
                                            size="small"
                                            isMulti
                                            style={{ width: '100%' }}
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) }}
                                            // options={mesageStatusAndResponses}
                                            // onChange={(e:any) => setSelectedMessageStatusAndResponses(e)}
                                            // value={selectedMessageStatusAndResponses}

                                            options={messageStatusResponseOptions}
                                            onChange={handleFilterMessageStatusResponseChange}
                                            value={filterMessageStatusReponse}
                                        />
                                    </div>
                                </div>

                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">Call Case Created date</span>
                                    <DefaultDateRangePicker
                                        format='yyyy-MM-dd HH:mm:ss'
                                        maxDays={180}
                                        onChange={(e:any) => setFilterCallCaseCreatedDate(e)}
                                        value={filterCallCaseCreatedDate}
                                    />
                                </div>
                            </FilterAccordion>

                            <FilterAccordion type={AccordionHeaderType.light} title='Call List Validations' icon={ <FontAwesomeIcon icon={faPhoneSquare} className='fs-3' style={{marginRight: '0.35rem'}} /> }>
                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">Agent Name</span>
                               
                                    <div className="col-sm-12">
                                        <Select
                                            menuPlacement="auto"
                                            menuPosition="fixed"
                                            isMulti
                                            size="small"
                                            style={{ width: '100%' }}
                                            options={agentNames}
                                            onChange={(e:any) => setSelectedAgentnames(e)}
                                            value={selectedAgentnames}
                                            isDisabled={isAgentDropdownOptionDisabled}
                                        />
                                    </div>
                                </div>

                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7" >System Validation</span>
                                  
                                    <div className="col-sm-12">
                                        <Select
                                            menuPlacement="auto"
                                            menuPosition="fixed"
                                            isMulti
                                            size="small"
                                            style={{ width: '100%' }}
                                            options={[{ value: '1', label: 'Valid' }, { value: '0', label: 'Invalid' }]}
                                            onChange={(e:any) => setSelectedSystemValidations(e)}
                                            value={selectedSystemValidations}
                                        />
                                    </div>
                                </div>
                                
                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">Agent Validation</span>
                                
                                    <div className="col-sm-12">
                                        <Select
                                            menuPlacement="auto"
                                            menuPosition="fixed"
                                            isMulti
                                            size="small"
                                            style={{ width: '100%' }}
                                            options={[{ value: '1', label: 'Valid' }, { value: '0', label: 'Invalid' }]}
                                            onChange={(e:any) => setSelectedAgentValidations(e)}
                                            value={selectedAgentValidations}
                                        />
                                    </div>
                                </div>
                                
                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7" >Leader Validation</span>
                                
                                    <div className="col-sm-12">
                                        <Select
                                            menuPlacement="auto"
                                            menuPosition="fixed"
                                            isMulti
                                            size="small"
                                            style={{ width: '100%' }}
                                            options={[{ value: '1', label: 'Valid' }, { value: '0', label: 'Invalid' }]}
                                            onChange={(e:any) => setSelectedLeaderValidations(e)}
                                            value={selectedLeaderValidations}
                                        />
                                    </div>
                                </div>
                                
                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7" >Leader Justification</span>
                                
                                    <div className="col-sm-12">
                                        <Select
                                            id='leader-justification-select'
                                            menuPlacement="auto"
                                            menuPosition="fixed"
                                            isMulti
                                            size="small"
                                            style={{ width: '100%' }}
                                            options={leaderJustificationSettings}
                                            onChange={(e:any) => setSelectedLeaderJustifications(e)}
                                            value={selectedLeaderJustifications}
                                        />
                                    </div>
                                </div>

                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7" >Call Evaluation Start Point</span>
                                    <NumberTextInput ariaLabel={'Call Evaluation Start Point'} 
                                        {...formik.getFieldProps('callEvaluationStartPoint')}
                                    />
                                </div>
                                        
                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">Call Evaluation End Point</span>
                                    <NumberTextInput ariaLabel={'Call Evaluation End Point'}
                                        {...formik.getFieldProps('callEvaluationEndPoint')}
                                    />
                                </div>
                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">High Deposit Amount</span>
                                
                                    <div className="col-sm-12">
                                        <Select
                                            menuPlacement="auto"
                                            menuPosition="fixed"
                                            isMulti
                                            size="small"
                                            style={{ width: '100%' }}
                                            options={[{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }, { value: '2', label: 'NA' }]}
                                            onChange={(e:any) => setSelectedHighDepositAmounts(e)}
                                            value={selectedHighDepositAmounts}
                                        />
                                    </div>
                                </div>
                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">Agent Validation Notes</span>
                                    <SearchTextInput ariaLabel={'Agent Validation Notes'}
                                        {...formik.getFieldProps('agentValidationNotes')}
                                    />
                                </div>
                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">Leader Validation Notes</span>
                                    <SearchTextInput ariaLabel={'Agent Validation Notes'}
                                        {...formik.getFieldProps('leaderValidationNotes')}
                                    />
                                </div>
                                <div className='col-lg-12 py-2'>
                                    <span className="filter-label py-2 d-block fs-7">Call Evaluation Notes</span>
                                    <SearchTextInput ariaLabel={'Agent Validation Notes'}
                                        {...formik.getFieldProps('callEvaluationNotes')}
                                    />
                                </div>

                            </FilterAccordion>

                            </FormGroupContainer>

                        </div>
                </div>

            </FormContainer>            

        </div>
    )
}

export default CallListValidationFilters