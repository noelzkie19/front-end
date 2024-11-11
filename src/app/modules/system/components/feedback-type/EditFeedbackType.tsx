import { AgGridReact } from "ag-grid-react"
import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import swal from "sweetalert"
import { PROMPT_MESSAGES } from "../../../../constants/Constants"
import { ButtonsContainer, ContentContainer, DefaultButton, FooterContainer, FormGroupContainer, FormHeader, MainContainer, PaddedContainer } from "../../../../custom-components"
import ReorderListModal from "../../../../custom-components/modals/ReorderListModal"
import { FeedbackTypeModel } from "../../models/FeedbackTypeModel"
import { FeedbackTypeFilterModel } from "../../models/requests/FeedbackTypeFilterModel"
import { FeedbackTypeMock } from "../../_mocks_/FeedbackTypeMock"
import { FILTER_STATUS_OPTIONS, STATUS_OPTIONS } from "../constants/SelectOptions"
import AddEditFeedbackTypeModal from "./modals/AddEditFeedbackTypeModal"
import { useDispatch, useSelector, shallowEqual } from "react-redux"
import { RootState } from "../../../../../setup"
import { Guid } from "guid-typescript"
import { disableSplashScreen } from "../../../../utils/helper"
import * as systemManagement from '../../redux/SystemRedux'
import useConstant from "../../../../constants/useConstant"
import { useSystemOptionHooks } from "../../shared/hooks/useSystemOptionHooks"
import useSystemHooks from "../../../../custom-functions/system/useSystemHooks"
import { ColDef, ColGroupDef } from 'ag-grid-community';

const EditFeedbackType : React.FC = () => {
    // // -----------------------------------------------------------------
    // // STATES
    // // -----------------------------------------------------------------
    const history = useHistory();
    const dispatch = useDispatch()
    const {SwalFailedMessage, SwalFeedbackMessage, SwalConfirmMessage} = useConstant();
    const { getSystemCodelist, codeListInfo} = useSystemOptionHooks();
    const { getFeedbackTypeListInfo } = useSystemHooks();

    const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number
    const [feedbackTypeInfo, setFeedbackTypeInfo] = useState<FeedbackTypeModel | undefined>()
    const [feedbackTypeList, setFeedbackTypeList] = useState<Array<FeedbackTypeModel>>(FeedbackTypeMock.table)
    const [feedbackTypeStatus, setFeedbackTypeStatus] = useState('')
    const [feedbackTypeNameFilter, setFeedbackTypeNameFilter] = useState('')
    const [feedbackTypeStatusFilter, setFeedbackTypeStatusFilter] = useState('')

    const [editMode, setEditMode] = useState(false)
    const [addModal, setAddModal] = useState(false)
    const [reorderModal, setReorderModal] = useState(false)
    const feedbackId : number = 6

    const feedbackTypeListState = useSelector<RootState>(
        ({system}) => system.feedbackTypeList,
        shallowEqual
    ) as FeedbackTypeModel[]
    // // -----------------------------------------------------------------
    // // EFFECTS
    // // -----------------------------------------------------------------

    useEffect(() => {
        getCodeListInfo()
        //loadFeedbackTypeList()
    }, [])

    useEffect(() => {
        console.log('REDUX STATE [Feedback Type List]', feedbackTypeListState)
    }, [feedbackTypeListState])

    useEffect(() => {
        if(codeListInfo){
            setFeedbackTypeStatus(codeListInfo.isActive.toString())
        }
    },[codeListInfo])

    // // -----------------------------------------------------------------
    // // METHODS
    // // -----------------------------------------------------------------

    const getCodeListInfo = () => {
        getSystemCodelist(feedbackId);

        const searchRequest: FeedbackTypeFilterModel = {
            userId: userAccessId.toString(),
            queueId: Guid.create().toString(),
            feedbackTypeName: feedbackTypeNameFilter,
            feedbackTypeStatus: feedbackTypeStatusFilter
        }

        getFeedbackTypeListInfo(searchRequest, 'edit');
        disableSplashScreen()
    }

    const loadFeedbackTypeList = () => {
        const searchRequest: FeedbackTypeFilterModel = {
            userId: userAccessId.toString(),
            queueId: Guid.create().toString(),
            feedbackTypeName: feedbackTypeNameFilter,
            feedbackTypeStatus: feedbackTypeStatusFilter
        }
        getFeedbackTypeListInfo(searchRequest, 'edit');
        disableSplashScreen();
    }

    const onGridReady = (params: any) => {
        params.api.sizeColumnsToFit();
    }

    const handleFeedbackTypeStatusOnChange = (event: any) => {
        setFeedbackTypeStatus(event.target.value)
    }

    const handleFeedbackTypeNameFilterOnChange = (event: any) => {
        setFeedbackTypeNameFilter(event.target.value)
    }

    const handleFeedbackTypeStatusFilterOnChange = (event: any) => {
        setFeedbackTypeStatusFilter(event.target.value)
    }

    const handleSearch = () => {
        loadFeedbackTypeList()
    }

    const handleAddNew = () => {
        setEditMode(false)
        toggleAddModal()
    }

    const handleChangeOrder = () => {
        toggleReorderModal()
    }

    const toggleAddModal = () => {
        setAddModal(!addModal)
    }

    const toggleReorderModal = () => {
        setReorderModal(!reorderModal)
    }

    const saveFeedbackType = (val: FeedbackTypeModel) => {
        if(editMode) {
            const oldList = feedbackTypeList.filter(i => i.feedbackTypeId !== val.feedbackTypeId)
            const oldList2 = feedbackTypeListState.filter(i => i.feedbackTypeId !== val.feedbackTypeId)
            setFeedbackTypeList([...oldList, val])
            dispatch(systemManagement.actions.getFeedbackTypeList([...oldList2, val]))
        } else {
            val.feedbackTypeId = 0 //feedbackTypeList.length + 1
            val.position = feedbackTypeList.length + 1
            setFeedbackTypeList([...feedbackTypeList, val])
            dispatch(systemManagement.actions.getFeedbackTypeList([...feedbackTypeListState, val]))
        }
        toggleAddModal()
    }

    const saveReorder = (val: Array<FeedbackTypeModel>) => {
        setFeedbackTypeList([...val])
        dispatch(systemManagement.actions.getFeedbackTypeList([...val]))
    }

    // May issue pa dito. Hindi ma access yung State - both redux and local states
    const handleDeactivate = (params: any) => {
        console.log('Deactivate Triggered', params)
        const item = feedbackTypeListState.find(i => i.feedbackTypeName === params.feedbackTypeName)
        if(item !== undefined) {
            console.log('Deactivate Success', item)
            //item.isActive = (item.isActive === 'true') ? 'false' : 'true'
            const oldList = feedbackTypeListState.filter(i => i.feedbackTypeName != item.feedbackTypeName)
            console.log('Deactivate Old List', oldList)

            let newList = [...oldList, item]
            console.log('New List', newList)
            dispatch(systemManagement.actions.getFeedbackTypeList(newList))
        }
    }

    const handleEdit = (id: any) => {
        alert('Edit ' + id)
        setEditMode(true)
        const feedbackTypeItem = feedbackTypeList.find(i => i.feedbackTypeId === Number(id))
        if(feedbackTypeItem !== undefined) {
            setFeedbackTypeInfo(feedbackTypeItem)
            toggleAddModal()
        } else {
            swal(SwalFailedMessage.title, SwalFeedbackMessage.textErrorNotFound('Feedback type'), SwalFailedMessage.icon);
        }
    }

    const handleViewFeedbackCategory = (data: any) => {
        swal({
            title: PROMPT_MESSAGES.ConfirmCloseTitle,
            text: PROMPT_MESSAGES.ConfirmCloseMessage,
            icon: SwalConfirmMessage.icon,
            buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
            dangerMode: true,
        }).then((willRedirect) => {
            if (willRedirect) {
                history.push(`/system/feedback-category-list/?feedbackTypeId=${data.feedbackTypeId}`)
            }
        })

    }

    const feedbackListAction = (params: any) =>
        <>
            <button className='btn btn-outline-dark btn-sm px-4' onClick={() => handleDeactivate(params.data)}>
                {(params.data.feedbackTypeStatus === true || params.data.feedbackTypeStatus === 'true') ? 'Deactivate' : 'Activate'}
            </button> {' '}
            <button className='btn btn-outline-dark btn-sm px-4' onClick={() => handleEdit(params.data)}>
                Edit
            </button> {' '}
            <button className='btn btn-outline-dark btn-sm px-4' onClick={() => handleViewFeedbackCategory(params.data)}>
                View Feedback Category
            </button>
        </>

    const columnDefs : (ColDef<FeedbackTypeModel> | ColGroupDef<FeedbackTypeModel>)[] =[
        {
            headerName: 'Order No',
            field: 'position',
        },
        {
            headerName: 'Feedback Type Name',
            field: 'feedbackTypeName'
        },
        {
            headerName: 'Feedback Type Status',
            field: 'feedbackTypeStatus',
            cellRenderer: (params: any) => (params.value === true || params.value === "true") ? "Active" : "Inactive",
        },
        {
            headerName: 'Action',
            cellRenderer: feedbackListAction,
        }
    ]

    return (
        <>
            <MainContainer>
                <FormHeader headerLabel={'Edit Feedback Type'} />
                <ContentContainer>
                    <FormGroupContainer>
                        <div className='col-lg-2'>
                            <label htmlFor='codelist-ft-name'>Code List Name</label>
                            <p id="codelist-ft-name" className='form-control-plaintext fw-bolder'>{codeListInfo?.codeListName}</p>
                        </div>
                        <div className='col-lg-2'>
                            <label htmlFor="codelist-ft-type">Code List Type</label>
                            <p id="codelist-ft-type" className='form-control-plaintext fw-bolder'>{codeListInfo?.codeListTypeName}</p>
                        </div>
                        <div className='col-lg-2'>
                            <label htmlFor="parent-ft-codelist">Parent</label>
                            <p id="parent-ft-codelist" className='form-control-plaintext fw-bolder'>{codeListInfo?.parentCodeListName}</p>
                        </div>
                        <div className='col-lg-2'>
                            <label htmlFor="ft-field-type">Field Type</label>
                            <p id="ft-field-type" className='form-control-plaintext fw-bolder'>{codeListInfo?.fieldTypeName}</p>
                        </div>
                        <div className='col-lg-2'>
                            <label htmlFor="codelist-ft-status">Code List Status</label>
                            <select
                                id='codelist-ft-status'
                                className='form-select form-select-sm'
                                aria-label='Select status'
                                value={feedbackTypeStatus}
                                onChange={handleFeedbackTypeStatusOnChange}
                            >
                                {STATUS_OPTIONS.map((item, index) => (
                                    <option key={item.value.toString()} value={item.value.toString()}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </FormGroupContainer>
                    <FormGroupContainer>
                        <div className='col-lg-2'>
                            <label htmlFor="ft-created-date">Created Date</label>
                            <p id="ft-created-date" className='form-control-plaintext fw-bolder'>{codeListInfo?.createdDate}</p>
                        </div>
                        <div className='col-lg-2'>
                            <label htmlFor="ft-created-by">Created By</label>
                            <p id='ft-created-by' className='form-control-plaintext fw-bolder'>{codeListInfo?.createdByName}</p>
                        </div>
                        <div className='col-lg-2'>
                            <label htmlFor="ft-last-modified-date">Last Modified Date</label>
                            <p id="ft-last-modified-date" className='form-control-plaintext fw-bolder'>{codeListInfo?.updatedDate}</p>
                        </div>
                        <div className='col-lg-2'>
                            <label htmlFor="ft-modified-by">Modified By</label>
                            <p id="ft-modified-by" className='form-control-plaintext fw-bolder'>
                                {codeListInfo?.updatedByName}
                            </p>
                        </div>
                    </FormGroupContainer>
                    <hr className='my-3' />
                    <FormGroupContainer>
                        <label htmlFor="search-feedback-type-name" className='col-lg-2 col-form-label text-lg-right'>
                            Feedback Type Name
                        </label>
                        <div className='col-lg-2'>
                            <input id="search-feedback-type-name"
                                type='text'
                                className='form-control form-control-sm'
                                placeholder='Answer Name'
                                value={feedbackTypeNameFilter}
                                onChange={handleFeedbackTypeNameFilterOnChange} />
                        </div>
                        <label htmlFor="search-feedback-type-status" className='col-lg-2 col-form-label text-lg-right'>
                            Feedback Type Status
                        </label>
                        <div className='col-lg-2'>
                            <select
                                id="search-feedback-type-status"
                                className='form-select form-select-sm'
                                aria-label='Select status'
                                value={feedbackTypeStatusFilter}
                                onChange={handleFeedbackTypeStatusFilterOnChange}

                            >
                                {FILTER_STATUS_OPTIONS.map((item, index) => (
                                    <option key={item.value.toString()} value={item.value.toString()}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </FormGroupContainer>
                    <FormGroupContainer>
                        <ButtonsContainer>
                            <DefaultButton access={true} title={'Search'} onClick={handleSearch} />
                            <DefaultButton access={true} title={'Add New'} onClick={handleAddNew} />
                            <DefaultButton access={true} title={'Change Order'} onClick={handleChangeOrder} />
                        </ButtonsContainer>
                    </FormGroupContainer>
                    <FormGroupContainer>
                        <div className="ag-theme-quartz" style={{ height: 400, width: '100%' }}>
                            <AgGridReact
                                rowData={feedbackTypeListState}
                                columnDefs={columnDefs}
                                animateRows={true}
                                onGridReady={onGridReady}
                                rowBuffer={0}
                                //enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
                                pagination={true}
                                paginationPageSize={10}
                            >
                            </AgGridReact>
                        </div>
                    </FormGroupContainer>
                </ContentContainer>
                <FooterContainer>
                    <PaddedContainer>
                        <button type='button' className='btn btn-primary font-weight-bold me-2'>
                            Submit
                        </button>
                        <button type='button' className='btn btn-secondary font-weight-bold me-0'>
                            Back
                        </button>
                    </PaddedContainer>
                </FooterContainer>
            </MainContainer>
            <AddEditFeedbackTypeModal
                editMode={editMode}
                modal={addModal}
                toggle={toggleAddModal}
                feedbackType={feedbackTypeInfo}
                saveFeedbackType={saveFeedbackType}
            />
            <ReorderListModal
                modalName='Reorder Feedback Type'
                modal={reorderModal}
                toggle={toggleReorderModal}
                orderList={feedbackTypeListState}
                columnList={[
                    {
                        title: 'Orderxx',
                        field: 'position',
                    },
                    {
                        title: 'Feedback Type Name',
                        field: 'feedbackTypeName',
                    },
                ]}
                saveReorder={saveReorder}
            />
        </>
    )
}

export default EditFeedbackType