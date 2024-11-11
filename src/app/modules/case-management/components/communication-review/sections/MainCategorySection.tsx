import { useEffect, useState } from 'react';
import '../../../css/MainCategory.css';
import { CommunicationReviewAssessmentModel } from '../../../models/CommunicationReviewAssessmentModel';
import { MainContainer } from '../../../../../custom-components';
import { Col, OverlayTrigger, Row, Tooltip } from 'react-bootstrap-v5';
import { AgGridReact } from 'ag-grid-react';
import useCommunicationReviewConstant from '../../../constants/CommunicationReviewConstant';
import useCommunicationReviewHooks from '../../../shared/hooks/useCommunicationReviewHooks';
import { MainCategorySectionViewModel } from '../../../models/viewModels/MainCategorySectionViewModel';
import CriteriaEditor from './CriteriaEditor';
import { CommunicationReviewHighestCriteriaMeasurementModel } from '../../../models/CommunicationReviewHighestCriteriaMeasurementModel';
import { CommunicationReviewAssessmentListModel } from '../../../models/CommunicationReviewAssessmentListModel';
import swal from 'sweetalert';
import { MAIN_CATEGORY_VIEW_DEFAULT } from '../../../constants/CommunicationReviewDefault';
import { ReviewAssestmentCommentViewModel } from '../../../models/viewModels/ReviewAssestmentCommentViewModel';
import useConstant from '../../../../../constants/useConstant';
import CommentModal from '../../../modals/CommentModal';
import ActionRenderer from '../../../shared/components/ActionRenderer';
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface Props {
  pageMode: number,
  stateData: CommunicationReviewAssessmentModel;
  stateChange: any,
  reviewStarted: boolean
}


/* AG-Grid */
 const CellTooltipRenderer = (props: any) => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const { data } = props;
  
  const onToggle = (e: any) => {
    setShowTooltip(e);
  }

  const isCriteria = props.column.colId.toLowerCase() === "qualityreviewmeasurementcriterianame";
  let tooltipValue = props.value;

  if (isCriteria) {
    const criteriaSelectedValue = props.colDef.cellEditorParams.optionList.filter((x: any) => x.qualityReviewCriteriaId === data.qualityReviewMeasurementCriteriaId);
    if (criteriaSelectedValue.length > 0) {
      tooltipValue = criteriaSelectedValue[0].description;
    }
  }

  return (
    <OverlayTrigger onToggle={onToggle} show={showTooltip} delay={{ show: 700, hide: 0 }} placement='right' overlay={<Tooltip id='button-tooltip-2' className="dropdown-tooltip"><span dangerouslySetInnerHTML={{ __html: tooltipValue }} /></Tooltip>}>
      <div className="overlap-ellipsis">{props.value}</div>
    </OverlayTrigger>
  )
};

const MainCategorySection: React.FC<Props> = ({ pageMode, stateData, stateChange, reviewStarted }) => {
  
  const { ACTION_MODE, MEASUREMENT_TYPE, FIELD_LABELS } = useCommunicationReviewConstant();
  const PaddedDiv = <div style={{margin: 20}} />;
  const {SwalCommunicationReviewConfirmMessage , SwalCommentSuccessRecordMessage , SwalCommentCancelMessage} = useConstant();
  /* States */
  const [rowData, setRowData] = useState<Array<MainCategorySectionViewModel>>([]);
  const [categoryTotalScore, setCategoryTotalScore] = useState<number>(0);
  const [categoryTotalHighestCriteriaScore, setCategoryTotalHighestCriteriaScore] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<MainCategorySectionViewModel>(MAIN_CATEGORY_VIEW_DEFAULT);
  const [selectedComment, setSelectedComment] = useState<ReviewAssestmentCommentViewModel>();
  const [isWithAutoFail, setIsWithAutoFail] = useState<boolean>(false);
  const [isCommentDisable, setIsCommentDisable] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');

  /* Hooks */
  const { getCriteriaList, criteriaOptionList } = useCommunicationReviewHooks();

  /* Mount */
  useEffect(() => {
    getCriteriaList(null);
  }, []);

  /* Effects */
  useEffect(() => {
		if (stateData && stateData.reviewAssessmentList.length > 0) {
			const categoryAssessment: Array<MainCategorySectionViewModel> = stateData.reviewAssessmentList
				.filter(x => x.qualityReviewMeasurementTypeId === MEASUREMENT_TYPE.main)
				.map(x => {
          const selectedCriteria = criteriaOptionList?.find(y => y.qualityReviewCriteriaId === x.qualityReviewMeasurementCriteriaId);
          const displayCode = selectedCriteria?.code ?? ''
          const displayName = selectedCriteria?.criteriaName ?? ''
          return {
            qualityReviewMeasurementId: x.qualityReviewMeasurementId,
            qualityReviewMeasurementName: x.qualityReviewMeasurementName,
            qualityReviewMeasurementCriteriaId: x.qualityReviewMeasurementCriteriaId,
            qualityReviewMeasurementCriteriaName: displayCode + ' ' + displayName,
            qualityReviewMeasurementScoreAndRanking: (selectedCriteria?.score || selectedCriteria?.rankingName) ? `${selectedCriteria?.score ?? ''} - ${selectedCriteria?.rankingName ?? ''}` : '',
            qualityReviewMeasurementIsAutoFailed:reviewMeasurementIsAutoFailed(selectedCriteria,x.qualityReviewMeasurementCriteriaId), //Sonar Issue
            qualityReviewMeasurementScore: x.qualityReviewMeasurementScore ?? 0,
            remarks: x.remarks,
            suggestions: x.suggestions,
            isAutoFail: selectedCriteria?.isAutoFailed
          }
        });
			setRowData(categoryAssessment);

      //Reload Total Highest Criteria per Measurement
      reloadTotalHighestCriteria();
      //Total Score Rebinding based on Page Mode
      totalScoreByPageMode(categoryAssessment);
   
		}
	}, [stateData]);

  useEffect(() => {
		if (stateData.mainCategoryTotalScore != categoryTotalScore) {
			handleStateChange();
		}
	}, [categoryTotalScore]);

  useEffect(() => {
    if(isWithAutoFail) {
      handleStateChange();
      setIsWithAutoFail(false);
    }
  },[isWithAutoFail])

  const reloadTotalHighestCriteria = () => {
     //Reload Total Highest Criteria per Measurement
     if(stateData.mainCategoryTotalHighestCriteriaScore === 0 && categoryTotalHighestCriteriaScore === 0 && criteriaOptionList.length > 0) {
      getHighestCriteriaMeasurement();
    } else if (categoryTotalHighestCriteriaScore === 0) {
      setCategoryTotalHighestCriteriaScore(stateData.mainCategoryTotalHighestCriteriaScore);
    }

  }
  const totalScoreByPageMode = (categoryAssessment: Array<MainCategorySectionViewModel>) => {
    if(pageMode === ACTION_MODE.View) {
      const updateTotalScore = categoryAssessment.reduce((accumulator, item) => accumulator + item.qualityReviewMeasurementScore, 0);
      if(categoryAssessment.filter(d=> d.qualityReviewMeasurementIsAutoFailed === 'Yes').length > 0){
        setCategoryTotalScore(0)
      } else {
        setCategoryTotalScore(updateTotalScore);
      } 
    } else {
      setCategoryTotalScore(stateData.mainCategoryTotalScore);
    }
  }
  const reviewMeasurementIsAutoFailed = (selectedCriteria: any,qualityReviewMeasurementCriteriaId: number) => {
    let qualityReviewMeasurementIsAutoFailed = '';

    if (selectedCriteria?.isAutoFailed !== undefined) {
      qualityReviewMeasurementIsAutoFailed = selectedCriteria.isAutoFailed ? 'Yes' : 'No';
    } else if (qualityReviewMeasurementCriteriaId !== 0) {
      qualityReviewMeasurementIsAutoFailed = 'No';
    }
    return qualityReviewMeasurementIsAutoFailed;
  }

  const setScoreAndRankingAndAutoFailedValue = (rowId: any, criteriaId: any, qualityReviewMeasurementId: any) => {
    const criteria: any = criteriaOptionList?.filter((x: any) => x.qualityReviewCriteriaId === criteriaId);
    const updateRowData = rowData.map(ctgry => {
      if (ctgry.qualityReviewMeasurementId === qualityReviewMeasurementId) {
        return {
          ...ctgry, 
          qualityReviewMeasurementCriteriaId: criteriaId,
          qualityReviewMeasurementCriteriaName: criteria[0].code + ' ' + criteria[0].criteriaName,
          qualityReviewMeasurementScore: criteria[0].score,
          qualityReviewMeasurementScoreAndRanking: `${criteria[0].score} - ${criteria[0].rankingName}`,
          qualityReviewMeasurementIsAutoFailed: !criteria[0].isAutoFailed ? 'No' : 'Yes',
          isAutoFail: criteria[0].isAutoFailed
        };
      }
      return ctgry;
    })

   if(criteria[0]?.isAutoFailed) {
        swal({
          title: 'Warning!',
          text: SwalCommunicationReviewConfirmMessage.textAutoFailConfirm,
          icon: 'warning',
          buttons: {
            confirm: {
              text: 'OK',
              value: true,
              visible: true,
              className: 'swal-button--confirm',
            },
          }
        }).then((response) => {
          if (response) {
            setCategoryTotalScore(0);
          }
        });
    } else {
      const updateTotalScore = updateRowData.reduce((accumulator, item) => accumulator + parseFloat(item.qualityReviewMeasurementScore), 0);
      if(updateRowData.filter(d=> d.qualityReviewMeasurementIsAutoFailed === 'Yes').length > 0){
        setCategoryTotalScore(0)
        setIsWithAutoFail(true)
      } else {
        setCategoryTotalScore(updateTotalScore);
      }
    }
    setRowData(updateRowData); 
  }

	const defaultColDef = {
      resizable: true,
		  sortable: true,
		  suppressSizeToFit: false
	};

	const columnDefs : (ColDef<MainCategorySectionViewModel> | ColGroupDef<MainCategorySectionViewModel>)[] =[
    {
      headerName: 'No.',
      valueGetter: (params: any) => params.node.rowIndex + 1,
      sortable: false,
      minWidth: 50,
      width: 70,
    },
    {
      headerName: 'Measurement Name',
      field: 'qualityReviewMeasurementName',
      minWidth: 100,
      cellRenderer: CellTooltipRenderer ,
      flex: 1
    },
    {
      headerName: 'Criteria',
      field: 'qualityReviewMeasurementCriteriaName',
      editable: reviewStarted,
      singleClickEdit: true,
      cellRenderer: CellTooltipRenderer ,
      cellEditor: 'criteriaEditor',
      cellEditorParams: {
        optionList: criteriaOptionList,
        callbackFunction: setScoreAndRankingAndAutoFailedValue,
      },
      minWidth: 100,
      flex: 1
    },
    {
      headerName: 'Score and Ranking',
      field: 'qualityReviewMeasurementScoreAndRanking',
      cellRenderer: CellTooltipRenderer,
      minWidth: 100,
      flex: 1
    },
    {
      headerName: 'Auto-Failed',
      field: 'qualityReviewMeasurementIsAutoFailed',
      maxWidth: 110,
      flex: 1
    },
    {
      headerName: 'Comment',
      sortable: false,
      cellRenderer: (params: any) => cellRenderer(params)
    }
	];

  const cellRenderer = (params: any) => {
     return (
      <ActionRenderer 
          data = {params.data}
          pageMode={pageMode}
          reviewStarted = {reviewStarted}
          addCustomEvent={addCustomEvent}
          editCustomEvent={editCustomEvent}
          viewCustomEvent={viewCustomEvent}
          removeCustomEvent={removeCustomEvent}
          type={1}
         />
     )
  }

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
		params.api.hideOverlay();
	};

  /* Functions */
  const getHighestCriteriaMeasurement = () => {
    const measurementHighestCriteria: Array<CommunicationReviewHighestCriteriaMeasurementModel> = stateData.reviewAssessmentList
        .filter(x => x.qualityReviewMeasurementTypeId === MEASUREMENT_TYPE.main)
				.map(x => {
          let highestCriteriaScore = 0;
          const measurementCriteria = criteriaOptionList.filter(c => c.qualityReviewMeasurementId === x.qualityReviewMeasurementId);
          if (measurementCriteria.length > 0) {
            highestCriteriaScore = measurementCriteria.reduce((carry: any, item: any) => item.score > carry.score ? item : carry).score;
          }
          return {
            qualityReviewMeasurementId: x.qualityReviewMeasurementId,
            highestCriteriaScore: highestCriteriaScore
          }
      });
    const totalHighestCriteria = measurementHighestCriteria.reduce((accumulator, item) => accumulator + item.highestCriteriaScore, 0);
    setCategoryTotalHighestCriteriaScore(totalHighestCriteria);
  };

  const handleStateChange = () => {
		const newReviewAssessmentList: Array<CommunicationReviewAssessmentListModel> = stateData?.reviewAssessmentList.map(currentData => {
			if (currentData.qualityReviewMeasurementTypeId === MEASUREMENT_TYPE.main) {
				let newData = rowData.find(x => x.qualityReviewMeasurementId === currentData.qualityReviewMeasurementId);
				if (newData) {
					currentData.communicationReviewAssessmentId = 0;
          currentData.qualityReviewMeasurementCriteriaId = newData.qualityReviewMeasurementCriteriaId
					currentData.qualityReviewMeasurementScore	 = newData.qualityReviewMeasurementScore;
          currentData.remarks = newData.remarks;
          currentData.suggestions = newData.suggestions
          currentData.isAutoFail = newData.isAutoFail
				}
			}
			return currentData;
		}) ?? [];
		const newStateData: CommunicationReviewAssessmentModel = {
			reviewAssessmentList: newReviewAssessmentList,
			mainCategoryTotalScore: categoryTotalScore ?? 0,
			mainCategoryTotalHighestCriteriaScore: categoryTotalHighestCriteriaScore ?? 0, 
			miscellaneousTotalScore: stateData?.miscellaneousTotalScore ?? 0
		}
		stateChange(newStateData);
	};

  const addCustomEvent = (value: any) => {
    setSelectedCategory(value);
    setModalTitle('Add Comment');
    setShowModal(true);
  }
  
  const editCustomEvent = (value: any) => {
    let newData: ReviewAssestmentCommentViewModel = {
      qualityReviewMeasurementId: value.qualityReviewMeasurementId,
      remarks: value ? value?.remarks : '' ,
      suggestions:  value ? value?.suggestions : '' ,
    }
    setSelectedCategory(value);
    setSelectedComment(newData);
    setModalTitle('Edit Comment')
    setShowModal(true);
  }

  const removeCustomEvent = (value: any) => {
    swal({
			title: 'Confirmation',
			text: 'This action will remove the record, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((willDelete) => {
			if (willDelete) {
        removeComments();
				clearData();
			}
		});
  }

  const removeComments = () => {
    const newReviewAssessmentList: Array<CommunicationReviewAssessmentListModel> = stateData?.reviewAssessmentList.map(currentData => {
      if (currentData.qualityReviewMeasurementTypeId === MEASUREMENT_TYPE.main) {
        if (selectedComment && selectedComment?.qualityReviewMeasurementId === currentData.qualityReviewMeasurementId) {
          currentData.remarks = '';
          currentData.suggestions = ''
        }
      }
      return currentData;
    }) ?? [];
    const newStateData: CommunicationReviewAssessmentModel = {
      reviewAssessmentList: newReviewAssessmentList,
      mainCategoryTotalScore: categoryTotalScore ?? 0,
      mainCategoryTotalHighestCriteriaScore: categoryTotalHighestCriteriaScore ?? 0, 
      miscellaneousTotalScore: stateData?.miscellaneousTotalScore ?? 0
    }
    stateChange(newStateData);
  }

  const viewCustomEvent = (value: any) => {
    let newData: ReviewAssestmentCommentViewModel = {
      qualityReviewMeasurementId: value.qualityReviewMeasurementId,
      remarks: value ? value?.remarks : '' ,
      suggestions:  value ? value?.suggestions : '' ,
    }
    setSelectedCategory(value);
    setSelectedComment(newData);
    setIsCommentDisable(true);
    setModalTitle('View Comment');
    setShowModal(true);
  }

  const handleSaveComment = () => {
    const successType = selectedCategory.remarks === '' && selectedCategory.suggestions === '' ? SwalCommentSuccessRecordMessage.textAdded : SwalCommentSuccessRecordMessage.textUpdated;
    const updateRowData = rowData.map(ctgry => {
      if (ctgry.qualityReviewMeasurementId === selectedComment?.qualityReviewMeasurementId) {
        return {
          ...ctgry, 
          remarks: selectedComment.remarks,
          suggestions: selectedComment.suggestions
         };
      }
      return ctgry;
    })
  
		updateChange(updateRowData);
    setRowData(updateRowData);
    swal(SwalCommentSuccessRecordMessage.title, successType, SwalCommentSuccessRecordMessage.icon);
    setShowModal(false);
    clearData();
	};

  const updateChange = (updateRowData: Array<MainCategorySectionViewModel>) => {
    const newReviewAssessmentList: Array<CommunicationReviewAssessmentListModel> = stateData?.reviewAssessmentList.map(currentData => {
			if (currentData.qualityReviewMeasurementTypeId === MEASUREMENT_TYPE.main) {
				let newData = updateRowData.find(x => x.qualityReviewMeasurementId === currentData.qualityReviewMeasurementId);
				if (newData) {
					currentData.communicationReviewAssessmentId = 0;
          currentData.qualityReviewMeasurementCriteriaId = newData.qualityReviewMeasurementCriteriaId
					currentData.qualityReviewMeasurementScore	 = newData.qualityReviewMeasurementScore;
          currentData.remarks = newData.remarks;
          currentData.suggestions = newData.suggestions
				}
			}
			return currentData;
		}) ?? [];
		const newStateData: CommunicationReviewAssessmentModel = {
			reviewAssessmentList: newReviewAssessmentList,
			mainCategoryTotalScore: categoryTotalScore ?? 0,
			mainCategoryTotalHighestCriteriaScore: categoryTotalHighestCriteriaScore ?? 0, 
			miscellaneousTotalScore: stateData?.miscellaneousTotalScore ?? 0
		}
    stateChange(newStateData);
  }

  const _close = () => {
    if(selectedCategory.remarks !== selectedComment?.remarks) {
      swal({
        title: 'Confirmation',
        text: 'Any changes will be discarded, please confirm',
        icon: 'warning',
        buttons: ['No', 'Yes'],
        dangerMode: true,
      }).then((willUpdate) => {
        if (willUpdate) {
          swal(SwalCommentCancelMessage.title, SwalCommentCancelMessage.textCancel, SwalCommentCancelMessage.icon);
          setShowModal(false);
          clearData();
        }
      });
    }else {
      setShowModal(false);
      clearData();
    }
	};

  const clearData = () => {
		const clearComment: ReviewAssestmentCommentViewModel = {
      qualityReviewMeasurementId: selectedComment ? selectedComment?.qualityReviewMeasurementId : 0,
      remarks: '',
      suggestions: ''
    }

    setSelectedComment(clearComment);
    setIsCommentDisable(false);
	};

  return (
    <MainContainer>
      <div style={{ margin: 20 }}>
        <Col sm={12}>
          <p className='fw-bolder required'>Main Category</p>
        </Col>
        <Row>
          <Col sm={12}>
            <div className='ag-theme-quartz' style={{ height: 400, width: '100%' }}>
              <AgGridReact
                rowData={rowData}
                defaultColDef={defaultColDef}
                columnDefs={columnDefs}
                onGridReady={onGridReady}
                components={{ criteriaEditor: CriteriaEditor }}
              />
            </div>
          </Col>
        </Row>
        {PaddedDiv}
        <Row>
          <Col sm={12} className="main-total-score-container">
            <span>{FIELD_LABELS.TotalScore}</span>
            <input type="text" value={categoryTotalScore} disabled={true}/>
          </Col>
        </Row>
      </div>
      <CommentModal
          showModal = {showModal}
          isCommentDisable = {isCommentDisable}
          modalTitle= {modalTitle}
          selectedComment = {selectedComment}
          stateChange = {setSelectedComment}
          qualityReviewMeasurementId = {selectedCategory.qualityReviewMeasurementId}
          isAutoFail = {selectedCategory.isAutoFail}
          handleSaveComment = {handleSaveComment}
          _close = {_close}
        ></CommentModal>
    </MainContainer>
  );
}

export default MainCategorySection;