import { Col, Row } from "react-bootstrap-v5";
import { ContentContainer, MainContainer } from "../../../custom-components";
import TicketGrid from "../shared/components/TicketGrid";
import TicketSearchFilter from "../shared/components/TicketSearchFilter";
import { USER_CLAIMS } from "../../user-management/components/constants/UserClaims";
import { RootState } from "../../../../setup";
import { shallowEqual, useSelector } from "react-redux";
import { pushTo401, validateStringValue } from "../utils/helper";
import { useHistory } from 'react-router-dom'
import { useTicketManagementHooks } from "../shared/hooks/useTicketManagementHooks";
import { useEffect, useState } from "react";
import { LookupModel } from "../../../shared-models/LookupModel";
import { SearchFilterCustomLookupModel } from "../models/SearchFilterCustomLookupModel";
import { SearchFilterRequestModel } from "../models/request/SearchFilterRequestModel";
import { Guid } from "guid-typescript";
import { IAuthState } from "../../auth";
import { PaginationModel } from "../../../shared-models/PaginationModel";
import { getFilterIDByUserId } from "../services/TicketManagementApi";
import useConstant from "../../../constants/useConstant";

const SearchTicket: React.FC = () => {
    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string;
    const history = useHistory();
    const { searchTicket, searchTicketData } = useTicketManagementHooks();
    const [ticketTypeLists, setTicketTypeLists] = useState<Array<SearchFilterCustomLookupModel>>([]);
    const [searchParams, setSearchParams] = useState<SearchFilterRequestModel>();
    const { userId } = useSelector<RootState>(({ auth }) => auth, shallowEqual) as IAuthState;
    const [isSearch, setIsSearch] = useState<boolean>(false);
    const [paginationModel, setPaginationModel] = useState<PaginationModel>();
    const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(false);
    const [statuses, setStatuses] = useState<Array<LookupModel>>([]);
    const { successResponse } = useConstant();

    useEffect(() => {
        !userAccess.includes(USER_CLAIMS.ReporterRoleRead) && !userAccess.includes(USER_CLAIMS.ReporterRoleWrite) ?
            (!userAccess.includes(USER_CLAIMS.ManageTicketsRead) && !userAccess.includes(USER_CLAIMS.ManageTicketsWrite) && pushTo401(history)) :
            (!userAccess.includes(USER_CLAIMS.ReporterRoleRead) && !userAccess.includes(USER_CLAIMS.ReporterRoleWrite) && pushTo401(history));

        const splitURL = window.location.href.split("/");
        if (splitURL[splitURL.length - 1] === "") {
            getFilterIDByUserId(userId?.toString() ?? "0")
            .then((response) => {
                if (response.status === successResponse) {
                    const filterId: any = [0, null, undefined].indexOf(response.data) === -1 ? response.data : "";
                    history.push('/ticket-management/search-ticket/' + filterId);
                }
            })
        }
        return () => { } 
    }, [])
    useEffect(() => {
        if (searchTicketData) {
            setIsSearch(false);
        }
    }, [searchTicketData])

    const loadTicketList = (_sortColumn?: string, _sortOrder?: string, _offsetValue?: number, _pageSize?: number) => {
        const requestObj: SearchFilterRequestModel = {
            createdDateFrom: validateStringValue(searchParams?.createdDateFrom),
            createdDateTo: validateStringValue(searchParams?.createdDateTo),
            ticketType: validateStringValue(searchParams?.ticketType),
            ticketCode: validateStringValue(searchParams?.ticketCode),
            summary: validateStringValue(searchParams?.summary),
            playerUsername: validateStringValue(searchParams?.playerUsername),
            status: validateStringValue(searchParams?.status),
            assignee: validateStringValue(searchParams?.assignee),
            reporter: validateStringValue(searchParams?.reporter),
            externalLinkName: validateStringValue(searchParams?.externalLinkName),
            currency: validateStringValue(searchParams?.currency),
            methodCurrency: validateStringValue(searchParams?.methodCurrency),
            vipGroup: validateStringValue(searchParams?.vipGroup),
            vipLevel: validateStringValue(searchParams?.vipLevel),
            userListTeams: validateStringValue(searchParams?.userListTeams),
            platformTransactionId: validateStringValue(searchParams?.platformTransactionId),
            currentPage: searchParams?.currentPage ?? 1,
            offsetValue: _offsetValue ?? searchParams?.offsetValue ?? 0,
            pageSize: _pageSize ?? searchParams?.pageSize ?? 0,
            sortColumn: validateStringValue(_sortColumn ?? searchParams?.sortColumn),
            sortOrder: validateStringValue(_sortOrder ?? searchParams?.sortOrder),
            queueId: Guid.create().toString(),
            userId: userId?.toString() ?? "0"
        }

        searchTicket(requestObj);
    }

    const handleSearchFilter = (requestObj: any) => {
        searchTicket(requestObj);
        setSearchParams(requestObj);
    }

    const searchIsLoading = (isLoading: any) => {
        setIsSearch(isLoading)
    }

    const setTicketTypeList = (list: Array<SearchFilterCustomLookupModel>) => {
        setTicketTypeLists(list);
    }

    const setPagination = (page: PaginationModel) => {
        setPaginationModel(page);
    }

    const setAutoRefresh = (isAutoRefresh: any) => {
        setIsAutoRefresh(isAutoRefresh);
    }

    const setStatusList = (list: Array<LookupModel>) => {
        setStatuses(list);
    }

    return (
        <MainContainer>
            <Row>
                <Col md={12}>
                    <TicketSearchFilter handleSearchFilter={handleSearchFilter} isSearch={isSearch} paginationModel={paginationModel} searchIsLoading={searchIsLoading} setPagination={setPagination} isAutoRefresh={isAutoRefresh} setAutoRefresh={setAutoRefresh} setTicketTypeList={setTicketTypeList} setStatusList={setStatusList} />
                </Col>
            </Row>
            <Row>
                <Col md={12}>
                    <ContentContainer>
                        <TicketGrid searchTicketData={searchTicketData} ticketTypeList={ticketTypeLists} loadTicketList={loadTicketList} setPagination={setPagination} isAutoRefresh={isAutoRefresh} statuses={statuses} />
                    </ContentContainer>
                </Col>
            </Row>
        </MainContainer>
    )
}

export default SearchTicket;