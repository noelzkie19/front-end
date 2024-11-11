import { Accordion, Button, Card, Col, Row } from "react-bootstrap-v5";
import { ContentContainer, MainContainer, MlabButton } from "../../../../custom-components"
import { SelectFilter, TextFilter } from "../../../relationship-management/shared/components";
import { DateRangePicker } from "rsuite";
import { ElementStyle } from "../../../../constants/Constants";
import { useEffect, useState } from "react";
import '../css/TicketSearchFilter.css';
import ToggleComponent from "../../../user-management/components/shared/compoments/ToggleComponent";
import useAutoRefreshConstants from "../../constants/AutoRefreshConstants";
import { LookupModel } from "../../../../shared-models/LookupModel";
import { useTicketManagementHooks } from "../hooks/useTicketManagementHooks";
import { SearchFilterRequestModel } from "../../models/request/SearchFilterRequestModel";
import { Guid } from "guid-typescript";
import { RootState } from "../../../../../setup";
import { shallowEqual, useSelector } from "react-redux";
import { IAuthState } from "../../../auth";
import { UpsertSearchTicketFilter, exportSearchTicket, getFilterIDByUserId, getSavedFilterByFilterId } from "../../services/TicketManagementApi";
import swal from "sweetalert";
import SaveSearchTicketFilterModal from "./modals/SaveSearchTicketFilterModal";
import { SaveSearchFilterRequestModel } from "../../models/request/SaveSearchFilterRequestModel";
import useConstant from "../../../../constants/useConstant";
import { useHistory, useParams } from "react-router-dom";
import JsonToExcel from "../../../../common/services/JsonToExcel";
import { PaginationModel } from "../../../../shared-models/PaginationModel";
import { SearchFilterCustomLookupModel } from "../../models/SearchFilterCustomLookupModel";
import { SearchTicketModel } from "../../models/response/SearchTicketModel";
import useFnsDateFormatter from "../../../../custom-functions/helper/useFnsDateFormatter";
import { validateStringValue } from "../../utils/helper";
import { ExportSearchResponseModel } from "../../models/response/ExportSearchResponseModel";
import useTicketConstant from "../../constants/TicketConstant";

type FilterProps = {
    handleSearchFilter: any,
    isSearch: boolean,
    searchIsLoading: (isLoading: any) => void,
    paginationModel?: PaginationModel,
    setPagination: (page: PaginationModel) => void,
    setAutoRefresh: (autoRefresh: boolean) => void,
    isAutoRefresh: boolean,
    setTicketTypeList: (list: Array<SearchFilterCustomLookupModel>) => void,
    setStatusList: (list: Array<LookupModel>) => void
}

const TicketSearchFilter: React.FC<FilterProps> = ({ handleSearchFilter, isSearch, searchIsLoading, paginationModel, setPagination, setAutoRefresh, isAutoRefresh, setTicketTypeList, setStatusList }: FilterProps) => {
    const { AUTO_REFRESH_OPTION } = useAutoRefreshConstants();
    const [activeKey, setActiveKey] = useState<string>("0");
    const [isExport, setIsExport] = useState<boolean>(false);
    const [intervalValueInMS, setIntervalValueInMS] = useState<any>(AUTO_REFRESH_OPTION[0]);
    const { ticketManagementLookups, getTicketManagementLookup, validateAccess } = useTicketManagementHooks();
    const { successResponse, SwalSuccessRecordMessage, SwalSaveTicketSearchFilterConfirmMessage, message, SwalFailedMessage } = useConstant();
    const { userId } = useSelector<RootState>(({ auth }) => auth, shallowEqual) as IAuthState;
    const [showSaveFilterModal, setShowSaveFilterModal] = useState<boolean>(false);
    const [filterName, setFilterName] = useState<any>();
    const { mlabFormatDate } = useFnsDateFormatter();
    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string;
    const {TICKET_COMPONENT } = useTicketConstant()

    const params = useParams();
    const history = useHistory();

    // filter fields
    const [createdDateValue, setCreatedDateValue] = useState<any>();
    const [createdDateFrom, setCreatedDateFrom] = useState<any>();
    const [createdDateTo, setCreatedDateTo] = useState<any>();
    const [ticketType, setTicketType] = useState<LookupModel | null>();
    const [ticketCode, setTicketCode] = useState<string>("");
    const [summary, setSummary] = useState<string>("");
    const [playerUsername, setPlayerUsername] = useState<string>("");
    const [status, setStatus] = useState<Array<LookupModel>>();
    const [assignee, setAssignee] = useState<Array<LookupModel>>();
    const [reporter, setReporter] = useState<Array<LookupModel>>();
    const [externalLinkName, setExternalLinkName] = useState<string>("");
    const [currency, setCurrency] = useState<LookupModel | null>();
    const [methodCurrency, setMethodCurrency] = useState<LookupModel | null>();
    const [vipGroup, setVipGroup] = useState<LookupModel | null>();
    const [vipLevel, setVipLevel] = useState<LookupModel | null>();
    const [userListTeams, setUserListTeams] = useState<Array<LookupModel>>();
    const [platformTransactionId, setPlatformTransactionId] = useState<string>("");

    useEffect(() => {
        if (history.pathname !== "/error/401") {
            getTicketManagementLookup();
            if (params?.filterId === undefined) {
                getFilterId();
            }
        }
    }, []);

    useEffect(() => {
        if(ticketManagementLookups) {
            getSearchFilter(params?.filterId);
            setTicketTypeList(ticketManagementLookups?.ticketType ?? [])
            setStatusList(ticketManagementLookups?.status ?? [])
        }
    }, [ticketManagementLookups])

    useEffect(() => {
        if (isAutoRefresh) {
            const interval = setInterval(() => {
                setPagination({
                    currentPage: 1,
                    pageSize: 10,
                    offsetValue: 0,
                    sortColumn: "CreatedDate",
                    sortOrder: "DESC"
                })
                handleSearchFilter(createFilterRequestObject());
            }, intervalValueInMS.value);

            return () => clearInterval(interval);
        }
    }, [isAutoRefresh]);

    const getFilterId = () => {
        getFilterIDByUserId(userId?.toString() ?? "")
            .then((response) => {
                if (response.status === successResponse) {
                    const filterId: number = response.data;
                    if ([0, null, undefined].indexOf(filterId) === -1) {
                        history.push('/ticket-management/search-ticket/' + filterId);
                    }
                }
            })
    }

    const getSearchFilter = (filterId: any) => {
        try {
            if ([0, null, undefined, ""].indexOf(filterId) === -1) {
                getSavedFilterByFilterId(filterId)
                    .then((response: any) => {
                        if (response.status === successResponse) {
                            const data = response.data;
                            setSearchFilterData(data);
                        }
                    })
            }
        }
        catch (ex) {
            swal('Failed', 'Error on fetching saved filter data', 'error');
        }
    }

    const createdDateOnChange = (val: any) => {
        setCreatedDateValue(val);
        setCreatedDateFrom(val[0]);
        setCreatedDateTo(val[1]);
    }

    const showHideFilter = () => {
        if (activeKey !== "0") {
            setActiveKey("0");
        } else {
            setActiveKey("");
        }
    }

    const toggleAutoRefresh = (e: any) => {
        setAutoRefresh(e);
    }

    const handleAddNew = () => {
        window.open("/ticket-management/add-ticket/", "_blank");
    }

    const onChangeAutoRefresh = (val: any) => {
        setIntervalValueInMS(val);
    }

    const setSearchFilterData = (filterSaved: any) => {
        const dropdown = ticketManagementLookups;
        const data = filterSaved;
        if (data) {
            const dateFrom = data.createdDateFrom === "01/01/1900 00:00:00" ? "" : data.createdDateFrom;
            const dateTo = data.createdDateTo === "01/01/1900 00:00:00" ? "" : data.createdDateTo;
            const dateValue = dateFrom === "" && dateTo === "" ? [] : [new Date(dateFrom), new Date(dateTo)];
            setCreatedDateValue(dateValue);
            setCreatedDateFrom(dateFrom);
            setCreatedDateTo(dateTo);
            setTicketCode(data.ticketCode);
            setSummary(data.summary);
            setExternalLinkName(data.externalLinkName);
            setTicketType(dropdown?.ticketType.filter((x: any) => x.value.toString() === data.ticketType)[0]);
            setPlayerUsername(data.playerUsername) 
            setStatus(dropdown?.status.filter((x: any) => data.status.split(",").some((y: any) => x.value.toString() === y.toString())));
            setAssignee(dropdown?.assignee.filter((x: any) => data.assignee.split(",").some((y: any) => x.value.toString() === y.toString())));
            setReporter(dropdown?.reporter.filter((x: any) => data.reporter.split(",").some((y: any) => x.value.toString() === y.toString())));
            setCurrency(dropdown?.currency.filter((x: any) => x.value.toString() === data.currency)[0]);
            setMethodCurrency(dropdown?.methodCurrency.filter((x: any) => x.label.toString() === data.methodCurrency)[0]);
            setVipGroup(dropdown?.vipGroup.filter((x: any) => x.value.toString() === data.vipGroup)[0]);
            setVipLevel(dropdown?.vipLevel.filter((x: any) => x.value.toString() === data.vipLevel)[0]);
            setUserListTeams(dropdown?.userListTeams.filter((x: any) => data.userListTeams.split(",").some((y: any) => x.value.toString() === y.toString())));
            setFilterName(data.ticketSearchFilterName);
            setPlatformTransactionId(data.platformTransactionId);
        }
    }

    const createFilterRequestObject = () => {
        const requestObj: SearchFilterRequestModel = {
            createdDateFrom: validateStringValue(mlabFormatDate(createdDateFrom)),
            createdDateTo: validateStringValue(mlabFormatDate(createdDateTo)),
            ticketType: validateStringValue(ticketType?.value.toString()),
            ticketCode: ticketCode,
            summary: summary,
            playerUsername: playerUsername ?? "",
            status: validateStringValue(status?.map(x => x.value).toString()),
            assignee: validateStringValue(assignee?.map(x => x.value).toString()),
            reporter: validateStringValue(reporter?.map(x => x.value).toString()),
            externalLinkName: externalLinkName,
            currency: validateStringValue(currency?.value.toString()),
            methodCurrency: validateStringValue(methodCurrency?.label.toString()),
            vipGroup: validateStringValue(vipGroup?.value.toString()),
            vipLevel: validateStringValue(vipLevel?.value.toString()),
            userListTeams: validateStringValue(userListTeams?.map(x => x.value).toString()),
            platformTransactionId: platformTransactionId,
            currentPage: !isAutoRefresh ? paginationModel?.currentPage ?? 1 : 1,
            offsetValue: !isAutoRefresh ? paginationModel?.offsetValue ?? 0 : 0,
            pageSize: !isAutoRefresh ? paginationModel?.pageSize ?? 10 : 10,
            sortColumn: !isAutoRefresh ? paginationModel?.sortColumn ?? "CreatedDate" : "CreatedDate",
            sortOrder: !isAutoRefresh ? paginationModel?.sortOrder ?? "DESC" : "DESC",
            queueId: Guid.create().toString(),
            userId: validateStringValue(userId?.toString())
        }

        return requestObj;
    }

    const handleSearch = () => {
        if ([null, undefined, 0, {}, ""].indexOf(ticketType) === -1) {
            searchIsLoading(true);
            handleSearchFilter(createFilterRequestObject());
        } else {
            swal(SwalFailedMessage.title, message.requiredAllFields, SwalFailedMessage.icon);
        }
        
    }

    const handleClear = () => {
        setCreatedDateValue("");
        setCreatedDateFrom("");
        setCreatedDateTo("");
        setTicketCode("");
        setSummary("");
        setExternalLinkName("");
        setTicketType(null);
        setPlayerUsername("");
        setStatus([]);
        setAssignee([]);
        setReporter([]);
        setCurrency(null);
        setMethodCurrency(null);
        setVipGroup(null);
        setVipLevel(null);
        setUserListTeams([]);
    }

    const handleShowSaveFilterModal = () => {
        setShowSaveFilterModal(true);
    }

    const methodCurrencyOnChange = (val: any) => {
        setMethodCurrency(val)
    }

    const currencyOnChange = (val: any) => {
        setCurrency(val)
    }

    const handleExportToExcel = async () => {
        await exportSearchTicket(createFilterRequestObject())
            .then((response) => {
                const ticketList: Array<SearchTicketModel> = response.data;
                let formattedRowList: Array<ExportSearchResponseModel> = [];
                const header = [
                    "Ticket Type",
                    "Ticket Code",
                    "Summary",
                    "Status",
                    "Reporter",
                    "Assignee",
                    "Currency",
                    "Method Currency",
                    "VIPGroup",
                    "VIPLevel",
                    "User List - Teams",
                    "Platform Transaction Id",
                    "Duration",
                    "Created Date",
                    "Last Modified Date",
                    "Last Modified By"
                ];
                ticketManagementLookups?.ticketType.forEach((tTypes: any) => {
                    formattedRowList = formatRowValue(ticketList, tTypes);
                })

                JsonToExcel(formattedRowList, "TMS_SearchTicketResult", header);
                setIsExport(false);
            })
            .catch((e) => {
                setIsExport(false);
                swal('Failed', 'Problem in exporting list', 'error');
            });
    }

    const formatRowValue = (ticketList: any, ticketTypes: any) => {
        ticketList?.filter((x: any) => x.ticketType === ticketTypes.label).map((i: any) => {
            i.ticketID = ticketTypes.code + "-" + i.ticketTypeSequenceId
            i.createdDate = mlabFormatDate(i.createdDate)
            i.lastModifiedDate = mlabFormatDate(i.lastModifiedDate)
        })

        const rowList = generateRowValue(ticketList);

        return rowList;
    }

    const generateRowValue = (data: any) => {
        const rowList: Array<ExportSearchResponseModel> = [];
        data.map((x: any) => {
            rowList.push({
                ticketType: x.ticketType,
                ticketCode: x.ticketID,
                summary: x.summary,
                status: x.status,
                reporter: x.reporter,
                assignee: x.assignee,
                currency: x.currency,
                methodCurrency: x.methodCurrency,
                vipGroup: x.vipGroup,
                vipLevel: x.vipLevel,
                userListTeams: x.userListTeams,
                platformTransactionId: x.platformTransactionId,
                duration: x.duration,
                createdDate: x.createdDate,
                lastModifiedDate: x.lastModifiedDate,
                lastModifiedBy: x.lastModifiedBy,
            })
        })

        return rowList;
    }

    const ticketTypeOnChange = (val: any) => {
        setTicketType(val)
        validateAccess (userAccess, history , parseInt(val.value) , TICKET_COMPONENT.Search)
    }

    const handleSaveFilterCloseModal = () => {
        setShowSaveFilterModal(false);
    }

    const handleSaveFilter = async (filterName: any) => {
        const requestObj: SaveSearchFilterRequestModel = {
            queueId: Guid.create().toString(),
            userId: userId?.toString() ?? "0",
            ticketSearchFilterName: filterName,
            createdDateFrom: createdDateFrom ?? "",
            createdDateTo: createdDateTo ?? "",
            ticketCode: ticketCode,
            summary: summary,
            externalLinkName: externalLinkName,
            currency: currency?.value.toString() ?? "",
            methodCurrency: methodCurrency?.label.toString() ?? "",
            vipGroup: vipGroup?.value.toString() ?? "",
            vipLevel: vipLevel?.value.toString() ?? "",
            userListTeams: userListTeams?.map(x => x.value).toString() ?? "",
            platformTransactionId: platformTransactionId,
            playerUsername: playerUsername ?? "",
            status: status?.map(x => x.value).toString() ?? "",
            assignee: assignee?.map(x => x.value).toString() ?? "",
            reporter: reporter?.map(x => x.value).toString() ?? "",
            ticketType: ticketType?.value.toString() ?? "",
        }
        const response: any = await UpsertSearchTicketFilter(requestObj);

        if (response.status === successResponse) {
            swal(SwalSuccessRecordMessage.title, SwalSaveTicketSearchFilterConfirmMessage.text, SwalSuccessRecordMessage.icon).then(() => {
                handleSaveFilterCloseModal();
                getFilterId();
            })
        } else {
            swal('Failed', 'Problem in saving filter', 'error');
        }
    }

    return (

        <MainContainer>
            <Accordion activeKey={activeKey}>
                <Card>
                    <Card.Header>
                        <Accordion.Toggle as={Button} variant="link" eventKey="" onClick={(e) => e.preventDefault} className="accordion-ticket-search-filter-header">Search Ticket</Accordion.Toggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>
                            <Row>
                                <Col lg={3}>
                                    <p className="p-0 m-0 my-1 filter-label">
                                        Created Date
                                    </p>
                                    <DateRangePicker
                                        format='dd/MM/yyyy HH:mm:ss'
                                        onChange={(val: any) => createdDateOnChange(val)}
                                        style={{ width: 'auto' }}
                                        value={createdDateValue}
                                        disabled={false}
                                    />
                                </Col>
                                <Col lg={3}>
                                    <SelectFilter
                                        isRequired={true}
                                        isMulti={false}
                                        label='Ticket Type'
                                        options={ticketManagementLookups?.ticketType ?? []}
                                        onChange={(val: any) => ticketTypeOnChange(val)}
                                        value={ticketType}
                                        isClearable={true}
                                    />
                                </Col>
                                <Col lg={3}>
                                    <TextFilter
                                        label='Ticket Code'
                                        onChange={(val: any) => setTicketCode(val)}
                                        value={ticketCode}
                                    />
                                </Col>
                                <Col lg={3}>
                                    <TextFilter
                                        label='Summary'
                                        onChange={(val: any) => setSummary(val)}
                                        value={summary}
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col lg={3}>                                  
                                    <TextFilter
                                        label='Player Username'
                                        onChange={(val: any) => setPlayerUsername(val)}
                                        value={playerUsername}
                                    />
                                </Col>
                                <Col lg={3}>
                                    <SelectFilter
                                        isRequired={false}
                                        isMulti={true}
                                        label='Status'
                                        options={ticketManagementLookups?.status ?? []}
                                        onChange={(val: any) => setStatus(val)}
                                        value={status}
                                        isClearable={true}
                                        closeMenuOnSelect={false}
                                    />
                                </Col>
                                <Col lg={3}>
                                    <SelectFilter
                                        isRequired={false}
                                        isMulti={true}
                                        label='Assignee'
                                        options={ticketManagementLookups?.assignee ?? []}
                                        onChange={(val: any) => setAssignee(val)}
                                        value={assignee}
                                        isClearable={true}
                                        closeMenuOnSelect={false}
                                    />
                                </Col>
                                <Col lg={3}>
                                    <SelectFilter
                                        isRequired={false}
                                        isMulti={true}
                                        label='Reporter'
                                        options={ticketManagementLookups?.reporter ?? []}
                                        onChange={(val: any) => setReporter(val)}
                                        value={reporter}
                                        isClearable={true}
                                        closeMenuOnSelect={false}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col lg={3}>
                                    <TextFilter
                                        label='External Link Name'
                                        onChange={(val: any) => setExternalLinkName(val)}
                                        value={externalLinkName}
                                    />
                                </Col>
                                <Col lg={3}>
                                    <SelectFilter
                                        isRequired={false}
                                        isMulti={false}
                                        label='Currency'
                                        options={ticketManagementLookups?.currency ?? []}
                                        onChange={currencyOnChange}
                                        value={currency}
                                        isClearable={true}
                                    />
                                </Col>
                                <Col lg={3}>
                                    <SelectFilter
                                        isRequired={false}
                                        isMulti={false}
                                        label='Method Currency'
                                        options={ticketManagementLookups?.methodCurrency ?? []}
                                        onChange={methodCurrencyOnChange}
                                        value={methodCurrency}
                                        isClearable={true}
                                    />
                                </Col>
                                <Col lg={3}>
                                    <SelectFilter
                                        isRequired={false}
                                        isMulti={false}
                                        label='VIP Group'
                                        options={ticketManagementLookups?.vipGroup ?? []}
                                        onChange={(val: any) => setVipGroup(val)}
                                        value={vipGroup}
                                        isClearable={true}
                                    />
                                </Col>
                            </Row>
                            <Row>
                            <Col lg={3}>
                                    <SelectFilter
                                        isRequired={false}
                                        isMulti={false}
                                        label='VIP Level'
                                        options={ticketManagementLookups?.vipLevel ?? []}
                                        onChange={(val: any) => setVipLevel(val)}
                                        value={vipLevel}
                                        isClearable={true}
                                    />
                                </Col>
                                <Col lg={3}>
                                    <SelectFilter
                                        isRequired={false}
                                        isMulti={true}
                                        label='User List - Teams'
                                        options={ticketManagementLookups?.userListTeams ?? []}
                                        onChange={(val: any) => setUserListTeams(val)}
                                        value={userListTeams}
                                        isClearable={true}
                                        closeMenuOnSelect={false}
                                    />
                                </Col>
                                <Col lg={3}>
                                    <TextFilter
                                        label='Platform Transaction Id'
                                        onChange={(val: any) => setPlatformTransactionId(val)}
                                        value={platformTransactionId}
                                    />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
            <ContentContainer>
                <Row>
                    <Col lg={8}>
                        <MlabButton
                            access={true}
                            label='Search'
                            style={ElementStyle.primary}
                            type={'button'}
                            weight={'solid'}
                            size={'sm'}
                            loading={isSearch}
                            loadingTitle={'Please wait...'}
                            disabled={isAutoRefresh || isSearch}
                            onClick={() => handleSearch()}
                        />
                        <MlabButton
                            access={true}
                            label='Clear'
                            style={ElementStyle.secondary}
                            type={'button'}
                            weight={'solid'}
                            size={'sm'}
                            loading={false}
                            loadingTitle={'Please wait...'}
                            disabled={false}
                            onClick={() => handleClear()}
                        />
                        <MlabButton
                            access={true}
                            label='Add New'
                            style={ElementStyle.primary}
                            type={'button'}
                            weight={'solid'}
                            size={'sm'}
                            loading={false}
                            loadingTitle={'Please wait...'}
                            disabled={false}
                            onClick={() => handleAddNew()}
                        />
                        <MlabButton
                            access={true}
                            label={activeKey === "0" ? 'Hide Filter' : 'Show Filter'}
                            style={ElementStyle.primary}
                            type={'button'}
                            weight={'solid'}
                            size={'sm'}
                            loading={false}
                            loadingTitle={'Please wait...'}
                            disabled={false}
                            onClick={() => showHideFilter()}
                        />
                        <MlabButton
                            access={true}
                            label='Save Filter'
                            style={ElementStyle.primary}
                            type={'button'}
                            weight={'solid'}
                            size={'sm'}
                            loading={false}
                            loadingTitle={'Please wait...'}
                            disabled={false}
                            onClick={() => handleShowSaveFilterModal()}
                        />
                        <MlabButton
                            access={true}
                            label='Export to Excel'
                            style={ElementStyle.primary}
                            type={'button'}
                            weight={'solid'}
                            size={'sm'}
                            loading={isExport}
                            loadingTitle={'Please wait...'}
                            disabled={isExport}
                            onClick={() => handleExportToExcel()}
                        />
                    </Col>
                    <Col lg={4}>
                        <Row>
                            <Col lg={7} className="auto-refresh-toggle-container">
                                <ToggleComponent
                                    toggleId='autoRefresh'
                                    toggleChange={(e: any) => toggleAutoRefresh(e)}
                                    toggleDefaultValue={isAutoRefresh}
                                    toggleTagging='Auto Refresh'
                                    isDisabled={false}
                                />
                            </Col>
                            <Col lg={5}>
                                <SelectFilter
                                    isRequired={false}
                                    isMulti={false}
                                    label=''
                                    options={AUTO_REFRESH_OPTION}
                                    onChange={(val: any) => onChangeAutoRefresh(val)}
                                    value={intervalValueInMS}
                                    isDisabled={isAutoRefresh}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </ContentContainer>

            <SaveSearchTicketFilterModal
                showModal={showSaveFilterModal}
                handleCloseModal={handleSaveFilterCloseModal}
                submitModal={(e: any) => handleSaveFilter(e)}
                savedFilterName={filterName}
            />
        </MainContainer>
    )
}

export default TicketSearchFilter;