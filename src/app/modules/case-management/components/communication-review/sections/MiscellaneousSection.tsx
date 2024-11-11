import {ColDef, ColGroupDef} from 'ag-grid-community';
import {AgGridReact} from 'ag-grid-react';
import {useEffect, useState} from 'react';
import {Tooltip} from 'react-bootstrap';
import {Col, OverlayTrigger, Row} from 'react-bootstrap-v5';
import swal from 'sweetalert';
import useConstant from '../../../../../constants/useConstant';
import {MainContainer} from '../../../../../custom-components';
import '../../../../campaign-management/components/ReviewMiscellaneous.css';
import useCommunicationReviewConstant from '../../../constants/CommunicationReviewConstant';
import {MISCELLANEOUS_VIEW_DEFAULT} from '../../../constants/CommunicationReviewDefault';
import CommentModal from '../../../modals/CommentModal';
import {CommunicationReviewAssessmentListModel} from '../../../models/CommunicationReviewAssessmentListModel';
import {CommunicationReviewAssessmentModel} from '../../../models/CommunicationReviewAssessmentModel';
import {MiscellaneousSectionViewModel} from '../../../models/viewModels/MiscellaneousSectionViewModel';
import {ReviewAssestmentCommentViewModel} from '../../../models/viewModels/ReviewAssestmentCommentViewModel';
import ActionRenderer from '../../../shared/components/ActionRenderer';
import ScoringEditor from './ScoringEditor';

interface Props {
	pageMode: number;
	stateData: CommunicationReviewAssessmentModel;
	stateChange: any;
	reviewStarted: boolean;
}

const MiscellaneousSection: React.FC<Props> = ({pageMode, stateData, stateChange, reviewStarted}) => {
	const {ACTION_MODE, MEASUREMENT_TYPE, FIELD_LABELS} = useCommunicationReviewConstant();
	const PaddedDiv = <div style={{margin: 20}} />;
	const {SwalCommentSuccessRecordMessage} = useConstant();

	/* States */
	const [rowData, setRowData] = useState<Array<MiscellaneousSectionViewModel>>([]);
	const [miscTotalScore, setMiscTotalScore] = useState<number>(0);
	const [selectedMiscellaneous, setSelectedMiscellaneous] = useState<MiscellaneousSectionViewModel>(MISCELLANEOUS_VIEW_DEFAULT);
	const [selectedComment, setSelectedComment] = useState<ReviewAssestmentCommentViewModel>();
	const [showModal, setShowModal] = useState<boolean>(false);
	const [isCommentDisable, setIsCommentDisable] = useState<boolean>(false);
	const [modalTitle, setModalTitle] = useState<string>('');
	/* Hooks */

	/* Mount */

	/* Effects */
	useEffect(() => {
		if (stateData && stateData.reviewAssessmentList.length > 0) {
			const miscellaneousAssessment: Array<MiscellaneousSectionViewModel> = stateData.reviewAssessmentList
				.filter((x) => x.qualityReviewMeasurementTypeId === MEASUREMENT_TYPE.miscellaneous)
				.map((x) => ({
					qualityReviewMeasurementId: x.qualityReviewMeasurementId,
					qualityReviewMeasurementName: x.qualityReviewMeasurementName,
					qualityReviewMeasurementScore: x.qualityReviewMeasurementScore ?? 0,
					remarks: x.remarks,
					suggestions: x.suggestions,
				}));
			setRowData(miscellaneousAssessment);

			if (pageMode === ACTION_MODE.View) {
				const updateTotalScore = miscellaneousAssessment.reduce((accumulator, item) => accumulator + item.qualityReviewMeasurementScore, 0);
				setMiscTotalScore(updateTotalScore);
			} else {
				setMiscTotalScore(stateData.miscellaneousTotalScore);
			}
		}
	}, [stateData]);

	useEffect(() => {
		if (stateData.miscellaneousTotalScore != miscTotalScore) {
			handleStateChange();
		}
	}, [miscTotalScore]);

	/* AG-Grid */
	const measurementNameRenderer = ({data}: any) => {
		return (
			<OverlayTrigger
				placement='right'
				delay={{show: 250, hide: 400}}
				overlay={<Tooltip id='button-tooltip-2'>{data.qualityReviewMeasurementName}</Tooltip>}
			>
				<div>{data.qualityReviewMeasurementName}</div>
			</OverlayTrigger>
		);
	};

	const onMiscScoreChange = ({data}: any) => {
		if (Math.abs(parseFloat(data.qualityReviewMeasurementScore)) <= 10) {
			if (!reviewStarted) {
				const noScores = rowData.map((misc: MiscellaneousSectionViewModel) => {
					return {...misc, qualityReviewMeasurementScore: 0};
				});
				setRowData(noScores);
			} else {
				const updateScore = rowData.map((misc: MiscellaneousSectionViewModel) => {
					if (misc.qualityReviewMeasurementId === data.qualityReviewMeasurementId) {
						return {...misc, qualityReviewMeasurementScore: data.qualityReviewMeasurementScore};
					}
					return misc;
				});
				const updateTotalScore = updateScore.reduce((accumulator, item) => accumulator + parseFloat(item.qualityReviewMeasurementScore), 0);
				setMiscTotalScore(parseFloat(updateTotalScore.toFixed(2)));
				setRowData(updateScore);
			}
		}
	};

	const defaultColDef = {
		resizable: true,
		sortable: true,
		suppressSizeToFit: false,
	};

	const columnDefs : (ColDef<MiscellaneousSectionViewModel> | ColGroupDef<MiscellaneousSectionViewModel>)[] =[
		{
			headerName: 'No.',
			valueGetter: (params: any) => params.node.rowIndex + 1,
			sortable: false,
			maxWidth: 75,
			minWidth: 75,
		},
		{
			headerName: 'Measurement Name',
			field: 'qualityReviewMeasurementName',
			cellRenderer: measurementNameRenderer,
			minWidth: 100,
			flex: 1,
		},
		{
			headerName: 'Score',
			field: 'qualityReviewMeasurementScore',
			maxWidth: 100,
			minWidth: 100,
			editable: reviewStarted,
			cellEditor: 'scoreEditor',
			onCellValueChanged: onMiscScoreChange,
			flex: 1,
		},
		{
			headerName: 'Comment',
			sortable: false,
			cellRenderer: (params: any) => cellRenderer(params),
		},
	];

	const cellRenderer = (params: any) => {
		return (
			<ActionRenderer
				data={params.data}
				pageMode={pageMode}
				reviewStarted={reviewStarted}
				addCustomEvent={addCustomEvent}
				editCustomEvent={editCustomEvent}
				viewCustomEvent={viewCustomEvent}
				removeCustomEvent={removeCustomEvent}
				type={2}
			/>
		);
	};

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
		params.api.hideOverlay();
	};

	/* Functions */
	const handleStateChange = () => {
		const newReviewAssessmentList: Array<CommunicationReviewAssessmentListModel> =
			stateData?.reviewAssessmentList.map((currentData) => {
				if (currentData.qualityReviewMeasurementTypeId === MEASUREMENT_TYPE.miscellaneous) {
					let newData = rowData.find((x) => x.qualityReviewMeasurementId === currentData.qualityReviewMeasurementId);
					if (newData) {
						currentData.communicationReviewAssessmentId = 0;
						currentData.qualityReviewMeasurementScore = newData.qualityReviewMeasurementScore;
						currentData.remarks = newData.remarks;
						currentData.suggestions = newData.suggestions;
					}
				}
				return currentData;
			}) ?? [];
		const newStateData: CommunicationReviewAssessmentModel = {
			reviewAssessmentList: newReviewAssessmentList,
			mainCategoryTotalScore: stateData?.mainCategoryTotalScore ?? 0,
			mainCategoryTotalHighestCriteriaScore: stateData?.mainCategoryTotalHighestCriteriaScore ?? 0,
			miscellaneousTotalScore: miscTotalScore ?? 0,
		};
		stateChange(newStateData);
	};

	const addCustomEvent = (value: any) => {
		setSelectedMiscellaneous(value);
		setModalTitle('Add Comment');
		setShowModal(true);
	};

	const editCustomEvent = (value: any) => {
		let newData: ReviewAssestmentCommentViewModel = {
			qualityReviewMeasurementId: value.qualityReviewMeasurementId,
			remarks: value ? value?.remarks : '',
			suggestions: value ? value?.suggestions : '',
		};
		setSelectedMiscellaneous(value);
		setSelectedComment(newData);
		setModalTitle('Edit Comment');
		setShowModal(true);
	};

	const viewCustomEvent = (value: any) => {
		let newData: ReviewAssestmentCommentViewModel = {
			qualityReviewMeasurementId: value.qualityReviewMeasurementId,
			remarks: value ? value?.remarks : '',
			suggestions: value ? value?.suggestions : '',
		};
		setSelectedMiscellaneous(value);
		setSelectedComment(newData);
		setIsCommentDisable(true);
		setModalTitle('View Comment');
		setShowModal(true);
	};

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
	};

	const removeComments = () => {
		const newReviewAssessmentList: Array<CommunicationReviewAssessmentListModel> =
			stateData?.reviewAssessmentList.map((currentData) => {
				if (currentData.qualityReviewMeasurementTypeId === MEASUREMENT_TYPE.miscellaneous) {
					if (selectedComment && selectedComment?.qualityReviewMeasurementId === currentData.qualityReviewMeasurementId) {
						currentData.remarks = '';
						currentData.suggestions = '';
					}
				}
				return currentData;
			}) ?? [];
		const newStateData: CommunicationReviewAssessmentModel = {
			reviewAssessmentList: newReviewAssessmentList,
			mainCategoryTotalScore: stateData?.mainCategoryTotalScore ?? 0,
			mainCategoryTotalHighestCriteriaScore: stateData?.mainCategoryTotalHighestCriteriaScore ?? 0,
			miscellaneousTotalScore: stateData?.miscellaneousTotalScore ?? 0,
		};
		stateChange(newStateData);
	};

	const clearData = () => {
		const clearComment: ReviewAssestmentCommentViewModel = {
			qualityReviewMeasurementId: selectedComment ? selectedComment?.qualityReviewMeasurementId : 0,
			remarks: '',
			suggestions: '',
		};

		setSelectedComment(clearComment);
		setIsCommentDisable(false);
	};

	const handleSaveComment = () => {
		const successType =
			selectedMiscellaneous.remarks === '' && selectedMiscellaneous.suggestions === ''
				? SwalCommentSuccessRecordMessage.textAdded
				: SwalCommentSuccessRecordMessage.textUpdated;
		const updateRowData = rowData.map((misc) => {
			if (misc.qualityReviewMeasurementId === selectedComment?.qualityReviewMeasurementId) {
				return {
					...misc,
					remarks: selectedComment.remarks,
					suggestions: selectedComment.suggestions,
				};
			}
			return misc;
		});

		updateChange(updateRowData);
		setRowData(updateRowData);
		swal(SwalCommentSuccessRecordMessage.title, successType, SwalCommentSuccessRecordMessage.icon);
		setShowModal(false);
		clearData();
	};

	const updateChange = (updateRowData: Array<MiscellaneousSectionViewModel>) => {
		const newReviewAssessmentList: Array<CommunicationReviewAssessmentListModel> =
			stateData?.reviewAssessmentList.map((currentData) => {
				if (currentData.qualityReviewMeasurementTypeId === MEASUREMENT_TYPE.miscellaneous) {
					let newData = updateRowData.find((x) => x.qualityReviewMeasurementId === currentData.qualityReviewMeasurementId);
					if (newData) {
						currentData.communicationReviewAssessmentId = 0;
						currentData.qualityReviewMeasurementScore = newData.qualityReviewMeasurementScore;
						currentData.remarks = newData.remarks;
						currentData.suggestions = newData.suggestions;
					}
				}
				return currentData;
			}) ?? [];
		const newStateData: CommunicationReviewAssessmentModel = {
			reviewAssessmentList: newReviewAssessmentList,
			mainCategoryTotalScore: stateData?.mainCategoryTotalScore ?? 0,
			mainCategoryTotalHighestCriteriaScore: stateData?.mainCategoryTotalHighestCriteriaScore ?? 0,
			miscellaneousTotalScore: miscTotalScore ?? 0,
		};
		stateChange(newStateData);
	};

	const _close = () => {
		if (selectedMiscellaneous.remarks !== selectedComment?.remarks) {
			swal({
				title: 'Confirmation',
				text: 'Any changes will be discarded, please confirm',
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			}).then((willUpdate) => {
				if (willUpdate) {
					setShowModal(false);
					clearData();
				}
			});
		} else {
			setShowModal(false);
			clearData();
		}
	};

	return (
		<MainContainer>
			<div style={{margin: 20}}>
				<Col sm={12}>
					<p className='fw-bolder'>Miscellaneous Category</p>
				</Col>
				<Row>
					<Col sm={12}>
						<div className='ag-theme-quartz' style={{height: 300, width: '100%'}}>
							<AgGridReact
								rowData={rowData}
								defaultColDef={defaultColDef}
								columnDefs={columnDefs}
								onGridReady={onGridReady}
								components={{
									myCustomRenderer: {scoreEditor: ScoringEditor}, // Register custom components here
								}}
							/>
						</div>
					</Col>
				</Row>
				{PaddedDiv}
				<Row>
					<Col sm={12} className='total-score'>
						<span>{FIELD_LABELS.TotalScore}</span>
						<input type='text' value={miscTotalScore} disabled={true} />
					</Col>
				</Row>
			</div>

			<CommentModal
				showModal={showModal}
				isCommentDisable={isCommentDisable}
				modalTitle={modalTitle}
				selectedComment={selectedComment}
				stateChange={setSelectedComment}
				qualityReviewMeasurementId={selectedMiscellaneous.qualityReviewMeasurementId}
				isAutoFail={false}
				handleSaveComment={handleSaveComment}
				_close={_close}
			></CommentModal>
		</MainContainer>
	);
};

export default MiscellaneousSection;
