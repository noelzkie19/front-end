import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Col, FormLabel, ModalFooter, Row } from "react-bootstrap-v5";
import { DefaultSecondaryButton, FormModal, LocalGridPagination, MainContainer, MlabButton, RequiredLabel, TableIconButton } from "../../../custom-components";
import Select from 'react-select';
import { ElementStyle, PROMPT_MESSAGES } from "../../../constants/Constants";
import { AgGridReact } from "ag-grid-react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import swal from 'sweetalert';
import { useSystemOptionHooks } from "../../system/shared";
import { OptionListModel } from "../../../common/model";
import { TopicSubtopicFilterModel } from "../models/TopicSubtopicFilterModel";
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface Props {
    showForm: boolean;
    caseTypeFilter: any;
    resetCaseTypeFilter: boolean;
    setTopicSubtopicFilter: any;
    closeModal: () => void;
}

export const TopicSubtopicFilter: React.FC<Props> = ({showForm, caseTypeFilter, resetCaseTypeFilter, setTopicSubtopicFilter, closeModal}) => {

    // HOOKS
    const {
		getLanguageOptions,
		languageOptions,
		isLanguageLoading,
        getTopicLanguageOptions,
        topicLanguageOptions,
        isTopicLanguageLoading,
        getSubtopicLanguageOptions,
        subtopicLanguageOptions,
        isSubtopicLanguageLoading
	} = useSystemOptionHooks();

    // STATES
    const [language, setLanguage] = useState<any>('');
    const [topicLanguage, setTopicLanguage] = useState<any>('');
    const [subtopicLanguage, setSubtopicLanguage] = useState<any>('');
    
    const [disableAddFilter, setDisableAddFilter] = useState<boolean>(false);
    const [disableSubmit, setDisableSubmit] = useState<boolean>(true);
    const [disableTopic, setDisableTopic] = useState<boolean>(false);
    const [disableSubtopic, setDisableSubtopic] = useState<boolean>(false);

    const [gridRowData, setGridRowData] = useState<Array<TopicSubtopicFilterModel>>([]);
    const [sortColumn, setSortColumn] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<string>('desc');
    const [gridPageSize, setGridPageSize] = useState<number>(10);
	const [gridCurrentPage, setGridCurrentPage] = useState<number>(1);
	const [gridTotalPages, setGridTotalPages] = useState<number>(1);

    const [submittedData, setSubmittedData] = useState<Array<TopicSubtopicFilterModel>>([]); 

    // CONSTANTS
    const gridRef: any = useRef();
    const UnselectedTopicLanguageOptions = topicLanguageOptions.filter(({value: value}) => !gridRowData.some(({topicLanguageId: topicLanguageId}) => topicLanguageId.toString() === value));

    // WATCHERS
    useEffect(() => {
        if (showForm) {
            getLanguageOptions();

            if (resetCaseTypeFilter) {
                handleClearFields("onCloseWithNoData");
                setGridRowData([]);
                setSubmittedData([]);
            }
        }
    }, [showForm]);

    useEffect(() => {
        let hasValue = subtopicLanguage.length === 0 ? true : false;
        setDisableAddFilter(hasValue);
    }, [subtopicLanguage]);

    // METHODS
    const handleChangeLanguage = (model: OptionListModel) => {
        if (gridRowData.length != 0 && gridRowData[0].languageId.toString() != model.value) {
            swal({
                title: PROMPT_MESSAGES.ConfirmClearTitle,
                text: PROMPT_MESSAGES.ConfirmClearMessage('existing topic/subtopic selection'),
                icon: 'warning',
                buttons: ['No', 'Yes'],
                dangerMode: true,
            }).then((toConfirm) => {
                if (toConfirm) {
                    handleClearFields("onChangeLanguage");
                    setLanguage(model);
                    loadTopicLanguageOptions(model.value, caseTypeFilter.value);
                }
            });
        } else {
            setTopicLanguage('');
            setSubtopicLanguage('');
            setDisableTopic(false);
            setLanguage(model);
            loadTopicLanguageOptions(model.value, caseTypeFilter.value);
        }
	};

    const loadTopicLanguageOptions = (languageCode: string, caseTypeId: number) => {
        if (languageCode && caseTypeId) {
            getTopicLanguageOptions(languageCode, caseTypeId);
        }
    };

    const handleChangeTopicLanguage = (model: OptionListModel) => {
        setSubtopicLanguage('');
        setTopicLanguage(model);

        //Defaulting subtopic to ALL if topic is ALL
        if (parseInt(model.value) == 0) {
            setSubtopicLanguage([{'label': 'ALL', 'value': '0'}]);
            setDisableSubtopic(true);
        } else {
            loadSubtopicLanguageOptions(parseInt(model.value));
            setDisableSubtopic(false);
        }
    };

    const loadSubtopicLanguageOptions = (topicLanguageId: number) => {
        if (topicLanguageId) {
            getSubtopicLanguageOptions(topicLanguageId);
        }
    };

    const handleChangeSubtopicLanguage = (model: OptionListModel) => {

        //Disabling and Removing subtopic values when selecting ALL
        const tempHolder: any = model;
        const isSelectedAll = tempHolder.find((item: any) => {
            return (item.value).includes('0 -');
        });

        if (isSelectedAll) {
            setSubtopicLanguage(isSelectedAll);
            setSubtopicLanguage([{'label': isSelectedAll.label, 'value': isSelectedAll.value}]);
            setDisableSubtopic(true);
        } else {
            setSubtopicLanguage(model);
            setDisableSubtopic(false);
        }
    };

    const handleAddFilter = () => {
        const newData: TopicSubtopicFilterModel = {
            languageId:  language.value,
            topicLanguageId: topicLanguage.value,
            topicLanguageTranslation: topicLanguage.label,
            subtopicLanguageId: subtopicLanguage ? subtopicLanguage.map((x: any) => x.value).join(', ') : '',
            subtopicLanguageTranslation: subtopicLanguage ? subtopicLanguage.map((x: any) => x.label).join(', '): ''
        };

        if (gridRowData.length > 0 && topicLanguage.value == 0) {
            swal({
                title: PROMPT_MESSAGES.ConfirmClearTitle,
                text: PROMPT_MESSAGES.ConfirmClearMessage('existing topic/subtopic selection'),
                icon: 'warning',
                buttons: ['No', 'Yes'],
                dangerMode: true,
            }).then((toConfirm) => {
                if (toConfirm) {
                    setGridRowData([newData]);
                    setSubtopicLanguage('');
                    setTopicLanguage('');  
                    setDisableSubmit(false);
                    setDisableTopic(topicLanguage.value == 0 ? true : false);
                }
            });
        } else {
            setGridRowData([...gridRowData, newData]);
            setSubtopicLanguage('');
            setTopicLanguage('');  
            setDisableSubmit(false);
            setDisableTopic(topicLanguage.value == 0 ? true : false);
        }
    };

    const handleRemoveFilter = (data: TopicSubtopicFilterModel) => {
        swal({
            title: PROMPT_MESSAGES.ConfirmRemoveTitle,
            text: PROMPT_MESSAGES.ConfirmRemoveMessage('selected topic/subtopic filters'),
            icon: 'warning',
            buttons: ['No', 'Yes'],
            dangerMode: true,
        }).then((toConfirm) => {
            if (toConfirm) {
                const newSetData = gridRowData.filter((x) => x !== data);
                setGridRowData(newSetData);
                setDisableTopic(false);
            }
        });
        
    };

    const handleSubmitModal = () => {
        swal({
            title: PROMPT_MESSAGES.ConfirmSubmitTitle,
            text: PROMPT_MESSAGES.ConfirmSubmitMessageSave('selected topic/subtopic filters'),
            icon: 'warning',
            buttons: ['No', 'Yes'],
            dangerMode: true,
        }).then((toConfirm) => {
            if (toConfirm) {
                //assign values to props
                setTopicSubtopicFilter([...gridRowData]);
                setSubmittedData([...gridRowData]);
                handleClearFields(gridRowData.length > 0 ? "onSubmitWithData" : "onSubmitWithNoData" );
                closeModal();
            }
        });
    };

    const handleCloseModal = () => {
        if (JSON.stringify(gridRowData) != JSON.stringify(submittedData)) {
            swal({
                title: PROMPT_MESSAGES.ConfirmCloseTitle,
                text: PROMPT_MESSAGES.ConfirmCloseMessage,
                icon: 'warning',
                buttons: ['No', 'Yes'],
                dangerMode: true,
            }).then((toConfirm) => {
                if (toConfirm) {
                    setGridRowData([...submittedData]);
                    handleClearFields(submittedData.length > 0 ? "onCloseWithData" : "onCloseWithNoData");
                    setDisableTopic(submittedData.length > 0 && submittedData[0].topicLanguageId == 0 ? true : false);
                    closeModal();
                }
            });
        } else {
            handleClearFields(submittedData.length > 0 ? "onCloseWithData" : "onCloseWithNoData");
            closeModal();
        }
	};

    const handleClearFields = (action: string) => {
        switch (action) {
            case "onChangeLanguage":
                setGridRowData([]);
                setTopicLanguage('');
                setSubtopicLanguage('');
                setDisableTopic( false);
                break;
            case "onSubmitWithNoData":
                setLanguage('');
                setTopicLanguage('');
                setSubtopicLanguage('');
                break;
            case "onSubmitWithData": 
                setTopicLanguage('');
                setSubtopicLanguage('');
                break;
            case "onCloseWithNoData":
                setLanguage('');
                setTopicLanguage('');
                setSubtopicLanguage('');
                break;
            case "onCloseWithData":
                setTopicLanguage('');
                setSubtopicLanguage('');
                break;
        };
    };

    // AG-GRID
    const gridDefaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        wrapText: true,
        autoHeight: true
    }), []);

    const gridColumnDefs : (ColDef<TopicSubtopicFilterModel> | ColGroupDef<TopicSubtopicFilterModel>)[] =[
        {
            headerName: 'Topic', 
            field: 'topicLanguageTranslation',
            maxWidth: 350
        },
        {
            headerName: 'Subtopic', 
            field: 'subtopicLanguageTranslation',        
            cellStyle: {'line-height': '2'}
        },
        {
            headerName: 'Action',
            field: 'topicLanguageId',
            maxWidth: 150,
            cellRenderer: (params: any) => (
				<>
                    <TableIconButton access={true}
						faIcon={faTrash}
						isDisable={false}
						toolTipText={'Remove'}
						iconColor={'text-danger'}
						onClick={() => handleRemoveFilter(params.data)} />
				</>
            ),
        },
    ];

    const handleGridReady = (params: any) => {
        params.api.sizeColumnsToFit();
    };

    const handleSort = (e: any) => {
        if(gridRowData !== undefined && gridRowData.length > 0) {
            let sortDetail = e.api.getSortModel();
            if (sortDetail[0] !== undefined) {
                setSortColumn(sortDetail[0]?.colId);
                setSortOrder(sortDetail[0]?.sort);
            } else {
                setSortColumn('');
                setSortOrder('');
            }
        }
    };

    const handlePagination = useCallback(() => {
		if (gridRef.current.api) {
			setGridPageSize(gridRef.current.api.paginationGetPageSize());
			setGridCurrentPage(gridRef.current.api.paginationGetCurrentPage() + 1);
			setGridTotalPages(gridRef.current.api.paginationGetTotalPages());
		}
	}, []);

    return (
        <FormModal headerTitle="Topic/Subtopic Filter" haveFooter={false} show={showForm} customSize={'xl'}>
            <MainContainer>
                <Row>
                    <FormLabel style={{fontStyle:'italic'}}> Choose Topic(s) and Subtopic(s) as filters </FormLabel>
                </Row>
                <Row>
                    <Col sm={3}>
                        <RequiredLabel title="Language" />
                        <Select style={{width: '100%'}}
							options={languageOptions.filter((x) => x.isComplete === true).flatMap((x) => [
                                {label: x.languageName, value: x.languageCode?.toString()},
                            ])}
							onChange={(val: any) => handleChangeLanguage(val)}
							value={language} />
                    </Col>
                    <Col sm={3}>
                        <RequiredLabel title="Topic" />
                        <Select style={{width: '100%'}}
                            isDisabled={language.length === 0 || disableTopic}
							options={UnselectedTopicLanguageOptions}
							onChange={(val: any) => handleChangeTopicLanguage(val)}
                            disabled={language.length > 0}
							value={topicLanguage} />
                    </Col>
                    <Col sm={6}>
                        <RequiredLabel title="Subtopic" />
                        <Select isMulti
                            style={{width: '100%'}}
                            isDisabled={topicLanguage.length === 0 || disableSubtopic}
							options={subtopicLanguageOptions}
							onChange={(val: any) => handleChangeSubtopicLanguage(val)}
							value={subtopicLanguage} />
                    </Col>
                </Row>
                <Row style={{marginTop: 20}}>
                    <Col sm={12}>
                        <label />
                        <MlabButton access={true}
                            size={'sm'}
							label={'Add Filter'}
							style={ElementStyle.primary}
							type={'button'}
							weight={'solid'}
							loading={false}
							disabled={disableAddFilter}
							loadingTitle={' Please wait...'}
							onClick={handleAddFilter} />
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
						<div className='ag-theme-quartz mt-5' style={{height: 300, width: '100%'}}>
                            <AgGridReact animateRows={true}
                                defaultColDef={gridDefaultColDef}
                                columnDefs={gridColumnDefs}
                                rowData={gridRowData}
                                ref={gridRef}
                                onGridReady={handleGridReady}
                                onSortChanged={handleSort}
                                rowBuffer={0}
                                enableRangeSelection={true}
                                suppressPaginationPanel={true}
								suppressScrollOnNewData={true}
                                pagination={true}
                                paginationPageSize={gridPageSize}
                                onPaginationChanged = {handlePagination} />
                            <LocalGridPagination customId={'topic-subtopic-filter'}
								recordCount={gridRowData.length}
								gridCurrentPage={gridCurrentPage}
								gridPageSize={gridPageSize}
								setGridPageSize={setGridPageSize}
								gridTotalPages={gridTotalPages}
								gridRef={gridRef} />
                        </div>
                    </Col>
                </Row>
            </MainContainer>
            <ModalFooter style={{border: 0}}>
				<MlabButton access={true}
					size={'sm'}
					label={'Submit'}
					style={ElementStyle.primary}
					type={'button'}
					weight={'solid'}
					loadingTitle={' Please wait...'}
                    disabled={disableSubmit}
					onClick={handleSubmitModal} />
				<DefaultSecondaryButton access={true} title={'Close'} onClick={handleCloseModal} />
			</ModalFooter>
        </FormModal>
    );
};

export default TopicSubtopicFilter;