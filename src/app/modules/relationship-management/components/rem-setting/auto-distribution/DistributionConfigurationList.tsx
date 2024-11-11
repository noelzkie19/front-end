import { useEffect, useRef, useState } from 'react';
import { ButtonsContainer, DefaultGridPagination, FormGroupContainer, MlabButton, TableIconButton } from '../../../../../custom-components';
import { ElementStyle, PROMPT_MESSAGES } from '../../../../../constants/Constants';
import { DefaultPageSetup } from '../../../../system/components/constants/PlayerConfigEnums';
import useAutoDistributionSettingHooks from '../../../shared/hooks/useAutoDistributionSettingHooks';
import { faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ButtonGroup } from 'react-bootstrap-v5';
import { useSelector, shallowEqual } from 'react-redux';
import { RootState } from '../../../../../../setup';
import swal from 'sweetalert';
import Switch from 'react-switch';
import { AutoDistributionSettingsFilterModel } from '../../../models/request/AutoDistributionSettingsFilterModel';
import ReorderConfigDistributionPriorityModal from './modal/ReorderConfigDistributionPriorityModal';
import { USER_CLAIMS } from '../../../../user-management/components/constants/UserClaims';
import { AgGridReact } from 'ag-grid-react';
import gridOverlayTemplate, { gridOverlayNoRowsTemplate } from '../../../../../common-template/gridTemplates';
import { PaginationModel } from '../../../../../shared-models/PaginationModel';
import { DeleteAutoDistributionConfig, UpdateAutoDistributionConfigStatus } from '../../../services/RemSettingApi';
import useConstant from '../../../../../constants/useConstant';
import { UpdateAutoDistributionConfigStatusRequestModel } from '../../../models/request/UpdateAutoDistributionConfigStatusRequestModel';
import AddAutoDistributionConfigModal from './modal/AddAutoDistributionConfigModal';
import EditAutoDistributionConfigModal from './modal/EditAutoDistributionConfigModal';
import ViewAutoDistributionConfigModal from './modal/ViewAutoDistributionConfigModal';

type DistributionConfigurationListProps = {
    search: AutoDistributionSettingsFilterModel;
    loading: boolean;
    setLoading: (e: any) => void;
};

const DistributionConfigurationList = ({
    search,
    loading,
    setLoading,
}: DistributionConfigurationListProps) => {
    const gridRef: any = useRef();
    const { getDistributionConfigList, autoDistributionConfigList, autoDistributionConfigTotalCount, generateParam, 
            getUserConfigurationTotalCount, userConfigurationTotalCount, configurationTotalCount } = useAutoDistributionSettingHooks();
    const { successResponse, ReMAutoDistributionConstants, SwalSuccessMessage, SwalServerErrorMessage } = useConstant();
    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string;
    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number;

    const [modalShow, setModalShow] = useState<boolean>(false);
    const [addModalShow, setAddModalShow] = useState<boolean>(false);
    const [editModalShow, setEditModalShow] = useState<boolean>(false);
    const [viewModalShow, setViewModalShow] = useState<boolean>(false);
    const [selectedConfigurationId, setSelectedConfigurationId] = useState<number>(0);
    const [searchFilter, setSearchFilter] = useState<any>();

    // Grid pagination states
    const [pageSize, setPageSize] = useState<number>(DefaultPageSetup.pageSizeDefault);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortOrder, setSortOrder] = useState<string>('');
    const [sortColumn, setSortColumn] = useState<string>('');

    useEffect (() => {
        getUserConfigurationTotalCount(userAccessId);
    },[])

    useEffect(() => {
        if (search !== undefined) {
            handleConfigPaginationLoad(1, 10, "", "");
        }
    }, [search]);

    useEffect(() => {
        if (autoDistributionConfigList) {
            setLoading(false);
        }
    }, [autoDistributionConfigList])

    useEffect(() => {
        if (!loading && autoDistributionConfigList.length === 0) {
            if (document.getElementById('auto-distribution-configuration-list')?.querySelector('#mlab-grid-loading-overlay') as HTMLInputElement) {
                (document.getElementById('auto-distribution-configuration-list')?.querySelector('#mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
            }
        } else if (document.getElementById('auto-distribution-configuration-list')?.querySelector('#mlab-grid-loading-overlay') as HTMLInputElement) {
            (document.getElementById('auto-distribution-configuration-list')?.querySelector('#mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
        }
    }, [loading]);

    const handleConfigPaginationLoad = (_currentPage: number, _pageSize: number, _sortColumn: string, _sortOrder: string) => {
        const paginationAgent: PaginationModel = {
            currentPage: _currentPage,
            pageSize: _pageSize,
            offsetValue: (_currentPage - 1) * pageSize,
            sortColumn: _sortColumn,
            sortOrder: _sortOrder,
        }

        const requestConfigurationObj = generateParam(search, paginationAgent)
        setSearchFilter(requestConfigurationObj);
        getDistributionConfigList(requestConfigurationObj);
    }

    const deleteConfig = (val: any) => {
        swal({
            title: PROMPT_MESSAGES.ConfirmRemoveTitle,
            text: ReMAutoDistributionConstants.SwalReMAutoDistributionMessage.textDeleteConfirmation,
            icon: 'warning',
            buttons: ['No', 'Yes'],
            dangerMode: true,
        }).then(async (toConfirm) => {
            if (toConfirm) {
                const response: any = await DeleteAutoDistributionConfig(val.autoDistributionSettingId);
                if (response.status === successResponse) {
                    swal(SwalSuccessMessage.title, SwalSuccessMessage.textSuccess, SwalSuccessMessage.icon);
                } else {
                    swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
                }

                getDistributionConfigList(searchFilter);
            }
        });
    }

    const updateConfigStatus = (val: any) => {
        const title = val.status === true ? 'Inactive' : 'Active';
        swal({
            title: PROMPT_MESSAGES.ConfirmSubmitTitle,
            text: PROMPT_MESSAGES.ConfirmDeactivateActivateMessage(title),
            icon: 'warning',
            buttons: ['Cancel', 'Confirm'],
            dangerMode: true,
        }).then(async (willUpdate) => {
            if (willUpdate) {
                const requestObj : UpdateAutoDistributionConfigStatusRequestModel = {
                    autoDistributionSettingId: val.autoDistributionSettingId,
                    statusId: !(val.status),
                    userId: userAccessId
                }

                const response: any = await UpdateAutoDistributionConfigStatus(requestObj);
                if (response.status === successResponse) {
                    swal(SwalSuccessMessage.title, SwalSuccessMessage.textSuccess, SwalSuccessMessage.icon);
                } else {
                    swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
                }

                getDistributionConfigList(searchFilter);
            }
        });
    };

    const customCellAutoConfigurationDetailsRender = (params: any) => {
        return (
            <button type="button"
                className='btn-link cursor-pointer'
                style={{backgroundColor: 'transparent'}}
                onClick={() => viewAutoDistributionConfiguration(params.data.autoDistributionSettingId)}>
                {params.data.autoConfigurationName}
            </button>
        );
    };

    const customCellAutoConfigurationToggleStatusRender = (params: any) => {
        return (
            <Switch
                disabled={!userAccess.includes(USER_CLAIMS.RemAutoDistributionSettingWrite)}
                checked={params.data.status}
                onChange={() => updateConfigStatus(params.data)}
                handleDiameter={28}
                offColor='#E4E6EF'
                onColor='#3699FF'
                offHandleColor='#3699FF'
                onHandleColor='#b8bac1'
                height={30}
                width={100}
                borderRadius={6}
                uncheckedIcon={
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            fontSize: 12,
                            color: 'black',
                            paddingRight: 25,
                        }}
                    >
                        Inactive
                    </div>
                }
                checkedIcon={
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            fontSize: 12,
                            color: 'white',
                            paddingLeft: 25,
                        }}
                    >
                        Active
                    </div>
                }
                className='react-switch'
                id='small-radius-switch'
            />
        )
    }

    const customCellAutoConfigurationActionsRender = (params: any) => {
        return (
            <ButtonGroup aria-label='Action'>
                <div className='d-flex justify-content-center flex-shrink-0'>
                    <div className='me-4'>
                        <TableIconButton
                            access={true}
                            faIcon={faPencilAlt}
                            toolTipText={'Edit'}
                            onClick={() => editAutoDistributionConfiguration(params.data.autoDistributionSettingId)}
                            isDisable={params.data.status || !userAccess.includes(USER_CLAIMS.RemAutoDistributionSettingWrite)}
                        />
                    </div>
                    <div className='me-4'>
                        <TableIconButton
                            access={true}
                            faIcon={faTrash}
                            toolTipText={'Delete'}
                            iconColor={'text-danger'}
                            onClick={() => deleteConfig(params.data)}
                            isDisable={params.data.status || !userAccess.includes(USER_CLAIMS.RemAutoDistributionSettingWrite)}
                        />
                    </div>
                </div>
            </ButtonGroup>)
    }

    const configListColumnDefs = [
        {
            field: 'priorityId',
            headerName: 'Priority',
            cellRenderer: (params: any) => params.data.priorityId ?? '',
            minWidth: 150,
        },
        {
            field: 'autoConfigurationName',
            headerName: 'Auto Configuration Name',
            cellRenderer: customCellAutoConfigurationDetailsRender,
            minWidth: 400,
        },
        {
            field: 'status',
            headerName: 'Configuration Status',
            cellRenderer: customCellAutoConfigurationToggleStatusRender,
            minWidth: 300,
        },
        {
            field: 'action',
            headerName: 'Action',
            cellRenderer: customCellAutoConfigurationActionsRender,
            minWidth: 200,
        },
    ];

    const onGridReadyConfigList = (params: any) => {
        params.api.sizeColumnsToFit();
    };

    const onPageSizeChangedConfigList = () => {
        const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
        setPageSize(Number(value));
        setCurrentPage(1);

        if (autoDistributionConfigList != undefined && autoDistributionConfigList.length > 0) {
            handleConfigPaginationLoad(1, Number(value), sortColumn, sortOrder);
        }
    };

    const onClickFirstConfigList = () => {
        if (currentPage > 1) {
            setCurrentPage(1);
            handleConfigPaginationLoad(1, pageSize, sortColumn, sortOrder);
        }
    };

    const onClickPreviousConfigList = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            handleConfigPaginationLoad(currentPage - 1, pageSize, sortColumn, sortOrder);
        }
    };

    const onClickNextConfigList = () => {
        if (totalPage() > currentPage) {
            setCurrentPage(currentPage + 1);
            handleConfigPaginationLoad(currentPage + 1, pageSize, sortColumn, sortOrder);
        }
    };

    const onClickLastConfigList = () => {
        if (totalPage() > currentPage) {
            setCurrentPage(totalPage());
            handleConfigPaginationLoad(totalPage(), pageSize, sortColumn, sortOrder);
        }
    };

    const totalPage = () => {
        return Math.ceil(autoDistributionConfigTotalCount / pageSize) | 0;
    };

    const onSort = (e: any) => {
        if (autoDistributionConfigList != undefined && autoDistributionConfigList.length > 0) {
            const sortDetail = e.api.getSortModel();
            if (sortDetail[0] != undefined) {
                setSortColumn(sortDetail[0]?.colId);
                setSortOrder(sortDetail[0]?.sort);
                handleConfigPaginationLoad(currentPage, pageSize, sortDetail[0]?.colId, sortDetail[0]?.sort);
            } else {
                setSortColumn('');
                setSortOrder('');
                handleConfigPaginationLoad(currentPage, pageSize, '', '');
            }
        }
    };

    const changeConfigurationPriority = () => {
        setModalShow(true);
    }

    const closeModal = () => {
        setModalShow(false);
        getDistributionConfigList(searchFilter);
    }

    const addAutoDistributionConfiguration = () => {
        setAddModalShow(true);
    }

    const closeAddModal = () => {
        setAddModalShow(false);
    }

    const editAutoDistributionConfiguration = (configurationId: number) => {
        setEditModalShow(true);
        setSelectedConfigurationId(configurationId);
    }

    const closeEditModal = () => {
        setEditModalShow(false);
        getDistributionConfigList(searchFilter);
    }

    const viewAutoDistributionConfiguration = (configurationId: number) => {
        setViewModalShow(true);
        setSelectedConfigurationId(configurationId);
    }

    const closeViewModal = () => {
        setViewModalShow(false);
    }

    return (
        <FormGroupContainer>
            <div className='ag-theme-quartz' style={{ height: 400, width: '100%', marginBottom: '50px' }} id='auto-distribution-configuration-list'>
                <AgGridReact
                    rowData={autoDistributionConfigList}
                    defaultColDef={{
                        sortable: true,
                        resizable: true,
                    }}
                    suppressCopyRowsToClipboard={true}
                    onGridReady={onGridReadyConfigList}
                    rowBuffer={0}
                    enableRangeSelection={true}
                    pagination={false}
                    paginationPageSize={pageSize}
                    columnDefs={configListColumnDefs}
                    overlayNoRowsTemplate={gridOverlayNoRowsTemplate}
                    onSortChanged={(e) => onSort(e)}
                    ref={gridRef}
                />
                <DefaultGridPagination
                    recordCount={autoDistributionConfigTotalCount}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onClickFirst={onClickFirstConfigList}
                    onClickPrevious={onClickPreviousConfigList}
                    onClickNext={onClickNextConfigList}
                    onClickLast={onClickLastConfigList}
                    onPageSizeChanged={onPageSizeChangedConfigList}
                />
            </div>
            <ButtonsContainer>
                <MlabButton
                    access={true}
                    label='Add New Configuration'
                    style={ElementStyle.primary}
                    type={'button'}
                    weight={'solid'}
                    onClick={addAutoDistributionConfiguration}
                    disabled={!userAccess.includes(USER_CLAIMS.RemAutoDistributionSettingWrite) || userConfigurationTotalCount > ReMAutoDistributionConstants.maxConfigPerUserId }
                />
                <MlabButton
                    type={'button'}
                    weight={'solid'}
                    style={ElementStyle.primary}
                    access={true}
                    label={'Change Priority'}
                    onClick={changeConfigurationPriority}
                    disabled={!userAccess.includes(USER_CLAIMS.RemAutoDistributionSettingWrite) || configurationTotalCount < 2}
                />
            </ButtonsContainer>
            <ReorderConfigDistributionPriorityModal showForm={modalShow} closeModal={closeModal} />
            <AddAutoDistributionConfigModal  showForm={addModalShow} closeModal={closeAddModal} />
            <EditAutoDistributionConfigModal  showForm={editModalShow} closeModal={closeEditModal} selected={selectedConfigurationId}/>
            <ViewAutoDistributionConfigModal  showForm={viewModalShow} closeModal={closeViewModal} selected={selectedConfigurationId} />
        </FormGroupContainer>
    );
};

export default DistributionConfigurationList;
