import {faCircleNotch, faLink, faTrash, faUnlink} from '@fortawesome/free-solid-svg-icons';
import {Guid} from 'guid-typescript';
import {useEffect, useRef, useState} from 'react';
import {ButtonGroup} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {OptionListModel} from '../../../../common/model';
import useConstant from '../../../../constants/useConstant';
import {BasicFieldLabel, ButtonsContainer, ContentContainer, FormGroupContainer, FormHeader, GridWithLoaderAndPagination, MainContainer, MlabButton, RequiredLabel, TableIconButton} from '../../../../custom-components';
import {useBrands, useCurrencies, useMasterReferenceOption, useVIPLevels} from '../../../../custom-functions';
import {DefaultPageSetup} from '../../../system/components/constants/PlayerConfigEnums';
import {LeadsRequest} from '../models/LeadsRequest';
import {SearchLeadsResponseModel} from '../models/SearchLeadsResponseModel';
import {GetAllSourceBOT, GetLeadSelectionByFilter, GetLeadsByFilter, GetLeadsByFilterResult, LinkUnlinkPlayer, RemoveLead} from '../services/SearchLeadsService';
import LinkingModal from './LinkingModal';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useHistory} from 'react-router-dom';
import useFnsDateFormatter from '../../../../custom-functions/helper/useFnsDateFormatter';
import useCountryWithAccessRestriction from '../../../../custom-functions/useCountryWithAccessRestriction';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {LeadsResponse} from '../models/LeadsResponse';
import { ElementStyle } from '../../../../constants/Constants';
import { BroadcastConfigurationRecipientModel } from '../../../campaign-management/models/request/BroadcastConfigurationRecipientModel';

const generateArrayOfObjects = (count:number) => {
    const array = [];
    for (let i = 1; i < count; i++) {
      const obj = {
        broadcastConfigurationRecipientId: i,
        broadcastConfigurationId: '',
        leadId: i,
        leadName: 'lead ' + 1,
        recipientType: 'Customer',
        playerId: i,
        username: 'Username_'+i,
        brand: 'M88',
        currency: 'MYR',
        vipLevel: 'Verified-R30',
        broadcastResultId: '',
        broadcastResult: 'Pending',
        broadcastResultReason:''
      };
      array.push(obj);
    }
    return array;
  };
export const SearchLeads = () => {
    const gridRef: any = useRef();
    const [pageSize, setPageSize] = useState<number>(DefaultPageSetup.pageSizeDefault);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('DESC');
	const [sortColumn, setSortColumn] = useState<string>('LeadId');
	const [loading, setLoading] = useState(false);
	const [showForm, setShowForm] = useState<boolean>(false);
    const {mlabFormatDate} = useFnsDateFormatter();
    
	const {successResponse, HubConnected, SearchLeadsConstants} = useConstant();
    const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
    const history = useHistory();
    
    // Search Fields
    const [name, setName] = useState<string>('')
    const [linkedPlayer, setLinkedPlayer] = useState<string>('')
    const [stage, setStage] = useState<Array<OptionListModel>>([])
    const [source, setSource] = useState<OptionListModel | null>()
    const [brands, setBrands] = useState<Array<OptionListModel>>([])
    const [currencies, setCurrencies] = useState<Array<OptionListModel>>([])
    const [countries, setCountries] = useState<Array<OptionListModel>>([])
    const [vipLevels, setVIPLevels] = useState<Array<OptionListModel>>([])  
    const [leadsResult, setLeadsResult] = useState<Array<LeadsResponse>>([])  

    // modal params
    const [selectedLeadIdToLink, setSelectedLeadIdToLink] = useState<string>('')
    const [selectedLeadNameToLink, setSelectedLeadNameToLink] = useState<string>('')
    const [currentPlayerIdLinked, setCurrentPlayerIdLinked] = useState<string>('')
    const [currentPlayerUsernameLinked, setCurrentPlayerUsernameLinked] = useState<string>('')
    const [currentMlabPlayerIdLinked, setCurrentMlabPlayerIdLinked] = useState<number>(0)
    const [currentPlayerUsernameBrandConcatLinked, setCurrentPlayerUsernameBrandConcatLinked] = useState<string>('')

    // dropdown values with data access restricction
    const brandList = useBrands(userAccessId);
    const currencyList = useCurrencies(userAccessId); 
    const vipLevelList = useVIPLevels(userAccessId);
    const countryList = useCountryWithAccessRestriction(userAccessId); 
    const masterReference = useMasterReferenceOption(`${SearchLeadsConstants.ChartPortalStatusMasterRefId},${SearchLeadsConstants.ChartPortalStatusMasterRefId}`);
	const leadStageOptions = masterReference
		.filter((obj) => obj.masterReferenceParentId === parseInt(SearchLeadsConstants.ChartPortalStatusMasterRefId))
		.map((obj) => obj.options);
    const [sourceBOTOptionList, setSourceBOTOptionList] = useState<Array<OptionListModel> | null>();
    const [reloadPage, setReloadPage] = useState<boolean>(false);

    //Broadcast
    const [selectedLeads,setSelectedLeads] = useState<Array<number>>([]);
    const key=Guid.create().toString();

    // effects
    useEffect(() => {
        if(userAccess?.includes(USER_CLAIMS.SearchLeadsRead) || userAccess?.includes(USER_CLAIMS.SearchLeadsWrite))			
            getAllSourceBOTList()
        else
        {
            history.push('/error/401');
        }
    }, [])

    useEffect(() => {
        if (reloadPage) {
            loadSearchLeads()
            setReloadPage(false)    //reset value
        }
    }, [reloadPage])
    
	useEffect(() => {
		if (!loading && leadsResult?.length === 0) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
			}
		} else if (loading) {
			if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
				(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'Please wait while your items are loading';
			}
		}
	}, [loading]);

    const getAllSourceBOTList = async () =>{
        try {
            const response = await GetAllSourceBOT();
            if (response.status === successResponse) {
                setSourceBOTOptionList(response.data);
            }
        } catch (error) {
            console.error('Error fetching source BOT list:', error);
        }
    }

    const onChangeSelectedBrand = (value: Array<OptionListModel>) => {
        setBrands(value)
    }

    const onChangeSource = (value: OptionListModel) => {
        setSource(value)
    }

    const handleLinkPlayer = (data: any) => {
		setShowForm(true);
        setSelectedLeadIdToLink(data?.leadId)
        setSelectedLeadNameToLink(data?.leadName)
        setCurrentPlayerIdLinked(data?.linkedPlayerId)
        setCurrentPlayerUsernameLinked(data?.linkedPlayerUsername)
        setCurrentPlayerUsernameBrandConcatLinked(data?.linkedPlayerUserNameBrandConcat)
        setCurrentMlabPlayerIdLinked(data?.linkedMlabPlayerId)
	};

    const handleCurrencyChange = (val:  Array<OptionListModel>) => {
		setCurrencies(val);
	};

    const handleVIPLevelChange = (val:  Array<OptionListModel>) => {
		setVIPLevels(val);
	};

    const handleCountryChange = (val:  Array<OptionListModel>) => {
		setCountries(val);
	};

    const clearSearchFields = () => {

        setName('')
        setLinkedPlayer('')
        setStage([]);
        setSource(null);
        setBrands([]);
        setCurrencies([]);  
        setCountries([]);
        setVIPLevels([]);

    }

    const onSelectionChanged = () => {
        const test = leadsResult.map((d:any)=>d.leadId);
		const currentSelection = gridRef?.current?.api?.getSelectedRows();
        
        const toInsertIds = currentSelection.map((d:any)=>d.leadId);
        const toRemoveIds = test.filter((n:number)=>!toInsertIds.includes(n));

        toInsertIds.forEach((element:any) => {
            let s = selectedLeads.filter(d=>d == element);
            if(s.length == 0){
                selectedLeads.push(element);
            }
        });

        let filteredNumbers: number[] = selectedLeads.filter(number => !toRemoveIds.includes(number));
        setSelectedLeads(filteredNumbers)
	};
    
    const actionButtonElem = (params: any) => {
		const {data} = params;
		return (
			<ButtonGroup aria-label='Basic example'>
				<div className='d-flex justify-content-center flex-shrink-0'>
				
                    {data?.linkedMlabPlayerId > 0 ? (
                        <>
                        <div className="me-4">
                            { (
                                <button 
                                data-bs-trigger="hover" 
                                data-bs-toggle="popover" 
                                title="Edit Linked Player" 
                                style={{cursor: `${userAccess.includes(USER_CLAIMS.SearchLeadsWrite) ? "pointer" : "not-allowed"}`,
                                        background: 'none',
                                        border: 'none', 
                                        padding: '0', 
                                        margin: '0', 
                                        overflow:'visible'                                        
                                    }} 
                                disabled={!userAccess.includes(USER_CLAIMS.SearchLeadsWrite)}
                                onClick={() => {handleLinkPlayer(data)}}
                            >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 27 27" fill="none">
                                        <path fill={`${userAccess.includes(USER_CLAIMS.SearchLeadsWrite) ? "#009ef7" : "#ccc"}`} d="M9.9993 5.74992C9.9993 5.33575 9.66354 5 9.24936 5H6.99956L6.75003 5.00612C4.10478 5.13614 2 7.32202 2 9.99948C2 12.7606 4.23838 14.999 6.99956 14.999H9.24936L9.36018 14.9908C9.72181 14.9373 9.9993 14.6256 9.9993 14.249C9.9993 13.8349 9.66354 13.4991 9.24936 13.4991H6.99956L6.79393 13.4932C4.95681 13.3867 3.49987 11.8632 3.49987 9.99948C3.49987 8.06669 5.06673 6.49984 6.99956 6.49984H9.24936L9.36018 6.49171C9.72181 6.43815 9.9993 6.12644 9.9993 5.74992ZM21.9982 9.99948C21.9982 7.23834 19.7599 5 16.9987 5H14.7489L14.6381 5.00813C14.2764 5.06169 13.9989 5.3734 13.9989 5.74992C13.9989 6.16409 14.3347 6.49984 14.7489 6.49984H16.9987L17.2043 6.50579C19.0414 6.61223 20.4984 8.13571 20.4984 9.99948C20.4984 10.0309 20.498 10.0623 20.4971 10.0936C21.0146 10.22 21.5073 10.4736 21.9254 10.8546C21.9733 10.5768 21.9982 10.291 21.9982 9.99948ZM16.9987 9.24956H6.99956L6.8978 9.25641C6.53175 9.30606 6.24963 9.61983 6.24963 9.99948C6.24963 10.4137 6.58538 10.7494 6.99956 10.7494H16.9987L17.1004 10.7426C17.4665 10.6929 17.7486 10.3791 17.7486 9.99948C17.7486 9.58531 17.4129 9.24956 16.9987 9.24956ZM18.0984 11.6688L12.1965 17.5706C11.8524 17.9147 11.6083 18.3458 11.4903 18.8179L11.0327 20.6484C10.8336 21.4445 11.5547 22.1656 12.3508 21.9666L14.1813 21.5089C14.6534 21.3909 15.0846 21.1468 15.4287 20.8027L21.3306 14.9009C22.2231 14.0084 22.2231 12.5613 21.3306 11.6688C20.4381 10.7762 18.991 10.7762 18.0984 11.6688Z" />
                                    </svg>
                                </button>
                            )}                          
                        </div>
                         <div className='me-4'>
                            <TableIconButton
                                    access={true}
                                    faIcon={faUnlink}
                                    toolTipText={'Unlink Player'}
                                    onClick={() => handleUnlinkPlayer(data?.leadId)}
                                    isDisable={!userAccess.includes(USER_CLAIMS.SearchLeadsWrite)}
                                />
                        
                            </div>
                        </>
                       
                    )
                    : (
                        <div className='me-4'>
                            <TableIconButton
                                access={true}
                                faIcon={faLink}
                                toolTipText={'Link to a Player'}
                                onClick={()=> {handleLinkPlayer(data)}}
                                isDisable={!userAccess.includes(USER_CLAIMS.SearchLeadsWrite)}
                            />                        
                        </div>
                    )}
                    
                   
                    {data?.isPossibleDuplicate === 'True' && (
                        <div className='me-4'>   
                            <TableIconButton
                                    access={userAccess.includes(USER_CLAIMS.SearchLeadsWrite)}
                                    iconColor={'text-danger'}
                                    faIcon={faTrash}
                                    toolTipText={'Remove Lead'}
                                    onClick={() => handleRemoveLead(data?.leadId)}
                                    isDisable={false}
                                />
                        </div>
                    )}
                </div>
			</ButtonGroup>
		);
	};

   const handleUnlinkPlayer = async(leadId: number) => {
        swal({
            title: SearchLeadsConstants.SwalSearchLeadsMessage.titleConfirmation,
            text: SearchLeadsConstants.SwalSearchLeadsMessage.textConfirmUnlink,
            icon: SearchLeadsConstants.SwalSearchLeadsMessage.iconWarning,
            buttons: [SearchLeadsConstants.SwalSearchLeadsMessage.btnNo, SearchLeadsConstants.SwalSearchLeadsMessage.btnYes],
            dangerMode: true,
        }).then((willUnlink) => {
            if (willUnlink) {
                processUnlinkPlayer(leadId, 0)
                
            }
        });
   }
      
   const processUnlinkPlayer =  (leadId: number, linkedMlabPlayerId: number) => {

        setTimeout(() => {
            LinkUnlinkPlayer(leadId, linkedMlabPlayerId, userAccessId).then((response) =>{
                if (response.status === successResponse) {
                    setShowForm(false)
                    loadSearchLeads()
                }
                else {
                    swal('problem encountered while unlinking player')
                }
            })
        }, 1000);
    } 

    const handleRemoveLead = (leadId: number) => {
        swal({
            title: SearchLeadsConstants.SwalSearchLeadsMessage.titleConfirmation,
            text: SearchLeadsConstants.SwalSearchLeadsMessage.textConfirmRemove,
            icon: SearchLeadsConstants.SwalSearchLeadsMessage.iconWarning,
            buttons: [SearchLeadsConstants.SwalSearchLeadsMessage.btnNo, SearchLeadsConstants.SwalSearchLeadsMessage.btnYes],
            dangerMode: true,
        }).then((willRemove) => {
            if (willRemove) {
                removeLead(leadId)
            }
        });
    }

    const removeLead = (leadId: number) => {
        setTimeout(() => {
            RemoveLead(leadId).then((response) =>{
                if (response.status === successResponse) {                    
                    loadSearchLeads()
                    
                }
                else {
                    swal('problem encountered while removing lead')
                }
            })
        }, 1000);
    }

    const columnDefs = [
		{
            headerName: '', 
            field: 'leadId', 
            autoWidth: true, 
            width:50,
            headerCheckboxSelection: true, 
            checkboxSelection: (params:any)=>{
                console.log(params.data.telegramSubscriptionName,params.data.telegramChatStatus)
                if(params.data.telegramSubscriptionName == 'Subscribed' && params.data.telegramChatStatus=='Active' ){
                    return true;
                }
                return false;
            },
            cellRenderer: (params:any)=>{
                const exists: boolean = selectedLeads.includes(params.data.leadId);
                if(exists) params.node.setSelected(true);
            }
        },
        {headerName: 'ID', field: 'leadId', autoWidth: true, width:80},
		{headerName: 'Name', field: 'leadName', autoWidth: true, width:150},
		{headerName: 'Stage', field: 'stageName', autoWidth: true},
        {headerName: 'Source', field: 'sourceName', width: 100},
        {headerName: 'Telegram ID', field: 'telegramId', width: 150},
        {headerName: 'Telegram Type', field: 'telegramTypeName', width: 150},
        {headerName: 'Telegram Subscription', field: 'telegramSubscriptionName', width: 180},
        {headerName: 'Telegram Username', field: 'telegramUsername', width: 180},
        {headerName: 'Telegram Chat ID', field: 'telegramChatId', width: 150},
        {headerName: 'Telegram Chat Status', field: 'telegramChatStatus', width: 180},
        {headerName: 'Linked Player', field: 'linkedPlayerUsername', width: 150},
        {headerName: 'Brand', field: 'brandName', width: 110},
        {headerName: 'Currency', field: 'currencyName', width: 120},
        {headerName: 'VIP Level', field: 'vipLevelName', width: 120},
        {headerName: 'Country', field: 'countryName', width: 120},
        {headerName: 'Possible Duplicate Flag', field: 'isPossibleDuplicate', width: 180, cellRenderer: (params: any) => params.data.isPossibleDuplicate === 'True' ? 'Yes' : 'No'},
        {headerName: 'Modified Date', field: 'updatedDate', width: 150, cellRenderer: (params: any) => mlabFormatDate(params.data.updatedDate)},
        {headerName: 'Modified By', field: 'updatedBy', width: 120},
		{headerName: 'Action', field: '', sortable: false, width: 150, cellRenderer: actionButtonElem},
	];

    const onSortLeads = (e: any) => {
		if (leadsResult != undefined && leadsResult.length > 0 ) {
			const sortDetail = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				loadSearchLeads(sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
				loadSearchLeads();
			}
		}
	};

    const onPaginationSearchClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			paginationSearchLeadsLoadList(pageSize, 1, sortColumn, sortOrder);
		}
	};

    const onPaginationSearchClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			paginationSearchLeadsLoadList(pageSize, currentPage - 1, sortColumn, sortOrder);
		}
	};

	const totalSearchLeadsPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};
	
	

	const onPaginationSearchClickNext = () => {
		if (totalSearchLeadsPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			paginationSearchLeadsLoadList(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onPaginationSearchClickLast = () => {
		if (totalSearchLeadsPage() > currentPage) {
			setCurrentPage(totalSearchLeadsPage());
			paginationSearchLeadsLoadList(pageSize, totalSearchLeadsPage(), sortColumn, sortOrder);
		}
	};

	
	const onPaginationSearchPageSizeChanged = () => {
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);
		if (leadsResult != undefined && leadsResult.length > 0) {
			paginationSearchLeadsLoadList(Number(value), 1, sortColumn, sortOrder);
		}
	};

    const paginationSearchLeadsLoadList = (_pageSize: number, _currentPage: number, _sortColumn: string, _sortOrder: string) => {
		loadSearchLeads(_sortColumn, _sortOrder, (_currentPage - 1) * _pageSize, _pageSize);
	};
    const submitSearch = () => {
        gridRef.current.api.resetColumnState();
        setSelectedLeads([]);
        if (source) {
            loadSearchLeads(sortColumn, sortOrder);
        }
        else
        {
            swal(SearchLeadsConstants.SwalSearchLeadsMessage.titleFailed,
                SearchLeadsConstants.SwalSearchLeadsMessage.requiredAllFields,
                SearchLeadsConstants.SwalSearchLeadsMessage.iconError);
        }
    }

    const loadSearchLeads = ( _sortColumn?: string, _sortOrder?: string,  _offsetValue?: number, _pageSize?: number) => {
		let request: LeadsRequest = {
            leadName: name,
            linkedPlayerUsername: linkedPlayer,
            stageIDs: stage.map((i: any) => i.value).join(','), 
			sourceId: source?.value ?? '',
            brandIDs: brands.map((i: any) => i.value).join(','), 
            currencyIDs: currencies.map((c: any) => c.value).join(','),
            countryIDs: countries.map((c: any) => c.value).join(',') ,
            vipLevelIDs: vipLevels.map((v: any) => v.value).join(','),


            pageSize: pageSize,
			offsetValue: (currentPage - 1) * pageSize,
			sortColumn: _sortColumn ?? sortColumn,
			sortOrder: _sortOrder ?? sortOrder,

			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};

		
		setLoading(true);
		setLeadsResult([]);
            setTimeout(() => {
                const messagingHub = hubConnection.createHubConnenction();
                messagingHub.start().then(() => {
                    if (messagingHub.state !== HubConnected) {
                        return;
                    }
                    processGetLeadsFilter(request, messagingHub)
                });
            }, 1000);
			
	};

    const processGetLeadsFilter = async (request: LeadsRequest, messagingHub: any) => {
        try {
            const response = await GetLeadsByFilter(request);
            
            if (response.status === successResponse) {
                messagingHub.on(request.queueId.toString(), async (message: any) => {
                    try {
                        const returnData = await GetLeadsByFilterResult(message.cacheId);
                        
                        if (returnData.status !== successResponse) {
                            swal('Failed', 'Error getting leads search result list', 'error');
                        } else {
                            let resultData = returnData.data as SearchLeadsResponseModel;
                            setLeadsResult(resultData.leadsResult);
                            setRecordCount(resultData.recordCount);
                        }
    
                        messagingHub.off(request.queueId.toString());
                        messagingHub.stop();
                        setLoading(false);
                    } catch {
                        setLoading(false);
                        swal('Failed', 'Problem getting search leads list', 'error');
                    }
                });
            } else {
                setLoading(false);
                swal('Failed', 'Problem getting search leads list', 'error');
            }
        } catch {
            setLoading(false);
            swal('Failed', 'Problem getting search leads list', 'error');
        }
    }
    const generateGetLeadSelectionByFilterRequest=(_selectedLeads?:number[])=>{
        const ids = (selectedLeads.length > 0 ? selectedLeads.join(','):'');
        
        let request: LeadsRequest = {
            leadName: name,
            linkedPlayerUsername: linkedPlayer,
            stageIDs: stage.map((i: any) => i.value).join(','), 
			sourceId: source?.value ?? '',
            brandIDs: brands.map((i: any) => i.value).join(','), 
            currencyIDs: currencies.map((c: any) => c.value).join(','),
            countryIDs: countries.map((c: any) => c.value).join(',') ,
            vipLevelIDs: vipLevels.map((v: any) => v.value).join(','),
            leadIds: _selectedLeads 
                        ? 
                        _selectedLeads.join(',') : ids,

            pageSize: pageSize,
			offsetValue: (currentPage - 1) * pageSize,
			sortColumn: sortColumn,
			sortOrder: sortOrder,

			queueId: Guid.create().toString(),
			userId: userAccessId.toString(),
		};
        return request;
    }

    const handleOnChangeName = (data: any) => {
        setName(data.target.value);
    }

    const handleOnChangeLinkedPlayer = (data: any) => {
        setLinkedPlayer(data.target.value);
    }

    const handleOnChangeSelectedStage = (val: Array<OptionListModel>) => {
        setStage(val);
    }
    const onClickCreateBroadcast = ()=>{
        let request:LeadsRequest=generateGetLeadSelectionByFilterRequest();

        if(selectedLeads.length >= leadsResult.length){
            swal({
                title: SearchLeadsConstants.SwalSearchLeadsMessage.titleConfirmation,
                text: SearchLeadsConstants.SwalSearchLeadsMessage.textConfirmSelectAll,
                icon: SearchLeadsConstants.SwalSearchLeadsMessage.iconWarning,
                buttons: [SearchLeadsConstants.SwalSearchLeadsMessage.btnNo, SearchLeadsConstants.SwalSearchLeadsMessage.btnYes],
                dangerMode: true,
            }).then((willSelectAll) => {
    
                if (willSelectAll) { 
                    request = generateGetLeadSelectionByFilterRequest([]);
                    processClickCreateBroadcast(request);
                }
            });	
        }else{
            processClickCreateBroadcast(request)
        }        
	}
    const processClickCreateBroadcast = (request:LeadsRequest)=>{
        GetLeadSelectionByFilter(request)
        .then((response) => {
            if (response.status === successResponse){
                let results = response.data as BroadcastConfigurationRecipientModel[];
                localStorage.setItem(key,JSON.stringify(results));   
                window.open(`/campaign-management/create-broadcast/${key}`, '_blank');     
            } else {
                console.log('Problem in getting lead selection list');
            }
        })
        .catch(() => {
            console.log('Problem in getting lead selection  list');
        });
    }
  return (
    <MainContainer>
			<FormHeader headerLabel={'Search Leads'}  />
			<ContentContainer>
					<FormGroupContainer>
						<div className='col-lg-3'>
							<BasicFieldLabel title={'Name'} />
                            <div className='input-group'>
                                <input
                                    type='text'
                                    aria-autocomplete='none'
                                    autoComplete='off'
                                    className='form-control form-control-sm'
                                    aria-label='leads name'
                                    value={name}
                                    onChange={handleOnChangeName}
                                />
                            </div>
						</div>
                        <div className='col-lg-3'>
							<BasicFieldLabel title={'Linked Player'} />
                            <div className='input-group'>
                            <input
                                    type='text'
                                    aria-autocomplete='none'
                                    autoComplete='off'
                                    className='form-control form-control-sm'
                                    aria-label='linked-player'
                                    value={linkedPlayer}
                                    onChange={handleOnChangeLinkedPlayer}
                                />
                            </div>
						</div>
                        <div className='col-lg-3'>
							<BasicFieldLabel title={'Stage'} />
                            <div className='col-lg-12'>
                                <Select
                                    isMulti
                                    size="small"
                                    style={{ width: '100%' }}
                                    options={leadStageOptions}
                                    onChange={handleOnChangeSelectedStage}
                                    value={stage}
                                    isClearable={true}
                                    closeMenuOnSelect={false}
                                />
                            </div>
						</div>
                        <div className='col-lg-3'>
							<RequiredLabel title={'Source'} />
                            <div className='col-lg-12'>
                                    <Select
                                        autoComplete='off'
                                        size='small'
                                        style={{width: '100%'}}
                                        options={sourceBOTOptionList}
                                        onChange={onChangeSource}
                                        value={source}
                                        isClearable={true}
                                    />
                            </div>
						</div>

					</FormGroupContainer>

                    <FormGroupContainer>
                    <div className='col-lg-3'>
							<BasicFieldLabel title={'Brand'} />
                            <div className='col-lg-12'>
                                <Select
                                    isMulti
                                    size="small"
                                    style={{ width: '100%' }}
                                    options={brandList}
                                    onChange={onChangeSelectedBrand}
                                    value={brands}
                                    isClearable={true}
                                    closeMenuOnSelect={false}
                                />
                            </div>
						</div>
                        <div className='col-lg-3'>
							<BasicFieldLabel title={'Currency'} />
                            <div className='col-lg-12'>
                                <Select
                                    isMulti
                                    size="small"
                                    style={{ width: '100%' }}
                                    options={currencyList}
                                    onChange={handleCurrencyChange}
                                    value={currencies}
                                    isClearable={true}
                                    closeMenuOnSelect={false}
                                />
                            </div>
						</div>
                        <div className='col-lg-3'>
							<BasicFieldLabel title={'VIP Level'} />
                            <div className='col-lg-12'>
                                <Select
                                    isMulti
                                    size="small"
                                    style={{ width: '100%' }}
                                    options={vipLevelList}
                                    onChange={handleVIPLevelChange}
                                    value={vipLevels}
                                    isClearable={true}
                                    closeMenuOnSelect={false}
                                />
                            </div>
						</div>
                        <div className='col-lg-3'>
							<BasicFieldLabel title={'Country'} />
                            <div className=''>
                                    <Select
                                        isMulti
                                        autoComplete='off'
                                        size='small'
                                        style={{width: '100%'}}
                                        options={countryList}
                                        onChange={handleCountryChange}
                                        value={countries}
                                        isClearable={true}
                                        closeMenuOnSelect={false}
                                    />
                            </div>
						</div>
                    </FormGroupContainer>

                    <FormGroupContainer>
                        <ButtonsContainer>
                        {userAccess.includes(USER_CLAIMS.SearchLeadsRead) && (
                            <button type='submit' onClick={submitSearch} className="btn btn-primary btn-sm me-2 my-2" disabled={false}>
                                {!loading && <span className='indicator-label'>Search</span>}
                                {loading && (
                                    <span className='indicator-progress' style={{ display: 'block' }}>
                                    Please wait...
                                    <FontAwesomeIcon icon={faCircleNotch} spin className='ms-2' />
                                    </span>
                                )}
                            </button>
                        )}
                            <button type='button' className="btn btn-secondary btn-sm me-2" onClick={clearSearchFields}>Clear</button>
                            <MlabButton
                                access={userAccess.includes(USER_CLAIMS.BroadcastRead) && userAccess.includes(USER_CLAIMS.BroadcastWrite)}
                                size='sm'
                                label='Create Broadcast'
                                style={ElementStyle.primary}
                                type='button'
                                weight='solid'
                                disabled={(selectedLeads.length == 0)}
                                onClick={onClickCreateBroadcast}
                            />
                        </ButtonsContainer>
                        <ButtonsContainer>
                            {selectedLeads.length} item(s) selected
                        </ButtonsContainer>
                        <div className="row pb-15" style={{paddingRight:'0px'}}>
                            <GridWithLoaderAndPagination
                                gridRef={gridRef}
                                rowData={leadsResult}
                                columnDefs={columnDefs}
                                sortColumn={sortColumn}
                                sortOrder={sortOrder}
                                isLoading={loading}
                                height={500}
                                onSortChanged={(e: any) => onSortLeads(e)}
                                //pagination details
                                noTopPad={true}
                                recordCount={recordCount}
                                currentPage={currentPage}
                                pageSize={pageSize}
                                onClickFirst={onPaginationSearchClickFirst}
                                onClickPrevious={onPaginationSearchClickPrevious}
                                onClickNext={onPaginationSearchClickNext}
                                onClickLast={onPaginationSearchClickLast}
                                onPageSizeChanged={onPaginationSearchPageSizeChanged}
                                isRowSelectionMultiple={true}
                                onSelectionChanged={onSelectionChanged}
                            ></GridWithLoaderAndPagination>
                        </div>
                       
                    </FormGroupContainer>
			
					<LinkingModal
                        showForm={showForm}
                        closeModal={() => setShowForm(false)}
                        selectedLeadId={selectedLeadIdToLink}
                        selectedLeadName={selectedLeadNameToLink}
                        existingLinkedPlayerId={currentPlayerIdLinked}
                        existingLinkedPlayerUsername={currentPlayerUsernameLinked}
                        existingLinkedPlayerUsernameBrandConcat={currentPlayerUsernameBrandConcatLinked}
                        existingLinkedMlabPlayerId={currentMlabPlayerIdLinked}
                        setReloadPage={setReloadPage}
                    />
			</ContentContainer>
			
			
		</MainContainer>
  )
}
