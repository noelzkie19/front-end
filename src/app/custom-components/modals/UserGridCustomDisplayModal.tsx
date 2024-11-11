import { useFormik } from "formik"
import { useEffect, useState } from "react"
import { ModalFooter, Row } from "react-bootstrap-v5"
import { FormModal, FormContainer, MainContainer, ContentContainer, FieldContainer, SuccesLoaderButton } from ".."
import { LookupModel } from "../../shared-models/LookupModel"
import Select from 'react-select'
import { AgGridReact } from 'ag-grid-react'
import { ColumnDisplayModel } from "../../shared-models/ColumnDisplayModel"
import { useSelector, shallowEqual } from 'react-redux'
import { RootState } from "../../../setup";
import swal from 'sweetalert'
import { LoadUserGridCustomDisplayAsync, UpsertUserGridCustomDisplayAsync } from "../../common/services/userGridCustomDisplay"
import { Guid } from "guid-typescript"
import { UserGridCustomDisplayRequestModel } from "../../shared-models/UserGridCustomDisplayRequestModel"
import { UserGridCustomDisplayResponseModel } from "../../common/model/system/UserGridCustomDisplayResponseModel"
import { CustomizeSection } from "../../constants/Constants"
import { ColDef, ColGroupDef } from 'ag-grid-community';

const defaultValue = 'default' 
const customizeValue = 'customize' 
const defaultSectionValue = CustomizeSection.SearchFilter

const initialValues = {
    options: [
        { label: 'Default', value: defaultValue },
        { label: 'Customize', value: customizeValue }
      ],
    sections: [
        { label: 'Search Filter', value: CustomizeSection.SearchFilter },
        { label: 'Search Result', value: CustomizeSection.SearchResult }
    ]
}


interface Props {
    showForm: boolean
    defaultColumns?: any
    onUpdate: () => void
    closeModal: () => void
    submitModal: () => void,
    defaultFilters?: any,
    isWithSection?: boolean,
    setCurrentSection?: (val: any) => void,
    currentSectionValue?: any
}

const UserGridCustomDisplayModal: React.FC<Props> = ({ showForm, onUpdate, closeModal, submitModal, defaultColumns , defaultFilters , isWithSection , setCurrentSection , currentSectionValue }) => {

    const userId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number
    const [loading, setLoading] = useState<boolean>(false);
    const [template, setTemplate] = useState<LookupModel | null>()
    const [allFields, setAllFields] = useState<Array<ColumnDisplayModel>>([])
    const [selectedColumns, setSelectedColumns] = useState<Array<ColumnDisplayModel>>([])
    const [isCustomize, setIsCustomize] = useState<boolean>(false);
    const [hasChanged, setHasChanged] = useState<boolean>(false);
    const [section, setSection] = useState<LookupModel | null>()
    const [allUserColumns, setAllUserColumns] = useState<Array<any>>([])
    const [availableHeader, setAvailableHeader] = useState<string>('');
    const [displayHeader, setDisplayHeader] = useState<string>('');
    const [confirmMessage, setConfirmMessage] = useState<string>('');

    useEffect(() => {     
        if(showForm){
            setLoading(true)
            initialize()
        }
    }, [showForm])

    useEffect(() => {
        if(section){
            setAvailableColumns();
            updateBySection(section.value)
        }
    }, [selectedColumns, section])

    const formik = useFormik({
        initialValues,
        onSubmit: async (values, { setSubmitting, resetForm }) => {  

            if(template?.value == customizeValue && selectedColumns.length == 0){
                (section?.value ?? '0') === defaultSectionValue ?
                swal("Failed", "Unable to proceed. Please select at least 1 column to be displayed.", "error"):
                swal("Failed", "Unable to proceed. Please select at least 1 filter to be displayed.", "error")
            }
            else{

                swal({
                    title: "Confirmation",
                    text: confirmMessage,
                    icon: "warning",
                    buttons: ["No", "Yes"],
                    dangerMode: true
                }).then(async (willCreate) => {

                    if (willCreate) {
                        await saveDisplay()
                        closeModal()
                    }
                })
                
            }            
        }
    })

    
    const initialize = async () => {
        setLoading(true);
        
        try {
            const result = await LoadUserGridCustomDisplayAsync(userId);
            let userColumns: UserGridCustomDisplayResponseModel[] = [];
            let mySection = initialValues.sections.find(i => 
                result.length === 0 
                    ? i.value !== defaultSectionValue 
                    : i.value === (currentSectionValue ?? defaultSectionValue)
            );
            
            
            setAllUserColumns(result);
    
            if (result.length > 0) {
                userColumns = isWithSection && mySection?.value === defaultSectionValue
                    ? result.filter(d => d.isForFilter)
                    : result.filter(d => !d.isForFilter);
            }
            updateTemplate(result, userColumns)
            updateSection(mySection, userColumns)
          
        } catch (error) {
            console.error('Error loading user grid custom display:', error);
        } finally {
            setLoading(false);
            setHasChanged(false);
        }
    };

    const updateTemplate = (result: any, userColumns: any) => {
        const templateValue = (isWithSection && result.length > 0 && userColumns[0]?.display) || (isWithSection === undefined || !isWithSection)  && userColumns[0]?.display
        ? customizeValue
        : defaultValue;
        const myTemplate = initialValues.options.find(i => i.value === templateValue);
        setIsCustomize(myTemplate?.value === customizeValue);
        setTemplate(myTemplate);
    }

    const updateSection = (mySection: any, userColumns: UserGridCustomDisplayResponseModel[]) =>{
        const isForFilter = isWithSection && mySection?.value === defaultSectionValue;
        const newDisplay = userColumns.find(d => isForFilter ? d.isForFilter : !d.isForFilter);

        if (userColumns.length > 0 && newDisplay?.display) {
            setupSelectedColumns(JSON.parse(newDisplay.display));
        } else {
            setupSelectedColumns([]);
        }

        updateBySection(mySection?.value);
        setSection(mySection);
    }

    async function saveDisplay(){
        
        setLoading(true)
        onUpdate()

        const isForFilter = ((section?.value ?? '0') === defaultSectionValue) && (isWithSection ?? false);
        const queueId = Guid.create().toString();
        let request: UserGridCustomDisplayRequestModel = {
            queueId: queueId,
            userId: userId.toString(),
            module: window.location.pathname,
            display: undefined,
            isForFilter: isForFilter,
            section: isWithSection ? parseInt(section?.value ?? '0' ) : parseInt(CustomizeSection.SearchResult)
        };
        
        if (setCurrentSection) {
            setCurrentSection(section?.value ?? '0')
        }

        if(template?.value == customizeValue)
        {    
                      
            // reapply correct sorting order values
            let ctr = allFields.filter((e: { isPinned: boolean }) => e.isPinned).length;

            const updatedColumns = selectedColumns.map((column) => ({
                ...column,
                order: ctr++,
            }));

            // Update selectedColumns with both pinned and updated columns
            const reqCols = allFields.filter((e: { isPinned: boolean }) => e.isPinned);

            // Merge and update selectedColumns in one go
            const mergedColumns = [...reqCols, ...updatedColumns];
            
            setSelectedColumns(mergedColumns);

            request.display = JSON.stringify(mergedColumns);                               
        }

        await UpsertUserGridCustomDisplayAsync(request)
            .then((response) => {

                if (response.status === 200) {
                    submitModal()
                    closeModal()
                    setLoading(false)
                }
                else{
                    console.log('Error connection in gateway')   
                }

            }).catch(err => console.log('Error while starting connection: ' + err))

    }

    function setupSelectedColumns(cols: Array<ColumnDisplayModel>){
      
        cols = cols.filter((e: { isPinned: boolean }) => !e.isPinned).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)); //remove in displaying required fields
        setSelectedColumns(cols)
    }

    const closeModalForm = async () => {          

        if(hasChanged){

           await swal({
                    title: 'Confirmation',
                    text: 'This action will discard any changes made, please confirm',
                    icon: 'warning',
                    buttons: ["No", "Yes"],
                    dangerMode: true,
                }).then(async (willDiscard) => {
                    if (willDiscard) {
                        await initialize();    //return to previous display
                        closeModal()
                    }
                })
        }  
        else{
            closeModal()
        }         
    }

    function onChangeTemplate(opt: LookupModel) {

        const isCustom = opt.value === customizeValue;
        const isResult = section?.value !== defaultSectionValue
        onChangeEvent(isResult)
        setIsCustomize(isCustom)
        setTemplate(opt);
        setHasChanged(true)
        updateBySection(section?.value)
    }

    const onChangeSection = (opt: LookupModel) => {

        const isSearchResult = opt.value !== defaultSectionValue
        updateBySection(opt.value)
        onChangeEvent(isSearchResult)
        setSection(opt);
        setHasChanged(true)
    }

    const updateBySection = (value: any) => {
        const availableHeader = (value ?? '0') === defaultSectionValue && isWithSection ? 'Filters Available' : 'Columns Available'
        const displayHeader = (value ?? '0') === defaultSectionValue  && isWithSection ? 'Filters to be Displayed' : 'Columns to be Displayed'
        const confirmMessage = (value ?? '0') === defaultSectionValue  && isWithSection ? 'This action will update the search filter display. Please confirm' : 'This action will update the search result display. Please confirm'
        setAvailableHeader(availableHeader)
        setDisplayHeader(displayHeader)
        setConfirmMessage(confirmMessage)
    }

    const onChangeEvent =(isSearchResult: any) => {
        const getDisplayData = (isFilter: boolean) => 
            allUserColumns.filter((d: any) => d.isForFilter === isFilter);
    
        const updateState = (data: any, isCustomize: boolean, templateValue: any) => {
            setupSelectedColumns(JSON.parse(data.display));
            setTemplate(initialValues.options.find(i => i.value === templateValue));
            setIsCustomize(isCustomize);
        };
    
        const searchResult = getDisplayData(false);
        const searchFilter = getDisplayData(true);
        const hasDisplayData = (data: any) => data.length > 0 && data[0].display;
    
        if (isSearchResult && hasDisplayData(searchResult)) {
            updateState(searchResult[0], true, customizeValue);
        } else if (!isSearchResult && hasDisplayData(searchFilter)) {
            updateState(searchFilter[0], true, customizeValue);
        } else {
            setTemplate(initialValues.options.find(i => i.value === defaultValue));
            setupSelectedColumns([]);
            setIsCustomize(false);
        }

    }
 
    function setAvailableColumns() {

        const cols : Array<ColumnDisplayModel>  = [];
        
        const selectedDefaults = section?.value === defaultSectionValue && isWithSection ? defaultFilters.filterDefault : defaultColumns

        selectedDefaults.forEach((e: any) => {
            const selCols = selectedColumns.find(i=> i.value === e.field || e.field === i?.displayFieldDependency)
            const col : ColumnDisplayModel =
            {
                label: e.headerName,
                isPinned: e.isPinned ?? false,
                value: e.field,
                isChecked: e.isPinned? true :  (selCols != undefined),
                order: e.order ?? 0,
                displayFieldDependency: selCols?.displayFieldDependency ?? e.displayFieldDependency, 
                isParentDependency: e.isParentDependency,
            }
            cols.push(col);
      

        });
        
        setAllFields(cols)

    }

    function onCheckBoxClick(e: any) {
        setHasChanged(true)

        let itemRows : Array<ColumnDisplayModel>;
        itemRows = selectedColumns.map(item => item);

        let bar:ColumnDisplayModel = JSON.parse(e.target.value); 
        let isChecked = e.target.checked;
        
        if(isChecked){
            
            itemRows.push(bar);

            // for fields with dependencies
            const dependencyField = defaultFilters?.filterDefault?.find((sf: any) => sf.displayFieldDependency === bar.value)
            
            if(dependencyField !== undefined){
                const dependencyItem: ColumnDisplayModel ={
                    label: dependencyField?.headerName,
                    value: dependencyField?.field,
                    isPinned: false,
                    order: dependencyField?.order ?? 0,
                    displayFieldDependency: dependencyField?.displayFieldDependency ?? null,
                    isChecked: true,
                    isParentDependency: e.isParentDependency,
                }
            itemRows.push(dependencyItem);
            }
            
            setSelectedColumns(itemRows)
        }
        else{

            let index = selectedColumns.findIndex(i=> i.value === bar.value)
            if (index > -1){
                itemRows.splice(index, 1);
                setSelectedColumns(itemRows)
            }

            // for fields with dependencies
            let indexDependency = itemRows.findIndex(i=> i.displayFieldDependency === bar.value)
            if (indexDependency > -1){
                itemRows.splice(indexDependency, 1);
                setSelectedColumns(itemRows)
            }
        }
        
        return false;
        
    }
    
    const columnDefsAll : (ColDef<ColumnDisplayModel> | ColGroupDef<ColumnDisplayModel>)[] = [
        { headerName: availableHeader, field: 'label', width: 320,
        cellRenderer:(params: any) => 
        <>{ params ? 
            <div style={{ margin: '10px auto'}}>
                <input className="form-check-input" 
                    checked={Boolean(params.data.isChecked)}
                    disabled={params.data.isPinned || params.data.displayFieldDependency}
                    type="checkbox" 
                    value={ JSON.stringify(params.data) } 
                    id={ "cb_" + params.data.value } onChange={e => onCheckBoxClick(e)}  />
                <span style={{ left: '5px', position: 'relative', top: '-9px' }}>{params.data.label}</span>
            </div>
            : null
            }
        </>
        },
    ]

    const columnDefsSelected : (ColDef<ColumnDisplayModel> | ColGroupDef<ColumnDisplayModel>)[] = [
        { 
            headerName: displayHeader, 
            field: 'label', 
            rowDrag: true,  
            width: 320,
            cellRenderer:(params: any) => 
            <>{ params.data.isPinned ? 
                 <b>{params.data.label}</b>  
                : <div>{params.data.label}</div>
                }
            </>
        },
    ]

    const onRowDragEnd = (event: any) => {
        setHasChanged(true);
        let movingNode = event.node;
        let overNode = event.overNode;
        let rowNeedsToMove = movingNode !== overNode;
      
        if (rowNeedsToMove && movingNode !== undefined && overNode !== undefined) {
                const newStore = selectedColumns.slice();

                const movingData = movingNode.data;
                const overData = overNode?.data;
                const fromIndex = selectedColumns.indexOf(movingData);
                const toIndex = selectedColumns.indexOf(overData);
               
                moveInArray(newStore, fromIndex, toIndex);
             
        }

    
        function moveInArray(arr: any, fromIndex: number, toIndex: number) {
            const element = arr[fromIndex];
            const nextElement = arr[toIndex];
    
            const defaultColumnNumbers = allFields.filter((d: any) => d.isPinned).length;
            if (element.order && defaultColumnNumbers && defaultColumnNumbers > 0) {
                
                element.order = defaultColumnNumbers + toIndex;
                if (nextElement) {
                    nextElement.order = defaultColumnNumbers + fromIndex + 1;
                }
            }
            arr.splice(fromIndex, 1);
            arr.splice(toIndex, 0, element);
    
            setSelectedColumns(arr);
        }
    };

    
    const getRowNodeId = (data : any) => {
        return data.value;
    };

    return(
        <FormModal headerTitle={'Customize Display'} haveFooter={false} show={showForm}>
            <FormContainer onSubmit={formik.handleSubmit}>
                <MainContainer>
                    <ContentContainer>

                        <FieldContainer>
                            <div className="col-sm-12">
                                 <Row>

                                  {isWithSection ?
                                    <div className="col-sm-6">
                                        <label htmlFor="pageSection" className="form-label-sm">Page Section:&nbsp;</label>
                                        <Select
                                            id="pageSection"
                                            options={initialValues.sections}
                                            onChange={onChangeSection}
                                            value={section}
                                            className="col-sm-12"
                                        />
                                    </div> : '' }
                                    <div className="col-sm-6">
                                        <label htmlFor="selectTemplate" className="form-label-sm">Select Template:&nbsp;</label>
                                        <Select
                                            id="selectTemplate"
                                            options={initialValues.options}
                                            onChange={onChangeTemplate}
                                            value={template}
                                            className="col-sm-12"
                                        />
                                    </div>
                                </Row>
                            </div>
                        </FieldContainer> 

                        {
                            isCustomize ?
                                <FieldContainer>
                                    <div className="col-sm-12 mt-5">
                                        <label className="form-label-sm">Choose fields in order on how you want to display in search result columns</label>
                                    </div>
                                    <div className="row mt-5">
                                        <div className="col-sm-6">
                                            <div className="ag-theme-quartz" style={{height: 400, width: '100%'}}>
                                                <AgGridReact
                                                    rowData={allFields}     
                                                    columnDefs={columnDefsAll}
                                                    suppressScrollOnNewData={true}
                                                />
                                            </div>
                                            
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="ag-theme-quartz" style={{height: 400, width: '100%'}}>
                                                <AgGridReact
                                                    rowData={selectedColumns}                                                      
                                                    columnDefs={columnDefsSelected}      
                                                    rowDragManaged={true}
                                                    suppressMoveWhenRowDragging={true} 
                                                    onRowDragEnd={onRowDragEnd}
                                                    animateRows={true}
                                                    getRowId={getRowNodeId}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </FieldContainer>
                            :
                            ''
                        }

                                                       

                    </ContentContainer>
                </MainContainer>
                <ModalFooter style={{border:0}}>
                    <SuccesLoaderButton title={'Submit'} loading={loading} loadingTitle={"Please wait..."} disabled={loading} />
                    <button type='button' className="btn btn-secondary btn-sm me-2" onClick={closeModalForm} disabled={loading}>Close</button>
                </ModalFooter>
            </FormContainer>
        </FormModal>
        
    )
}

export default UserGridCustomDisplayModal
