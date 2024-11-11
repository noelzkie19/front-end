import { faWindowClose } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useFormik } from 'formik'
import { Guid } from "guid-typescript"
import { useEffect, useState } from "react"
import { shallowEqual, useSelector } from 'react-redux'
import Select from 'react-select'
import swal from 'sweetalert'
import { RootState } from '../../../../../setup'
import { ElementStyle } from "../../../../constants/Constants"
import { ButtonsContainer, ContentContainer, FormContainer, FormGroupContainer, FormHeader, MainContainer, MlabButton } from "../../../../custom-components"
import DefaultDateRangePicker from '../../../../custom-components/date-range-pickers/DefaultDateRangePicker'
import { LookupModel } from "../../../../shared-models/LookupModel"
import { USER_CLAIMS } from '../../../user-management/components/constants/UserClaims'
import { TeamsFilterModel } from "../../../user-management/models/TeamsFilterModel"
import { UserInfoListModel } from "../../../user-management/models/UserInfoListModel"
import { getTeamsFilter, getUserListOption } from "../../../user-management/redux/UserManagementService"
import ManageThresholdModal from "../../manage-threshold/ManageThresholdModal"
import { ContactLogListRequestModel } from "../models/ContactLogListRequestModel"
import { exportToCsvSummaryList, exportToCsvTeamList, exportToCsvUserList } from "../redux/ContactDetailsLogService"
import '../styles/ContactDetailsLogStyle.css'
import { ContactLogDetailsGrid } from "./contact-log-details-grid"
import { ContactLogSummaryGrid } from "./contact-log-summary-grid"
interface TableListModel {
  tabType: string,
  label: string,
  id?: number,
  guid: string,
  recordCount?: number,
  description: string,
}

export const ContactLogSummary = () => {


    // -----------------------------------------------------------------
    // GET REDUX STORE
    // -----------------------------------------------------------------
    
    // AUTH STORES
    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string


    // -----------------------------------------------------------------
    // STATES
    // -----------------------------------------------------------------
    const [teamList, setTeamList] = useState<Array<LookupModel>>([])
    const [selectedTeams, setSelectedTeams] = useState('');
    const [userOptionLst, setUserOptionLst] = useState<Array<LookupModel>>([])
    const [filterUser, setFilterUser] = useState<LookupModel | null>()
    const [tabList, setTabList] = useState<Array<TableListModel>>([]);
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [filterCreatedDateRange, setFilterCreatedDateRange] = useState<any>()
    const [filterCreatedStartDate, setfilterCreatedStartDate] = useState<any>()
    const [filterCreatedEndDate, setfilterCreatedEndDate] = useState<any>()
    const [loading, setLoading] = useState(false)


  const [onSearchValue, setOnSearchValue] = useState<ContactLogListRequestModel>()
  const initialValues = {
    campaignId: '',
  }
  const formik = useFormik({
    initialValues,
    onSubmit: async (values, { setStatus, setSubmitting, resetForm }) => {
    },
  })
  function onChangeSelectedTeams(val: string) {
    setSelectedTeams(val);
  }
  function onChangeSelectedUser(val: LookupModel) {
    setFilterUser(val)
  }
  const onHandleSearch = () => {
    if(!validateFilter()) 
      return;//skip the code below

    //Reset the results
    addDefaultTab();

    const request: ContactLogListRequestModel = {
      actionDateFrom: filterCreatedStartDate,
      actionDateTo: filterCreatedEndDate,
      teamIds: selectedTeams == undefined ? "" :  Object.assign(Array<LookupModel>(), selectedTeams).map((el:any) => el.value).join(','),
      userIds: filterUser == undefined ? "" :  Object.assign(Array<LookupModel>(), filterUser).map((el:any) => el.value).join(','),
      queueId:'',
      userId:''
   }
   setOnSearchValue(request);
  }
  const addDefaultTab = () => {
    let tabSummary: any = [
      {
        tabType: 'summary',
        id: 0,
        label: 'Summary',
        guid: Guid.create().toString()
      },
    ]
    setActiveIndex(0);
    setTabList(tabSummary);
  };
  const validateFilter = () => {
    if(filterCreatedEndDate == undefined || filterCreatedStartDate == undefined){
      swal('Failed', 'Unable to proceed, please fill up the search filter', 'error')
      return false
    }
    return true;
  }
  useEffect(() => {
    //Add initial tab
    addDefaultTab();
    //Set the default Date range
    let dateTodayFrom =  new Date(new Date().setHours(0,0,0,0))
    let dateTodayTo =  new Date(new Date().setHours(23,59,59))
  
    setfilterCreatedStartDate(dateTodayFrom)
    setfilterCreatedEndDate(dateTodayTo)
  
    setFilterCreatedDateRange([dateTodayFrom, dateTodayTo])
  }, [])
  //datepicker function
  const onChangeCreatedDateRange = (val: any) => {
    if (val != undefined) {
      setFilterCreatedDateRange(val)
      setfilterCreatedStartDate(val[0]);
      setfilterCreatedEndDate(val[1]);
    }
  }

  const getUserListOptions = () => {
    getUserListOption().then((response) => {
      if (response.status === 200) {
        let resultData = Object.assign(new Array<UserInfoListModel>(), response.data);
        let userTempList = Array<LookupModel>();
        //default for administrator
        userTempList.push({
          value: '0',
          label: 'Administrator'
        });
        resultData.map(user => {
          const userOption: LookupModel = {
            value: user.userId.toString(),
            label: user.fullName
          };
          userTempList.push(userOption)
        })
        setUserOptionLst(userTempList.filter(
          (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
        ));

      }
      else {
        swal("Failed", "problem in getting user list", "error");
      }

    })
      .catch(() => {
        swal("Failed", "problem in getting user list", "error");
      })
  }
  const onClickRowTable = (param: any) => {
    let existingTab = tabList.find(a=> a.id == param.id && a.tabType == param.tabType)
    let jumpToTab = tabList.findIndex(a=> a.id == param.id && a.tabType == param.tabType);
    if(existingTab == undefined)
      setTabList([...tabList, param])
    else
      setActiveIndex(jumpToTab);
  }
  const closeTab = (param: any, index: number) => {
    let filteredArray = tabList.filter(item => item.guid != param.guid);
    let lastIndex = (tabList.length - 1)
    let newTabIndex = activeIndex;
    setTabList(filteredArray);
    if (activeIndex != 0) {
      if (index == lastIndex)
        newTabIndex = filteredArray.length - 1
      else if (index == activeIndex)
        newTabIndex = activeIndex
      else if (index > activeIndex)
        newTabIndex = activeIndex
      else if (index <= (filteredArray.length - 1)) {
        newTabIndex = activeIndex - 1
      }
    }
    //Add timeout to reflect active tab
    setTimeout(() => {
      setActiveIndex(newTabIndex)
    })
  }
  const getTeamListOptions = () => {
    getTeamsFilter().then((response) => {
      if (response.status === 200) {
        let teamListData = Object.assign(new Array<TeamsFilterModel>(), response.data);
        let teamTempList = Array<LookupModel>();
        teamListData.map(team => {
          const roleOption: LookupModel = {
            value: team.teamId.toString(),
            label: team.teamName,
          };
          teamTempList.push(roleOption)
        })
        setTeamList(teamTempList.filter(
          (thing, i, arr) => arr.findIndex(t => t.value === thing.value) === i
        ));
      }
      else {
        swal("Failed", "problem in getting user list", "error");
      }

    })
      .catch(() => {
        //  disableSplashScreen()
        swal("Failed", "problem in getting user list", "error");
      })
  };
  const onHandleExportToCsv = () => {
    let tabToExport = tabList.filter((item,index) => index == activeIndex)[0];
    const request: ContactLogListRequestModel = 
    {
      actionDateFrom: onSearchValue ? onSearchValue?.actionDateFrom : new Date(),
      actionDateTo: onSearchValue ? onSearchValue?.actionDateTo : new Date(),
      offsetValue:  0 ,
      pageSize: tabToExport.recordCount != undefined ? tabToExport.recordCount : 99999,
      teamIds: '',
      sortColumn:  'actionDate'  ,
      sortOrder: 'desc' ,
      userIds: '',
      queueId:'',
      userId:''
    }
    setLoading(true);
    if(tabToExport.tabType === 'summary'){
      if(tabToExport.recordCount == undefined || tabToExport?.recordCount == 0){
        swal("Failed", "Problem in exporting the result", "error");
        setLoading(false);
        return
      }
      request.sortColumn = 'teamName'
      request.sortOrder = 'asc'
      exportToCsvSummary(request)
    }
    else if (tabToExport.tabType === 'team'){
      request.sortColumn = 'userFullName'
      request.sortOrder = 'asc'
      request.teamIds = tabToExport !=undefined ? tabToExport?.id?.toString() : ""
      exportToCsvTeam(request)
    }
    else if (tabToExport.tabType === 'user'){
      request.sortColumn = 'actionDate';
      request.sortOrder = 'desc'
      request.userIds = tabToExport !=undefined ? tabToExport?.id?.toString() : ""
      exportToCsvUser(request)
    }
  }
  const exportToCsvSummary = (request: any) => {
    exportToCsvSummaryList(request)
    .then((response) => {
        if (response.status === 200) {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'Contact_Logs_Summary.csv')
          document.body.appendChild(link)
          link.click()
          setLoading(false);
        }
        else{
          setLoading(false);
          swal("Failed", "Problem in exporting the result", "error");
        }
    })
    .catch(() => {
       setLoading(false)
       swal("Failed", "Problem in getting campaign list", "error");
    });
  }
  const exportToCsvTeam = (request: any) => {
    exportToCsvTeamList(request)
    .then((response) => {
        if (response.status === 200) {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'Contact_Logs_Team.csv')
          document.body.appendChild(link)
          link.click()
          setLoading(false);
        }
        else{
          setLoading(false);
          swal("Failed", "Problem in exporting the result", "error");
        }
    }).catch(() => {
      setLoading(false)
      swal("Failed", "Problem in getting campaign list", "error");
   });
  }
  const exportToCsvUser = (request : any) => {
   
    exportToCsvUserList(request)
      .then((response) => {
          if (response.status === 200) {
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'Contact_Logs_User.csv')
            document.body.appendChild(link)
            link.click()
            setLoading(false);
          }
          else{
            setLoading(false);
            swal("Failed", "Problem in exporting the result", "error");
          }
      }).catch(() => {
        setLoading(false)
        swal("Failed", "Problem in getting campaign list", "error");
     });
  }
  useEffect(() => {
    getTeamListOptions()
    getUserListOptions();
  }, [])

  return (
    (<FormContainer onSubmit={formik.handleSubmit}>
      <MainContainer>
        <FormHeader headerLabel={'Contact Logs'} />
        <ContentContainer>
          <FormGroupContainer>
            <div className='col-lg-3'>
              <label>Date</label>
              <DefaultDateRangePicker
                format='yyyy-MM-dd HH:mm'
                maxDays={180}
                onChange={onChangeCreatedDateRange}
                value={filterCreatedDateRange}
              />
            </div>
            <div className='col-lg-3'>
              <label>Team Name</label>
              <Select
                isMulti
                size='small'
                style={{ width: '100%' }}
                options={teamList}
                onChange={onChangeSelectedTeams}
                value={selectedTeams}
              />
            </div>
            <div className='col-lg-3'>
              <label>User Full Name</label>
              <Select
                isMulti
                size='small'
                style={{ width: '100%' }}
                options={userOptionLst}
                onChange={onChangeSelectedUser}
                value={filterUser}
              />
            </div>
            <div className='col-lg-12 mt-3'></div>
          </FormGroupContainer>

          <FormGroupContainer>
            <ButtonsContainer>
              <MlabButton
                access={userAccess.includes(USER_CLAIMS.ViewContactDetailsLogWrite)}
                label='Search'
                style={ElementStyle.primary}
                type={'submit'}
                weight={'solid'}
                size={'sm'}
                loading={loading}
                loadingTitle={'Please wait...'}
                disabled={loading}
                onClick={onHandleSearch}
              />

	
			<MlabButton
				access={userAccess.includes(USER_CLAIMS.ExportLogtoCSVRead)}
				label='Export To CSV'
				style={ElementStyle.primary}
				type={'button'}
				weight={'solid'}
				size={'sm'}
				loading={loading}
				loadingTitle={'Please wait...'}
				disabled={loading || !userAccess.includes(USER_CLAIMS.ExportLogtoCSVWrite)}
				onClick={onHandleExportToCsv}
			/>
			  


              <ManageThresholdModal />
            </ButtonsContainer>
          </FormGroupContainer>
          <div className="tabbable-custom">
            <ul className="nav nav-tabs nav-tab-border">
              {
                tabList.map((element: any, index: any) => {
                  return (
                    <li key={index} className={activeIndex == index ? 'nav-item tab-highlighted' : 'nav-item'}>
                      <div className={activeIndex == index ? 'nav-link active' : 'nav-link'}>
                        <span className={activeIndex == index ? 'nav-link-label active' : 'nav-link-label'} id={index} data-bs-toggle="tab" onClick={() => setActiveIndex(index)} >
                          {element.label}
                        </span>
                        <span>
                        {element.tabType !== 'summary' &&
                            <FontAwesomeIcon style={{ marginLeft: '5px' }} icon={faWindowClose} onClick={() => closeTab(element, index)} />
                        }
                        </span>
                      </div>

                    </li>
                  )
                })

              }
            </ul>
            <div className="tab-content">
              {
                tabList.map((e: any, index: any) => {
                  return (
                    (<div key={index} className={activeIndex == index ? "tab-pane active" : "tab-pane"} id={(e.label).replace(/\s/g, '') + e.id + index}>
                      {e.tabType !== 'summary' &&<span style={{fontSize:'1rem'}}>{e.description}</span> }
                      {e.tabType == 'summary' &&
                        <ContactLogSummaryGrid onSearchValue = {onSearchValue} tabList={e}  tabType={e.tabType} key={e.tabType + e.id} onClickTeam={onClickRowTable} />
                      }
                      {(e.tabType == 'team' || e.tabType == 'user') && (
                        <ContactLogDetailsGrid  onSearchValue = {onSearchValue} tabList={e} tabType={e.tabType} onClickUser={onClickRowTable} key={e.tabType + e.id} />
                      )
                      }
                    </div>)
                  );
                })
              }
            </div>
          </div>


        </ContentContainer>
      </MainContainer>
    </FormContainer>)
  );
}