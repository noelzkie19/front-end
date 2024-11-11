import { faPencilAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { AgGridReact } from "ag-grid-react";
import { Guid } from "guid-typescript";
import { useEffect, useState } from "react";
import { ButtonGroup, OverlayTrigger, Tooltip } from "react-bootstrap-v5";
import { RestrictionFields } from "../../../../constants/Constants";
import { ButtonsContainer, DefaultButton, FormGroupContainer, TableIconButton } from "../../../../custom-components";
import CommonLookups from "../../../../custom-functions/CommonLookups";
import { TeamDataAccessRestrictionListModel } from "../../models/TeamDataAccessRestrictionListModel";
import { TeamDataAccessRestrictionModel } from "../../models/TeamDataAccessRestrictionModel";
import { TeamRestrictionRequestModel } from "../../models/TeamRestrictionRequestModel";
import CreateTeamRestriction from "./CreateTeamRestriction";
import swal from 'sweetalert';
import { useSystemOptionHooks } from "../../../system/shared";
import { useHistory } from "react-router-dom";

interface Props {
    stateTeamRestriction: (e: Array<TeamDataAccessRestrictionModel>) => void
    operatorList: Array<any>
    teamId?: number
    teamRestrictionDetailsResponse?: Array<TeamRestrictionRequestModel>
}

const TeamDataAccessRestrictionGrid: React.FC<Props> = ({ stateTeamRestriction, operatorList, teamId, teamRestrictionDetailsResponse }) => {
    const vipLevelList = CommonLookups('vipLevels');
    const countryList = CommonLookups('countries').filter(_ => _.label !== null);
    const {getCurrencyOptions,getBrandOptions, brandOptionList,currencyOptionList} = useSystemOptionHooks();

    const [rowData, setRowData] = useState<Array<any>>([]);
    const [gridApi, setGridApi] = useState<any>(null);
    const [pageSize, setPageSize] = useState<number>(100);
    const [restrictionModalShow, setRestrictionModalShow] = useState<boolean>(false);
    const [isAddRestriction, setIsAddRestriction] = useState<boolean | null>(null);
    const [teamRestrictionDetails, setTeamRestrictionDetails] = useState<Array<TeamDataAccessRestrictionModel>>([]);
    const [operatorOptionList, setOperatorOptionList] = useState<Array<any>>(operatorList);
    const [selectedOperatorRestriction, setSelectedOperatorRestriction] = useState<TeamDataAccessRestrictionModel>();
    const history = useHistory();
    
    const confirmExit = () => 
    {
        return true;
    }
    window.onbeforeunload = confirmExit;
    useEffect(() => {
        history.block((prompt: any) => {
            alertNavigateAway(prompt.pathname);
            return false;
        });
        return () => {

            window.onbeforeunload = function (event) {
                return;
            };
        };
    }, [history]);
    const alertNavigateAway = (promptNamePath: any) => {
        swal({
            title: 'Confirmation',
            text: 'Any changes will be discarded, please confirm',
            icon: 'warning',
            buttons: ['No', 'Yes'],
            dangerMode: true,
        }).then((confirmSave) => {
            if (confirmSave) {
                history.block(() => { });
                history.push(promptNamePath);
            }
        });
    };

    useEffect(() => {
        getBrandOptions();
        getCurrencyOptions();
    }, []);

    useEffect(() => {
        if (operatorList.length > 0) {
            setOperatorOptionList(operatorList)
        }
    }, [operatorList]);

    useEffect(() => {
        if (teamRestrictionDetails.length > 0) {
            setOperatorOptionList((prevOperatorList) =>
                operatorList.filter((val) =>
                    teamRestrictionDetails.every(
                        (e) => val.value.toString() !== e.operatorId?.toString()
                    )
                )
            );
        } else {
            setOperatorOptionList(operatorList)
        }
    }, [teamRestrictionDetails]);

    useEffect(() => {
        mapToGrid();
    }, [teamRestrictionDetailsResponse]);

    const mapToGrid = () => {
        const teamDataAccessModel: Array<TeamDataAccessRestrictionModel> = [];
        gridApi?.showNoRowsOverlay()
        teamRestrictionDetailsResponse?.forEach(tr => {
            const operatorId = tr.operatorId.toString();
            const operatorName = operatorList.find(op => op.value === tr.operatorId)?.label ?? '';
            const accessRestrictionModel: TeamDataAccessRestrictionModel = {
                brands: [],
                countries: [],
                currencies: [],
                vipLevels: [],
                operatorId,
                teamRestrictionId: Guid.create().toString(),
                operatorName,
            };

            //push to list of teamDataAccess and check if exist 
            if (!teamDataAccessModel.some(a => a.operatorId === operatorId)) {
                teamDataAccessModel.push(accessRestrictionModel);
            }
            switch (tr.accessRestrictionFieldId) {
                case RestrictionFields.Brand:
                    teamDataAccessModel.find(a => a.operatorId === operatorId)?.brands.push(mapRestrictionReponseToLookUpModel(tr, brandOptionList));
                    break;
                case RestrictionFields.Currency:
                    teamDataAccessModel.find(a => a.operatorId === operatorId)?.currencies.push(mapRestrictionReponseToLookUpModel(tr, currencyOptionList));
                    break;
                case RestrictionFields.Country:
                    teamDataAccessModel.find(a => a.operatorId === operatorId)?.countries.push(mapRestrictionReponseToLookUpModel(tr, countryList));
                    break;
                case RestrictionFields.VipLevel:
                    teamDataAccessModel.find(a => a.operatorId === operatorId)?.vipLevels.push(mapRestrictionReponseToLookUpModel(tr, vipLevelList));
                    break;
                default:
                    break;
            }
        });

        const _rowData: Array<TeamDataAccessRestrictionListModel> = teamDataAccessModel.map(({ teamRestrictionId, ...rest }) =>
            createTeamDataAccessRestriction(teamRestrictionId, rest)
        );

        setTeamRestrictionDetails(teamDataAccessModel);
        stateTeamRestriction(teamDataAccessModel);
        setRowData(_rowData);
    };


    const mapRestrictionReponseToLookUpModel = (_val: any, _optionList: Array<any>) => {
        return {
            label: _optionList.find(a => Number(a.value) === Number(_val.accessRestrictionFieldValue))?.label,
            value: _val.accessRestrictionFieldValue.toString() ?? ""
        }
    }
    const addDataAccessRestriction = () => {
        setSelectedOperatorRestriction(undefined)
        setIsAddRestriction(true);
        setRestrictionModalShow(true);
    };
    const removeRestriction = (id: any) => {
        swal({
			title: 'Confirmation',
			text: 'This action will remove the record, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willDelete) => {
			if (willDelete) {
                let _rowsData = rowData.filter(a => a.operatorId.toString() !== id.toString());
                let _teamRestrictionDetails = teamRestrictionDetails.filter(a => a.operatorId !== id);
                setTeamRestrictionDetails(_teamRestrictionDetails);
                stateTeamRestriction(_teamRestrictionDetails);
                setRowData(_rowsData);
			}
		});
    }
   
    const vipLevelCellRenderer = (vipLevelParams: any) => 
        <>
            {
                cellRendererOverlay(vipLevelParams.data.vipLevels)
            }
        </>
    ;
    const currencyCellRenderer = (currenciesParams: any) => 
        <>
            {
                cellRendererOverlay(currenciesParams.data.currencies)
            }
        </>
    
    const countryCellRenderer = (countriesParams: any) => 
        <>
            {
                cellRendererOverlay(countriesParams.data.countries)
            }
        </>
    
    const brandCellRenderer = (brandParams: any) => 
        <>
            {
                cellRendererOverlay(brandParams.data.brands)
            }
        </>
    
    const cellRendererOverlay = (params: any) => (
        <>
            {params !== "" ? (
                <>
                    <OverlayTrigger
                        placement='right'
                        delay={{ show: 250, hide: 400 }}
                        overlay={<Tooltip id='button-tooltip-2'>{params}</Tooltip>}
                    >
                        <button type='button' className='btn btn-outline-primary btn-sm'>
                            View
                        </button>
                    </OverlayTrigger>
                </>
            ) : (
                <>
                    <span>No Restriction</span>
                </>
            )}
        </>
    )
    const tableIconCellRenderer = (params: any) => (
        <>
            {params.data.id !== 0 ? (
                <ButtonGroup aria-label='Basic example'>
                    <div className='d-flex justify-content-center flex-shrink-0'>
                        <div className='me-4'>
                            <TableIconButton
                                access={true}
                                faIcon={faPencilAlt}
                                isDisable={params.data.isActive === true}
                                toolTipText={'Edit'}
                                onClick={() => editRestriction(params.data.teamRestrictionId)}
                            />
                        </div>
                    </div>
                    <div className='d-flex justify-content-center flex-shrink-0'>
                        <div className='me-4'>
                            <TableIconButton
                                access={true}
                                faIcon={faTrash}
                                isDisable={params.data.isActive === true}
                                toolTipText={'Delete'}
                                onClick={() => removeRestriction(params.data.operatorId)}
                            />
                        </div>
                    </div>
                </ButtonGroup>
            ) : null}
        </>
    )
    const columnDefs = [
        {
            headerName: 'Operator',
            field: 'operatorName',
            minWidth: 120,

        },
        {
            headerName: 'Brand',
            field: 'brands',
            minWidth: 80,
            cellRenderer: brandCellRenderer
        },
        {
            headerName: 'Currency',
            field: 'currencies',
            minWidth: 80,
            cellRenderer: currencyCellRenderer

        },
        {
            headerName: 'VIP Level',
            field: 'vipLevels',
            minWidth: 80,
            cellRenderer: vipLevelCellRenderer
        },
        {
            headerName: 'Country',
            field: 'countries',
            minWidth: 80,
            cellRenderer: countryCellRenderer

        },
        {
            headerName: 'Action',
            field: 'operatorName',
            minWidth: 80,
            sortable: false,
            cellRenderer:tableIconCellRenderer
        },
    ];

    const isNewOperatorRestriction = (val: any) => {
        return rowData.length === 0 ||
            val.teamRestrictionId === ""
    };
    const addTeamRestriction = (val: TeamDataAccessRestrictionModel) => {
        const isNew = isNewOperatorRestriction(val)
        const _teamRestrictionId = isNew ? Guid.create().toString() : val.teamRestrictionId
        const temp = createTeamDataAccessRestriction(_teamRestrictionId, val);

        if (isNew) {
            val.teamRestrictionId = temp.teamRestrictionId;
            setRowData([...rowData, temp]);
            setTeamRestrictionDetails([...teamRestrictionDetails, val]);
            stateTeamRestriction([...teamRestrictionDetails, val])
        } else {
            const newTeamRestrictionDetails = mapTeamRestrictionDetails(val);
            const newRowData = mapRowData(rowData, val);
            setRowData(newRowData);
            setTeamRestrictionDetails(newTeamRestrictionDetails);
            stateTeamRestriction(newTeamRestrictionDetails);
        }
    }
    const addTeamRestrictionByModal = (val: TeamDataAccessRestrictionModel) => {
        setRestrictionModalShow(false);
        setIsAddRestriction(null)
        addTeamRestriction(val);
    };
    const createTeamDataAccessRestriction = (teamRestrictionId: string, val: any) => {
        const temp: TeamDataAccessRestrictionListModel = {
            teamRestrictionId: teamRestrictionId,
            operatorId: val.operatorId ?? "",
            operatorName: val.operatorName ?? "",
            currencies: val.currencies?.map((el: any) => el.label).join(',') ?? "",
            brands: val.brands?.map((el: any) => el.label).join(',') ?? "",
            vipLevels: val.vipLevels?.map((el: any) => el.label).join(',') ?? "",
            countries: val.countries?.map((el: any) => el.label).join(',') ?? "",
        };

        return temp;
    }
    const mapRowData = (rowData: TeamDataAccessRestrictionListModel[], _val: any) => {
        return rowData.map((c) => {
            if (c.teamRestrictionId === _val.teamRestrictionId) {
                c.operatorId = _val.operatorId;
                c.operatorName = _val.operatorName;
                c.teamRestrictionId = _val.teamRestrictionId;
                c.currencies = _val.currencies?.map((el: any) => el.label).join(',') ?? "";
                c.brands = _val.brands?.map((el: any) => el.label).join(',') ?? "";
                c.vipLevels = _val.vipLevels?.map((el: any) => el.label).join(',') ?? "";
                c.countries = _val.countries?.map((el: any) => el.label).join(',') ?? "";
            }
            return c;
        });
    };

    const mapTeamRestrictionDetails = (_val: any) => {
        return teamRestrictionDetails.map((c) => {
            if (c.teamRestrictionId === _val.teamRestrictionId) {
                c.operatorId = _val.operatorId
                c.operatorName = _val.operatorName;
                c.currencies = _val.currencies;
                c.brands = _val.brands;
                c.vipLevels = _val.vipLevels;
                c.countries = _val.countries;
            }
            return c;
        });
    };

    const editRestriction = (id: any) => {
        setSelectedOperatorRestriction(rowData.find(_ => _.teamRestrictionId === id));
        setRestrictionModalShow(true);
        setIsAddRestriction(false);
    };
    const onAddModalClose = () => {
        setRestrictionModalShow(false);
        setIsAddRestriction(null);
    };

    const onGridReady = (params: any) => {
        setGridApi(params.api);
        setPageSize(100)
        params.api.paginationGoToPage(4);
        params.api.sizeColumnsToFit();
    };
    const tableLoader = (data: any) => {
        return (
            <div className='ag-custom-loading-cell' style={{ paddingLeft: '10px', lineHeight: '25px' }}>
                <i className='fas fa-spinner fa-pulse'></i> <span> {data.loadingMessage}</span>
            </div>
        );
    };
    return <>
        <div className="separator border-4 my-10" />
        <h6 className='fw-bolder m-0'>Data Access Restriction</h6>
        <br />
        <ButtonsContainer>
            <DefaultButton
                access={true}
                title={'Add'}
                onClick={() => addDataAccessRestriction()}
            />
        </ButtonsContainer>
        <br/>
        <br/>
        {rowData.length  === 0 && <h6 className='fw-bolder mt-3'>No Data Access Restriction</h6>}
        {rowData.length > 0 && 
        <FormGroupContainer>
            <div className='ag-theme-quartz topicList-table' style={{ height: 400, width: '100%' }}>
                <AgGridReact
                    rowData={rowData}
                    defaultColDef={{
                        sortable: true,
                        resizable: true,
                    }}
                    onGridReady={onGridReady}
                    components={{
                        tableLoader: tableLoader,
                    }}
                    //enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
                    animateRows={true}
                    rowBuffer={20}
                    pagination={false}
                    paginationPageSize={pageSize}
                    columnDefs={columnDefs}
                />
            </div>
        </FormGroupContainer>
        }
        <CreateTeamRestriction
            showForm={restrictionModalShow}
            setModalShow={setRestrictionModalShow}
            isAdd={isAddRestriction}
            submitAdd={addTeamRestrictionByModal}
            closeModal={onAddModalClose}
            teamDataAccess={teamRestrictionDetails}
            selectedOperatorToEdit={selectedOperatorRestriction}
            operatorOptions={operatorOptionList}
        />
    </>
}

export default TeamDataAccessRestrictionGrid;
