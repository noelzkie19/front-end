import {faEye, faFlag} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import {useEffect, useMemo, useRef, useState} from 'react';
import {Col, Row} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import swal from 'sweetalert';
import {RootState} from '../../../../../../setup';
import gridOverlayTemplate, {gridOverlayNoRowsTemplate} from '../../../../../common-template/gridTemplates';
import {PaginationModel} from '../../../../../common/model';
import useConstant from '../../../../../constants/useConstant';
import {DefaultGridPagination, MainContainer, TableIconButton} from '../../../../../custom-components';
import {IAuthState} from '../../../../auth';
import '../../../../campaign-management/components/ReviewHistory.css';
import {USER_CLAIMS} from '../../../../user-management/components/constants/UserClaims';
import {CommunicationReviewHistoryResponseModel} from '../../../models/response/communication-review/CommunicationReviewHistoryResponseModel';
import {removeCommReviewPrimaryTagging, updateCommReviewPrimaryTagging} from '../../../services/CustomerCaseApi';
interface Props {
	pageMode: number;
	stateData: Array<CommunicationReviewHistoryResponseModel>;
	reviewStarted: boolean;
	viewReviewHistory: (id: string) => void;
}

const ReviewHistorySection: React.FC<Props> = ({pageMode, stateData, reviewStarted, viewReviewHistory}) => {
	const {SwalCommunicationReviewConfirmMessage} = useConstant();
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	/* States */
	const [commRawReviewHistory, setCommRawReviewHistory] = useState<any>([]);
	const [commReviewHistory, setCommReviewHistory] = useState<any>([]);
	const [pagination, setPagination] = useState<PaginationModel>({
		pageSize: 20,
		currentPage: 1,
		recordCount: 1,
		sortOrder: 'DESC',
		sortColumn: 'ISNULL(st.UpdatedDate, st.CreatedDate)',
	});

	/* Hooks */
	const gridRef: any = useRef();
	const {access} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	/* Mount */

	useEffect(() => {
		const canWrite = access?.includes(USER_CLAIMS.CommunicationReviewerWrite);
		const canRead = access?.includes(USER_CLAIMS.CommunicationReviewerRead);

		if (commRawReviewHistory.length === 1) {
			onViewClick(commRawReviewHistory[0].CommunicationReviewId);
		} else if (commRawReviewHistory.length > 1) {
			if (canWrite || canRead) {
				const primaryReview = commRawReviewHistory.filter((review: any) => review.IsPrimary);
				if (primaryReview.length === 1) {
					// where communicationID has multiple existing communication review records and there is only 1 primary record:
					onViewClick(primaryReview[0].CommunicationReviewId);
				}
			}
		}
	}, [commRawReviewHistory]);

	interface AGColumns {
		columnDefs: any[];
	}

	const actionColumnRenderer = ({data}: any) => {
		return (
			<div className='d-flex align-center'>
				<div>
					<TableIconButton
						access={true}
						isDisable={reviewStarted}
						iconColor=''
						faIcon={faEye}
						toolTipText={'View'}
						onClick={() => {
							onViewClick(data.CommunicationReviewId);
						}}
					/>
				</div>
				<div className='icon-spacing'></div>
				<div>
					{data.IsPrimary ? (
						<TableIconButton
							access={true}
							faIcon={faFlag}
							isDisable={reviewStarted}
							toolTipText={'Primary'}
							onClick={() => {
								handleRemovePrimary(data);
							}} // Do not trigger if already primary
						/>
					) : (
						<TableIconButton
							access={true}
							iconColor='not-primary'
							faIcon={faFlag}
							toolTipText={'Set as Primary'}
							isDisable={reviewStarted}
							onClick={() => {
								handleSetPrimary(data);
							}}
						/>
					)}
				</div>
			</div>
		);
	};

	const reviewStatusRenderer = ({data}: any) => {
		return <div>{data.ReviewStatusName}</div>;
	};

	const gridOptions: AGColumns = {
		columnDefs: [
			{
				headerName: 'No.',
				field: 'recordNumber',
				valueFormatter: (params: any) => pagination.currentPage * pagination.pageSize - pagination.pageSize + params.node.rowIndex + 1,
				width: 75,
				// pinned: 'left'
			},
			{
				// pinned: 'left',
				headerName: 'Action',
				field: 'isPrimary',
				autoWidth: true,
				cellRenderer: actionColumnRenderer,
			},
			{
				headerName: 'Review ID',
				field: 'CommunicationReviewId',
				autoWidth: true,
			},
			{
				headerName: 'Period Name',
				field: 'PeriodName',
			},
			{
				headerName: 'Score',
				field: 'ReviewScore',
				autoWidth: true,
			},
			{
				headerName: 'Reviewee',
				field: 'RevieweeName',
				autoWidth: true,
			},
			{
				headerName: 'Reviewer',
				field: 'ReviewerName',
			},
			{
				headerName: 'Review Status',
				field: 'ReviewStatusName',
				autoWidth: true,
				cellRenderer: reviewStatusRenderer,
			},
			{headerName: 'Review Date', field: 'ReviewDate'},
		],
	};

	/* Effects */
	useEffect(() => {
		const newPagination = {...pagination, recordCount: stateData.length};
		setPagination(newPagination);
		return () => {};
	}, []);

	useEffect(() => {
		paginatedDisplay();

		return () => {};
	}, [commRawReviewHistory]);

	useEffect(() => {
		setCommRawReviewHistory(stateData);
	}, [stateData]);

	useEffect(() => {
		paginatedDisplay();
		return () => {};
	}, [pagination]);

	/* Functions */

	const onViewClick = (id: any) => {
		viewReviewHistory(id);
	};

	const handleSetPrimary = (data: any) => {
		swal({
			title: SwalCommunicationReviewConfirmMessage.title,
			text: SwalCommunicationReviewConfirmMessage.textSetPrimaryConfirm,
			icon: SwalCommunicationReviewConfirmMessage.icon,
			buttons: [SwalCommunicationReviewConfirmMessage.btnNo, SwalCommunicationReviewConfirmMessage.btnYes],
			dangerMode: true,
		}).then((response) => {
			if (response) {
				onSetPrimaryClick(data);
			}
		});
	};

	const handleRemovePrimary = (data: any) => {
		if (userAccess.includes(USER_CLAIMS.ManagePrimaryFlagRead) === true && userAccess.includes(USER_CLAIMS.ManagePrimaryFlagWrite) === true) {
			swal({
				title: SwalCommunicationReviewConfirmMessage.title,
				text: SwalCommunicationReviewConfirmMessage.textRemovePrimaryConfirm,
				icon: SwalCommunicationReviewConfirmMessage.icon,
				buttons: [SwalCommunicationReviewConfirmMessage.btnNo, SwalCommunicationReviewConfirmMessage.btnYes],
				dangerMode: true,
			}).then((response) => {
				if (response) {
					onRemovePrimaryClick(data);
				}
			});
		}
	};
	const onSetPrimaryClick = (data: any) => {
		//Do not set Primary if no write
		const updatedHistory = commRawReviewHistory.map((record: any) => {
			const {CommunicationReviewId, CaseCommunicationId, RevieweeId, ReviewerId, QualityReviewPeriodId} = data;
			if (
				record.CaseCommunicationId === CaseCommunicationId &&
				record.RevieweeId === RevieweeId &&
				record.ReviewerId === ReviewerId &&
				record.QualityReviewPeriodId === QualityReviewPeriodId
			) {
				if (record.CommunicationReviewId !== CommunicationReviewId) {
					return {...record, IsPrimary: false};
				}
			}
			if (record.CommunicationReviewId === CommunicationReviewId) {
				return {...record, IsPrimary: true};
			}
			return record;
		});
		setCommRawReviewHistory(updatedHistory);

		const {CommunicationReviewId, CaseCommunicationId, RevieweeId, ReviewerId, QualityReviewPeriodId} = data;
		updateCommReviewPrimaryTagging({
			communicationReviewId: CommunicationReviewId,
			communicationId: CaseCommunicationId,
			revieweeId: RevieweeId,
			reviewerId: ReviewerId,
			reviewPeriodId: QualityReviewPeriodId,
		});
	};
	const onRemovePrimaryClick = (data: any) => {
		//Do not set Primary if no write

		const updatedHistory = commRawReviewHistory.map((record: any) => {
			if (record.CommunicationReviewId === data.CommunicationReviewId) {
				return {...record, IsPrimary: false};
			}
			return record;
		});
		setCommRawReviewHistory(updatedHistory);

		const {CommunicationReviewId, CaseCommunicationId, RevieweeId, ReviewerId, QualityReviewPeriodId} = data;
		removeCommReviewPrimaryTagging({
			communicationReviewId: CommunicationReviewId,
			communicationId: CaseCommunicationId,
			revieweeId: RevieweeId,
			reviewerId: ReviewerId,
			reviewPeriodId: QualityReviewPeriodId,
		});
	};

	const paginatedDisplay = () => {
		const sortedData = commRawReviewHistory.sort((a: any, b: any) => {
			let dateA: any = new Date(a.ReviewDate);
			let dateB: any = new Date(b.ReviewDate);
			return dateB - dateA;
		});
		const filteredData = sortedData.reduce((acc: any, curr: any, idx: number) => {
			let maxIndex = pagination.currentPage * pagination.pageSize - 1;
			let minIndex = maxIndex - pagination.pageSize + 1;
			if (idx >= minIndex && idx <= maxIndex) {
				acc.push(curr);
			}
			return acc;
		}, []);

		setCommReviewHistory(filteredData);
	};

	const onPageSizeChanged = (newPageSize: string) => {
		const newPagination = {...pagination, pageSize: Number(newPageSize), currentPage: 1};
		setPagination(newPagination);
	};

	const onClickFirst = () => {
		if (pagination.currentPage > 1) {
			const newPagination = {...pagination, currentPage: 1};
			setPagination(newPagination);
		}
	};

	const onClickPrevious = () => {
		if (pagination.currentPage > 1) {
			const newPagination = {...pagination, currentPage: pagination.currentPage - 1};
			setPagination(newPagination);
		}
	};

	const onClickNext = () => {
		if (totalPage() > pagination.currentPage) {
			const newPagination = {...pagination, currentPage: pagination.currentPage + 1};
			setPagination(newPagination);
		}
	};

	const onClickLast = () => {
		if (totalPage() > pagination.currentPage) {
			const newPagination = {...pagination, currentPage: totalPage()};
			setPagination(newPagination);
		}
	};

	const totalPage = () => {
		return Math.ceil(stateData.length / pagination.pageSize) | 0;
	};

	const rowSelection = useMemo(() => {
		return {
			mode: 'singleRow',
			checkboxes: false,
			headerCheckbox: false,
			enableClickSelection: true,
		};
	}, []);

	return (
		<MainContainer>
			<div style={{margin: 20}}>
				<Col sm={12}>
					<p className='fw-bolder'>Communication Review History</p>
				</Col>
				<Row>
					<Col sm={12}>
						<div className='ag-theme-quartz' style={{height: 500, width: '100%', marginBottom: '50px'}}>
							<AgGridReact
								rowStyle={{userSelect: 'text'}}
								rowData={commReviewHistory}
								columnDefs={gridOptions.columnDefs}
								rowSelection={'multiple'}
								alwaysShowHorizontalScroll={false}
								animateRows={true}
								rowBuffer={0}
								pagination={false}
								paginationPageSize={5}
								overlayNoRowsTemplate={gridOverlayNoRowsTemplate}
								overlayLoadingTemplate={gridOverlayTemplate}
								ref={gridRef}
							/>
							<DefaultGridPagination
								recordCount={stateData.length}
								currentPage={pagination.currentPage}
								pageSize={pagination.pageSize}
								onClickFirst={onClickFirst}
								onClickPrevious={onClickPrevious}
								onClickNext={onClickNext}
								onClickLast={onClickLast}
								onPageSizeChanged={(newPageSize) => {
									onPageSizeChanged(newPageSize);
								}}
								pageSizes={[20, 30, 50, 100]}
							/>
						</div>
					</Col>
				</Row>
			</div>
		</MainContainer>
	);
};

export default ReviewHistorySection;
