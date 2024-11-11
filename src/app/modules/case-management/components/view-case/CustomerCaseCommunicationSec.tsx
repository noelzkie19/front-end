import {faBan, faPencilAlt, faSave, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Guid} from 'guid-typescript';
import {htmlDecode} from 'js-htmlencode';
import React, {useEffect, useRef, useState} from 'react';
import {ButtonGroup, Tab, Tabs, Toast} from 'react-bootstrap';
import ReactHtmlParser from 'react-html-parser';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import swal from 'sweetalert';
import {CustomerCaseCommunicationFeedback, CustomerCaseCommunicationSurvey} from '..';
import {RootState} from '../../../../../setup';
import {HttpStatusCodeEnum} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {
	FormGroupContainer,
	FormGroupContainerBordered,
	GridWithLoaderAndPagination,
	MLabQuillEditor,
	TableIconButton,
} from '../../../../custom-components';
import useFnsDateFormatter from '../../../../custom-functions/helper/useFnsDateFormatter';
import {IAuthState} from '../../../auth';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {COMMUNICATION_REVIEW_DEFAULT} from '../../constants/CommunicationReviewDefault';
import '../../css/AnnotationStyle.css';
import '../../css/CommunicationReview.css';
import {CommunicationReviewModel} from '../../models/CommunicationReviewModel';
import {CustomerCaseCommListRequestModel} from '../../models/CustomerCaseCommListRequestModel';
import {CustomerCaseCommModel} from '../../models/CustomerCaseCommModel';
import {CustomerCaseCommunicationFeedbackModel} from '../../models/CustomerCaseCommunicationFeedbackModel';
import {CustomerCaseCommunicationInfo} from '../../models/CustomerCaseCommunicationInfo';
import {CustomerCaseCommunicationPCSModel} from '../../models/CustomerCaseCommunicationPCSModel';
import {CustomerCaseCommunicationSurveyModel} from '../../models/CustomerCaseCommunicationSurveyModel';
import {CaseCommunicationAnnotationRequestModel} from '../../models/request/CaseCommunicationAnnotationRequestModel';
import {CaseCommunicationAnnotationModel} from '../../models/response/CaseCommunicationAnnotationModel';
import {
	GetCaseCommunicationInfoAsync,
	GetCustomerCaseCommListAsync,
	getCaseCommAnnotationByCaseCommId,
	upsertCaseCommunicationAnnotation,
} from '../../services/CustomerCaseApi';
import DrawerComponent from '../../shared/components/DrawerComponent';
import CustomerCaseCommunicationPCS from './CustomerCaseCommunicationPCS';
import CustomerCaseChatStatistic from './CustomerCaseChatStatistic';
interface Props {
	customerCaseId?: any;
	communicationId?: any;
	validateCaseInfoData: Function;
	communicationReviewRef: any;
	stateChange: any;
}

export const CustomerCaseCommunicationSec: React.FC<Props> = ({
	customerCaseId,
	communicationId,
	validateCaseInfoData,
	communicationReviewRef,
	stateChange,
}) => {
	const {access, userId, fullName} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const [customerCaseCommList, setCustomerCaseCommList] = useState<Array<CustomerCaseCommModel>>([]);
	const [customerCaseCommunicationInfo, setCustomerCaseCommunicationInfo] = useState<CustomerCaseCommunicationInfo>();
	const [customerCaseCommunicationPCS, setCustomerCaseCommunicationPCS] = useState<Array<CustomerCaseCommunicationPCSModel>>([]);
	const [customerCaseCommunicationFeedback, setCustomerCaseCommunicationFeedback] = useState<Array<CustomerCaseCommunicationFeedbackModel>>([]);
	const [customerCaseCommunicationSurvey, setCustomerCaseCommunicationSurvey] = useState<Array<CustomerCaseCommunicationSurveyModel>>([]);
	const [decodedContent, setDecodedContent] = useState<string>('-');
	const [communicationReview, setCommunicationReview] = useState<CommunicationReviewModel>(COMMUNICATION_REVIEW_DEFAULT);
	const [isWithCurrentReview, setIsWithCurrentReview] = useState<boolean>(false);
	const [showCommReview, setShowCommReview] = useState<boolean>(false);

	const gridRef: any = useRef();
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<string>('ASC');
	const [sortColumn, setSortColumn] = useState<string>('CaseCommunicationId');
	const {
		successResponse,
		SwalAnnotationSuccessMessage,
		SwalAnnotationRemoveMessage,
		SwalGatewayErrorMessage,
		properFormatDateHourMinSec,
		SwalConfirmMessage,
		SearchCaseAndCommunication,

	} = useConstant();
	const history = useHistory();
	const {mlabFormatDate} = useFnsDateFormatter();

	// Annotation Solution 2
	const [initialContentRaw, setInitialContentRaw] = useState<string>('');
	const annotateSectionRef = useRef<HTMLDivElement>(null);
	const [selectedRanges, setSelectedRanges] = useState<CaseCommunicationAnnotationModel[]>([]);
	const [contentAnnotated, setContentAnnotated] = useState<Array<CaseCommunicationAnnotationModel>>([]);
	const [annotationComment, setAnnotationComment] = useState<string>('');
	const [selectedActiveSpan, setSelectedActiveSpan] = useState<any>();
	const [showMofidyButtons, setShowMofidyButtons] = useState<boolean>(false);
	const [selectedCommunicationId, setSelectedCommunicationId] = useState<number>(0);
	const [isChatStatisticTabSelected, setIsChatStatisticTabSelected] = useState<boolean>(false);
	const ACTION_DELETE = 'DELETE';
	const ACTION_ADD = 'ADD';
	const ACTION_EDIT = 'EDIT';

	const [toastPosition, setToastPosition] = useState({
		top: 0,
		left: 0,
		tag: '',
	});
	const [activePopOverShow, setActivePopOverShow] = useState(false);

	// Mounted
	useEffect(() => {
		getCustomerCaseCommList(customerCaseId, pageSize, 1, sortColumn, sortOrder);
	}, [customerCaseId]);

	useEffect(() => {
		if (communicationId !== '') {
			viewCommunication(communicationId);
		}
	}, [communicationId]);

	useEffect(() => {
		stateChange(isWithCurrentReview);
	}, [isWithCurrentReview]);

	useEffect(() => {
		// solution 2
		if (customerCaseCommunicationInfo?.caseCommunicationId) {
			getCaseCommAnnotationDetails(customerCaseCommunicationInfo?.caseCommunicationId);
			
		}
	}, [customerCaseCommunicationInfo?.caseCommunicationId]);

	useEffect(() => {
		if (selectedActiveSpan) {
			setShowMofidyButtons(true);
		}
	}, [selectedActiveSpan]);

	const confirmExit = () => {
		return true;
	};
	window.onbeforeunload = confirmExit;

	useEffect(() => {
		const handlePrompt = (location: any) => {
			const shouldBlockNavigation = selectedActiveSpan || selectedRanges?.length || annotationComment;

			if (shouldBlockNavigation) {
				alertNavigateAway(location.pathname);
				return false;
			}
			return true;
		};

		const unblock = history.block(handlePrompt);

		return () => {
			unblock();
			window.onbeforeunload = null;
		};
	}, [history, annotationComment]);

	


	const alertNavigateAway = (promptNamePath: any) => {
		swal({
			title: 'Confirmation',
			text: 'This action will discard the in-progress annotation. Please confirm.',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((confirmSave) => {
			if (confirmSave) {
				history.block(() => {});
				history.push(promptNamePath);
			}
		});
	};

	async function getCustomerCaseCommList(_customerCaseId: number, _pageSize: number, _currentPage: number, _sortColumn: string, _sortOrder: string) {
		const request: CustomerCaseCommListRequestModel = {
			caseInformationId: _customerCaseId,
			pageSize: _pageSize,
			offsetValue: (_currentPage - 1) * _pageSize,
			sortColumn: _sortColumn,
			sortOrder: _sortOrder,
		};

		GetCustomerCaseCommListAsync(request)
			.then((response) => {
				if (response.status === successResponse) {
					let customerCaseList: Array<CustomerCaseCommModel> = response.data.caseCommunicationList;
					if (customerCaseList != null) {
						setCustomerCaseCommList(customerCaseList);
						setRecordCount(response.data.recordCount);
						if (communicationId === '') {
							let latestComm = getLatestRecord(customerCaseList);
							if (latestComm !== undefined) {
								viewCommunication(latestComm.caseCommunicationId);
								setSelectedCommunicationId(latestComm.caseCommunicationId)
							}
						}
						return;
					}
				}
			})
			.catch((ex) => {
				console.log('[ERROR] Customer Case: ' + ex);
			});
	}

	const getLatestRecord = (records: CustomerCaseCommModel[]): CustomerCaseCommModel | undefined => {
		if (records.length === 0) {
			return undefined; // Return undefined if the array is empty
		}

		const sortedRecords = [...records]; // Create a copy to avoid mutating the original array
		sortedRecords.sort((a, b) => b.caseCommunicationId - a.caseCommunicationId); // Sort by createdDate in descending order

		return sortedRecords.find((record) => true);
	};

	const onPageSizeChanged = () => {
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (customerCaseCommList != undefined && customerCaseCommList.length > 0) {
			getCustomerCaseCommList(customerCaseId, Number(value), 1, sortColumn, sortOrder);
		}
	};

	const onClickFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			getCustomerCaseCommList(customerCaseId, pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickPrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			getCustomerCaseCommList(customerCaseId, pageSize, currentPage - 1, sortColumn, sortOrder);
		}
	};

	const onClickNext = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			getCustomerCaseCommList(customerCaseId, pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onClickLast = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			getCustomerCaseCommList(customerCaseId, pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	const onSort = (e: any) => {
		setCurrentPage(1);

		if (customerCaseCommList != undefined && customerCaseCommList.length > 0) {
			let sortDetail: any = e.api.getSortModel();
			if (sortDetail[0] != undefined) {
				setSortColumn(sortDetail[0]?.colId);
				setSortOrder(sortDetail[0]?.sort);
				getCustomerCaseCommList(customerCaseId, pageSize, 1, sortDetail[0]?.colId, sortDetail[0]?.sort);
			} else {
				setSortColumn('');
				setSortOrder('');
				getCustomerCaseCommList(customerCaseId, pageSize, 1, '', '');
			}
		}
	};

	const editCommunication = (_commId: number) => {
		history.push(`/case-management/edit-communication/${_commId}`);
	};

	const viewCommunication = (communicationId: any) => {
		GetCaseCommunicationInfoAsync(communicationId, userAccessId)
			.then((response) => {
				if (response.status === successResponse) {
					let customerCaseCommInfo = response.data.customerCaseCommunicationInfo;
					let customerCaseCommPCS = response.data.pcsData;
					let customerCaseCommFeedback = response.data.customerCaseCommunicationFeedback;
					let customerCaseCommSurvey = response.data.customerCaseCommunicationSurvey;
					let communicationContent = customerCaseCommInfo.communicationContent === null ? '-' : customerCaseCommInfo.communicationContent;
					setCustomerCaseCommunicationInfo(customerCaseCommInfo);
					setDecodedContent(htmlDecode(communicationContent));
					setCustomerCaseCommunicationPCS(customerCaseCommPCS);
					setCustomerCaseCommunicationFeedback(customerCaseCommFeedback);
					setCustomerCaseCommunicationSurvey(customerCaseCommSurvey);
					validateCaseInfoData(customerCaseCommInfo);
					setSelectedCommunicationId(customerCaseCommInfo?.caseCommunicationId)

					// annotation
					setInitialContentRaw(htmlDecode(communicationContent));
					if (
						!customerCaseCommInfo.startCommunicationDate ||
						customerCaseCommInfo.communicationId === 0 ||
						customerCaseCommInfo.caseId === 0 ||
						customerCaseCommInfo.communicationOwner === 0
					) {
						setShowCommReview(false);
					} else {
						setShowCommReview(true);
					}

					//for communication review
					if (
						isWithCurrentReview &&
						communicationReviewRef.current.communicationId > 0 &&
						communicationReviewRef.current.communicationId !== communicationId
					) {
						alertChangeCommunicationId(customerCaseCommInfo);
					} else {
						initialCommunicationReview(customerCaseCommInfo);
					}
				}
			})
			.catch((ex) => {
				console.log(ex);
				console.log('[ERROR] Customer Case: ' + ex);
			});
	};

	const commIdLabelElem = (params: any) => (
		<label
			className='btn-link cursor-pointer'
			onClick={() => viewCommunication(params.data.caseCommunicationId)}
			onKeyDown={() => viewCommunication(params.data.caseCommunicationId)}
		>
			{params.data.caseCommunicationId}
		</label>
	);

	const initialCommunicationReview = (customerCaseCommInfo: any) => {
		const info = communicationReview;
		info.revieweeId = parseInt(customerCaseCommInfo.communicationOwner);
		info.reviewerId = parseInt(userId?.toString() ?? '0');
		info.reviewer = fullName ?? '';
		info.caseId = customerCaseId;
		info.startCommunicationDate = customerCaseCommInfo.startCommunicationDate;
		info.communicationId = customerCaseCommInfo.caseCommunicationId;
		communicationReviewRef.current.communicationId = 0;
		setCommunicationReview(info);
	};

	const actionButtonElem = (params: any) => {
		return (
			<ButtonGroup aria-label='Basic example'>
				<div className='d-flex justify-content-center flex-shrink-0'>
					<div className='me-4'>
						<TableIconButton
							access={access?.includes(USER_CLAIMS.CaseManagementLeaderAccessWrite)}
							faIcon={faPencilAlt}
							toolTipText={'Edit'}
							onClick={() => editCommunication(params.data.caseCommunicationId)}
							isDisable={true}
						/>
					</div>
				</div>
			</ButtonGroup>
		);
	};

	const alertChangeCommunicationId = (customerCaseCommInfo: any) => {
		swal({
			title: 'Confirmation',
			text: 'This action will discard the in-progress communication review. Please confirm.',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((response) => {
			if (response) {
				initialCommunicationReview(customerCaseCommInfo);
				stateChange(false);
			}
		});
	};

	const columnDefs = [
		{
			headerName: 'Communication ID',
			field: 'caseCommunicationId',
			cellRenderer: commIdLabelElem,
		},
		{headerName: 'Purpose', field: 'purpose'},
		{headerName: 'External ID', field: 'externalCommunicationId'},
		{headerName: 'Message Type', field: 'messageType'},
		{headerName: 'Message Status', field: 'messageStatus'},
		{headerName: 'Communication Owner', field: 'communicationOwner'},
		{headerName: 'Created Date', field: 'createdDate'},
		{headerName: 'Reported Date', field: 'reportedDate'},
		{
			headerName: 'Action',
			width: 100,
			cellRenderer: (params: any) => actionButtonElem(params),
		},
	];
	const canAccessCommunicationReview = () => {
		const canAccess =
			(access?.includes(USER_CLAIMS.CommunicationReviewerWrite) ?? false) ||
			(access?.includes(USER_CLAIMS.CommunicationReviewerRead) ?? false) ||
			(access?.includes(USER_CLAIMS.CommunicationRevieweeWrite) ?? false) ||
			(access?.includes(USER_CLAIMS.CommunicationRevieweeRead) ?? false);
		return canAccess;
	};

	// Solution 2: manual annotation
	// mounted

	const getCaseCommAnnotationDetails = (caseCommunicationId: number) => {
		getCaseCommAnnotationByCaseCommId(caseCommunicationId)
			.then((response) => {
				if (response.status === HttpStatusCodeEnum.Ok) {
					setContentAnnotated(response.data);
					loadAndHighlightTexts(response.data);
				} else {
					swal('Failed', 'Problem getting case communication annotation details', 'error');
				}
			})
			.catch((err) => {
				console.log('Problem in case communication annotation details' + err);
			});
	};

	const handleSelection = () => {
		if (access?.includes(USER_CLAIMS.CommunicationAnnotateWrite) && !showMofidyButtons) {
			const selection = window.getSelection();

			if (selection && selection.rangeCount > 0) {
				const range = selection.getRangeAt(0);
				applyRangeOnHandleSelection(range, selection);
			}
		}
	};

	const applyRangeOnHandleSelection = (range: any, selection: any) => {
		if (annotateSectionRef?.current?.contains(range.startContainer) && annotateSectionRef?.current?.contains(range.endContainer)) {
			const selectedText = range.toString();
			const startIndex = getSelectionIndex(range.startContainer, range.startOffset);
			const endIndex = startIndex + selectedText.length - 1;

			if (selectedText.trim() !== '') {
				const successHighlight = highlightSelectedText(range, startIndex, endIndex);
				//Need to comment this due to highlight issue //selection.removeAllRanges(); // Clear the selection after highlighting

				// for single selection/highlighted words
				if (successHighlight === 1) {
					setSelectedRanges((prevRanges) => [
						...prevRanges,
						{
							caseCommunicationAnnotationId: 0,
							caseCommunicationId: customerCaseCommunicationInfo?.caseCommunicationId ?? 0,
							start: startIndex,
							end: endIndex,
							text: selectedText,
							tag: '',
							positionGroup: startIndex + '-' + endIndex,
						},
					]);
				}
			} else {
				// this is for returning selected span
				// handles the onclick of span or highlighted words
				loadSelectedSpan(selectedText, startIndex, endIndex, contentAnnotated);
			}
		}
	};

	const getSelectionIndex = (node: any, offset: any) => {
		let index = 0;

		if (!annotateSectionRef.current) {
			return -1;
		}

		const walker = document.createTreeWalker(annotateSectionRef.current, NodeFilter.SHOW_TEXT, null);

		while (walker.nextNode()) {
			const currentNode = walker.currentNode;

			if (currentNode === node) {
				index += offset;
				break;
			} else {
				const nodeValue = currentNode.nodeValue;
				index += nodeValue ? nodeValue.length : 0;
			}
		}

		return index;
	};

	const highlightSelectedText = (range: any, startIndex: any, endIndex: any) => {
		try {
			const commonAncestor = range.commonAncestorContainer;

			if (commonAncestor.nodeType === Node.TEXT_NODE) {
				const lines = commonAncestor.nodeValue.split('\n');
				for (const line of lines) {
					const lineLength = line.length;

					if (lineLength > 0) {
						const spanElement = document.createElement('span');
						spanElement.style.backgroundColor = '#fbfb37';
						spanElement.className = 'highlighted-text';

						spanElement.id = `${startIndex}-${endIndex}`;
						spanElement.setAttribute('data-custom-line-id', `${startIndex}-${endIndex}`);
						spanElement.setAttribute('position', 'top');

						const textNode = document.createTextNode(line);
						spanElement.appendChild(textNode);

						range.surroundContents(spanElement);
					}
				}

				return 1;
				// if selection is more than 1 line/node
			} else if (annotateSectionRef.current) {
				const selectedNodes = getSelectedNodes(range, annotateSectionRef.current);
				return checkHighlightedText(selectedNodes, startIndex, endIndex);
			}
		} catch (error) {
			console.log('An error occurred in highlightSelectedText:', error);
			return false;
		}
	};

	const checkHighlightedText = (selectedNodes: any, startIndex: number, endIndex: number) => {
		const hasHighlightedText = selectedNodes.some((selnode: any) => {
			if (selnode.node.nodeType === 1 && selnode.node.nodeName === 'SPAN') {
				const spanElement = selnode.node as Element;

				if (spanElement.className === 'highlighted-text') {
					return true;
				}
			}

			return false;
		});

		if (!hasHighlightedText) {
			// Iterate over the selected nodes and surround each with a span
			multipleNodeSelection(selectedNodes, startIndex, endIndex);
			return 2;
		} else return 0;
	};

	const multipleNodeSelection = (selectedNodes: any, startIndex: any, endIndex: any) => {
		selectedNodes.forEach((node: any) => {
			const spanElement = document.createElement('span');
			spanElement.style.backgroundColor = '#fbfb37';
			spanElement.className = 'highlighted-text';

			if (node.node.nodeType === Node.TEXT_NODE) {
				const textContent = node.node.nodeValue ?? '';

				const nodePositionStart = getSelectionIndex(node.node, node.startIndex) + 1;

				let substringMatched = '';
				if (node.startIndex === 0) {
					substringMatched = textContent.substring(node.startIndex, endIndex + 1 - (nodePositionStart - 1));
				} else {
					substringMatched = textContent.substring(node.startIndex);
				}

				// Find the index of the matched substring within the textContent
				const nodeIndex = textContent.indexOf(substringMatched);

				if (nodeIndex !== -1) {
					multipleNodesRangeCreator(nodeIndex, textContent, nodePositionStart, startIndex, endIndex, substringMatched, node);
				}
			}
		});
	};

	const multipleNodesRangeCreator = (
		nodeIndex: any,
		textContent: string,
		nodePositionStart: any,
		startIndex: any,
		endIndex: any,
		substringMatched: any,
		node: any
	) => {
		// Create a text node for the remaining text
		const remainingTextBefore = document.createTextNode(nodeIndex !== 0 ? textContent.substring(0, nodeIndex) : '');
		const remainingTextAfter = document.createTextNode(nodeIndex === 0 ? textContent.substring(nodeIndex + substringMatched.length) : '');

		// Create a span element for the matched text
		const spanElement = document.createElement('span');
		spanElement.style.backgroundColor = '#fbfb37';
		spanElement.className = 'highlighted-text';

		spanElement.id = `${nodePositionStart - 1}-${nodePositionStart - 1 + (substringMatched.length - 1)}`;
		spanElement.setAttribute('data-custom-line-id', `${startIndex}-${endIndex}`);

		spanElement.appendChild(document.createTextNode(substringMatched));

		// Insert the nodes in the correct order and remove the original text node
		if (nodeIndex === 0) {
			node.node.parentNode?.insertBefore(spanElement, node.node);
			node.node.parentNode?.insertBefore(remainingTextAfter, spanElement.nextSibling);
		} else {
			node.node.parentNode?.insertBefore(remainingTextBefore, node.node.nextSibling);
			node.node.parentNode?.insertBefore(spanElement, remainingTextBefore.nextSibling);
		}
		node.node.parentNode?.insertBefore(remainingTextAfter, spanElement.nextSibling);
		node.node.parentNode?.removeChild(node.node);

		if (substringMatched.trim() !== '') {
			setSelectedRanges((prevRanges) => [
				...prevRanges,
				{
					caseCommunicationAnnotationId: 0,
					caseCommunicationId: customerCaseCommunicationInfo?.caseCommunicationId ?? 0,
					start: nodePositionStart - 1,
					end: nodePositionStart - 1 + (substringMatched.length - 1),
					text: substringMatched,
					tag: '',
					positionGroup: startIndex + '-' + endIndex,
				},
			]);
		}
	};

	const getSelectedNodes = (range: any, container: HTMLElement) => {
		const selectedNodes = [];
		const walker = document.createTreeWalker(
			range.commonAncestorContainer,

			NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
			null
		);

		let currentNode: Node | null = walker.currentNode;

		while (currentNode !== null) {
			// Check if the current node is within the selection range and not the container itself
			if (range.intersectsNode(currentNode) && currentNode !== container) {
				let startIndex = 0;
				let endIndex = 0;

				if (currentNode.nodeType === Node.TEXT_NODE) {
					const nodeRange = document.createRange();
					nodeRange.selectNode(currentNode);

					// Get the start index of the selection within the text node
					nodeRange.setEnd(range.startContainer, range.startOffset);
					startIndex = nodeRange.toString().length;

					// Get the end index of the selection within the text node
					nodeRange.setEnd(range.endContainer, range.endOffset);
					endIndex = nodeRange.toString().length;

					nodeRange.detach();
				}

				selectedNodes.push({
					node: currentNode,
					startIndex,
					endIndex,
				});
			}

			currentNode = walker.nextNode();
		}

		return selectedNodes;
	};

	const onSaveAnnotationComment = () => {
		swal({
			title: 'Confirmation',
			text: SwalAnnotationSuccessMessage.textAddConfirm,
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((response) => {
			if (response) {
				setContentAnnotated((prevContent) => [
					...prevContent,
					...selectedRanges.map((range) => ({
						...range,
						tag: annotationComment,
						isValid: true,
					})),
				]);

				const newAnnotations = [
					...contentAnnotated,
					...selectedRanges.map((range) => ({
						...range,
						tag: annotationComment,
						isValid: true,
					})),
				];

				// save to db
				const annotationRequest: CaseCommunicationAnnotationRequestModel = {
					queueId: Guid.create().toString(),
					CaseCommunicationAnnotationUdt: newAnnotations,
					userId: userId?.toString() ?? '0',
					CaseCommunicationId: customerCaseCommunicationInfo?.caseCommunicationId ?? 0,
				};
				upSertRemoveAnnotation(annotationRequest, ACTION_ADD);

				// Clear the selectedRanges state after adding to contentAnnotated
				setSelectedRanges((prevRanges) =>
					prevRanges.map((range) => ({
						...range,
						tag: annotationComment,
					}))
				);

				// to make sure object to be added with comment and highlight in the UI is correct
				const updatedSelectedRanges = selectedRanges.map((range) => ({
					...range,
					tag: annotationComment,
				}));

				setAnnotationComment('');
				addCommentToSpans(updatedSelectedRanges);
			}
		});
	};

	const onUpdateAnnotationComment = () => {
		swal({
			title: 'Confirmation',
			text: SwalAnnotationSuccessMessage.textUpdateConfirm,
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((response) => {
			if (response) {
				// Convert selectedActiveSpan to an array
				const selectedSpanGroup = contentAnnotated
					.filter((item1) => item1.positionGroup === selectedActiveSpan?.positionGroup || item1.tag === '')
					.map((span) => ({...span, tag: annotationComment, isValid: true}));

				// Remove and readd to make sure object is changed and will trigger useEffect

				const removedMatchedState = contentAnnotated.filter((item1) => {
					return !selectedSpanGroup.some((item2) => {
						return item1.positionGroup === item2.positionGroup;
					});
				});

				setContentAnnotated([...removedMatchedState, ...selectedSpanGroup]);

				// call event to overwrite message
				overwriteSpanCommentTitle([...removedMatchedState, ...selectedSpanGroup], [...selectedSpanGroup]);
			}
		});
	};

	const overwriteTitleToSpan = (start: number, end: number, tag: string, positionGroup: string) => {
		const container = annotateSectionRef.current;
		if (container?.textContent) {
			const spans = container.querySelectorAll(`span.highlighted-text[data-custom-line-id="${positionGroup}"]`);

			spans?.forEach((span) => {
				// to update the current title
				if (span.hasAttribute('data-custom-tooltip')) {
					span.setAttribute('data-custom-tooltip', tag);

					span.addEventListener('click', () => handleClickOnSpan({start: start, end: end, text: span.textContent || '', tag}));
					span.addEventListener('mouseover', (e) => handleMouseOverOnSpan({start: start, end: end, text: span.textContent || '', tag}, e));
					span.addEventListener('mouseout', () =>
						setActivePopOverShow(() => {
							return activePopOverShow ?? false;
						})
					);
				}
			});
		}
	};

	const overwriteSpanCommentTitle = (
		updatedSelectedRanges: Array<CaseCommunicationAnnotationModel>,
		toUpdateTag: Array<CaseCommunicationAnnotationModel>
	) => {
		toUpdateTag.forEach((range) => {
			overwriteTitleToSpan(range.start, range.end, range.tag, range.positionGroup);
		});

		// save to db the updated list
		const annotationRequest: CaseCommunicationAnnotationRequestModel = {
			queueId: Guid.create().toString(),
			CaseCommunicationAnnotationUdt: updatedSelectedRanges,
			userId: userId?.toString() ?? '0',
			CaseCommunicationId: customerCaseCommunicationInfo?.caseCommunicationId ?? 0,
		};
		upSertRemoveAnnotation(annotationRequest, ACTION_EDIT);

		// once all are done, clear selectedRange
		clearSelectionAnnotation();
	};

	const clearSelectionAnnotation = () => {
		setSelectedRanges([]);
		setSelectedActiveSpan(undefined);
		setAnnotationComment('');
		setShowMofidyButtons(false);
	};

	const onDeleteAnnotationComment = () => {
		swal({
			title: 'Confirmation',
			text: SwalAnnotationRemoveMessage.textRemoveConfirm,
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((response) => {
			if (response) {
				// Convert selectedActiveSpan to an array
				const selectedActiveSpanArray = [{...selectedActiveSpan, tag: annotationComment}];

				const removedMatchedState = contentAnnotated.filter((item1) => {
					return !selectedActiveSpanArray.some((item2) => {
						return item1.positionGroup === item2.positionGroup;
					});
				});

				// set with updated removed item
				setContentAnnotated([...removedMatchedState]);

				// to save in DB
				const annotationRequestRemoved: CaseCommunicationAnnotationRequestModel = {
					queueId: Guid.create().toString(),
					CaseCommunicationAnnotationUdt: removedMatchedState,
					userId: userId?.toString() ?? '0',
					CaseCommunicationId: customerCaseCommunicationInfo?.caseCommunicationId ?? 0,
				};
				upSertRemoveAnnotation(annotationRequestRemoved, ACTION_DELETE);

				// remove span highlights on this item
				removeSpan(selectedActiveSpan?.positionGroup);
			}
		});
	};

	const removeSpan = (positionGroup: string) => {
		const container = annotateSectionRef.current;

		if (container?.textContent) {
			const spans = container.querySelectorAll(`span.highlighted-text[data-custom-line-id="${positionGroup}"]`);

			spans?.forEach((span) => {
				// Unwrap the span, preserving its child nodes
				while (span.firstChild) {
					const child = span.firstChild;
					span.parentNode?.insertBefore(child, span);
				}
				span.remove();
			});

			clearSelectionAnnotation();
		}
	};

	const onCancelAnnotationComment = () => {
		if (selectedRanges.length > 0 || selectedActiveSpan || annotationComment) {
			swal({
				title: SwalConfirmMessage.title,
				text: SwalConfirmMessage.textDiscard,
				icon: SwalConfirmMessage.icon,
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			}).then((willCancel) => {
				if (willCancel) {
					removeHighlights();
				}
			});
		}
	};

	const removeHighlights = () => {
		// remove highlights on selected text/s without any comments yet
		const container = annotateSectionRef.current;

		if (container?.textContent) {
			const spans = container.querySelectorAll('span.highlighted-text');

			spans?.forEach((span) => {
				// for custom tooltip
				if (!span.hasAttribute('data-custom-tooltip')) {
					while (span.firstChild) {
						const child = span.firstChild;
						span.parentNode?.insertBefore(child, span);
					}
					span.remove();
				}
			});

			clearSelectionAnnotation();
		}
	};

	const upSertRemoveAnnotation = async (_request: CaseCommunicationAnnotationRequestModel, _action: string) => {
		_request.CaseCommunicationAnnotationUdt = _request.CaseCommunicationAnnotationUdt.filter((annotation) => annotation.isValid !== false) // remove inactive annotation comments
			.map((annotation) => ({
				...annotation,
				caseCommunicationId: customerCaseCommunicationInfo?.caseCommunicationId ?? 0,
			}));

		upsertCaseCommunicationAnnotation(_request)
			.then((response) => {
				if (response.status === successResponse) {
					const title = _action === ACTION_DELETE ? SwalAnnotationRemoveMessage.title : SwalAnnotationSuccessMessage.title;

					const icon = _action === ACTION_DELETE ? SwalAnnotationRemoveMessage.icon : SwalAnnotationSuccessMessage.icon;
					swal(title, 'Annotation successfully saved.', icon);
				}
			})
			.catch(() => {
				swal(SwalGatewayErrorMessage.title, SwalGatewayErrorMessage.textError, SwalGatewayErrorMessage.icon);
			});
	};

	const handleClickOnSpan = (range: {start: number; end: number; text: string; tag: string}) => {
		console.log('handle click on span ', range.start, range.end, range.text, range.tag);
	};

	const loadSelectedSpan = (selectedTag: string, startIndex: number, endIndex: number, content: any) => {
		const selectedItem = contentAnnotated.find((item) => item.start <= startIndex && item.end >= endIndex);

		if (selectedItem) {
			setAnnotationComment(selectedItem?.tag);
			setSelectedActiveSpan(selectedItem);
		}
	};

	const loadAndHighlightTexts = async (contents: Array<CaseCommunicationAnnotationModel>): Promise<void> => {
		try {
			const div = annotateSectionRef.current;
			if (!div) return;

			// force await to process sequentially
			for (const annotation of contents) {
				await processAnnotation(annotation, div);
			}
		} catch (error) {
			console.error('An error occurred in loadAndHighlightTexts:', error);
		}
	};

	// separate function for async prcessing
	const processAnnotation = async (annotation: any, div: any) => {
		return new Promise((resolve: any, reject: any) => {
			const startIndex = annotation.start;
			const endIndex = annotation.end;

			let absoluteIndexWithinParent = 0;
			let found = false;

			const processNode = (node: Node) => {
				if (found) {
					return; // Skip if the condition is already satisfied or node has 'highlighted-text'
				}

				if (node.nodeType === Node.TEXT_NODE) {
					const nodeText = node.nodeValue;
					const nodeLength = (nodeText ?? '').length;

					const start = absoluteIndexWithinParent;
					const end = start + nodeLength - 1;

					if (start <= endIndex && end >= startIndex) {
						// Nodes overlap and matched
						found = true;
						nodeHasOverlap(node, startIndex, start, nodeText ?? '', endIndex, annotation);
					}

					absoluteIndexWithinParent += nodeLength;
				} else if (node.hasChildNodes()) {
					node.childNodes.forEach(processNode);
				}
			};

			div.childNodes.forEach(processNode);

			resolve();
		});
	};

	const nodeHasOverlap = (node: Node, startIndex: number, start: number, nodeText: string, endIndex: number, annotation: any) => {
		const range = document.createRange();
		range.setStart(node, Math.max(0, startIndex - start));
		range.setEnd(node, Math.min((nodeText ?? '').length, endIndex + 1 - start));
		const rangeText = range.toString();

		if (rangeText === annotation.text) {
			// add span highlights
			applySpanHighlights(range, annotation, rangeText);
			annotation.isValid = true;
		} else if (rangeText !== annotation.text && rangeText !== '') {
			annotation.isValid = false;
		}
	};

	const applySpanHighlights = (range: any, annotation: any, rangeText: string) => {
		const span = document.createElement('span');
		span.className = 'highlighted-text';
		span.style.backgroundColor = '#fbfb37';
		span.id = `${annotation.start}-${annotation.end}`;

		span.setAttribute('data-custom-tooltip', annotation.tag);
		span.setAttribute('data-custom-line-id', `${annotation.positionGroup}`);
		span.setAttribute('position', 'top');
		span.addEventListener('click', () =>
			handleClickOnSpan({start: annotation.start, end: annotation.end, text: rangeText || '', tag: annotation.tag})
		);
		span.addEventListener('mouseover', (e) =>
			handleMouseOverOnSpan({start: annotation.start, end: annotation.end, text: rangeText, tag: annotation.tag}, e)
		);
		span.addEventListener('mouseout', () =>
			setActivePopOverShow(() => {
				return activePopOverShow ?? false;
			})
		);
		range.surroundContents(span);
	};

	// to add highlight in newly added items
	const addCommentToSpans = (updatedSelectedRanges: Array<CaseCommunicationAnnotationModel>) => {
		const container = annotateSectionRef.current;

		const addTitleToSpan = (start: number, end: number, tag: string) => {
			if (container?.textContent) {
				const spans = container.querySelectorAll(`span.highlighted-text:not([data-custom-tooltip])`);

				spans?.forEach((span) => {
					// to add title or popover
					if (!span.hasAttribute('data-custom-tooltip')) {
						span.setAttribute('data-custom-tooltip', tag);
						// Add click event to the span
						span.addEventListener('click', () => handleClickOnSpan({start: start, end: end, text: span.textContent || '', tag}));
						span.addEventListener('mouseover', (e) => handleMouseOverOnSpan({start: start, end: end, text: span.textContent || '', tag}, e));
					}
				});
			}
		};

		updatedSelectedRanges.forEach((range) => {
			const start = range.start;
			const end = range.end;
			const tag = range.tag;
			addTitleToSpan(start, end, tag);
		});

		// once all are done, clear selectedRange
		setSelectedRanges([]);
	};

	const handleMouseOverOnSpan = ({start, end, text, tag}: {start: number; end: number; text: string; tag: string}, e: any) => {
		const rect = e.target.getBoundingClientRect();

		setToastPosition({
			// top: (rect.top + window.scrollY) - 127,
			top: rect.top + window.scrollY - 130,
			left: rect.left + window.scrollX - 304,
			tag: tag,
		});

		// Show the Toast
		setActivePopOverShow(true);
	};

	const handdleSelectTab = (selectedKey: string | null) => {
		if (selectedKey === 'chatStatistic') {
			// to trigger get data call when chat statistic tab is only selected
			setIsChatStatisticTabSelected(true)
		}
		else
		setIsChatStatisticTabSelected(false)
  	};

	return (
		<FormGroupContainerBordered>
			<h5>Communication List</h5>
			<div className='ag-theme-quartz pb-3' style={{width: '100%', marginTop: '-10px'}}>
				<GridWithLoaderAndPagination
					gridRef={gridRef}
					rowData={customerCaseCommList}
					columnDefs={columnDefs}
					sortColumn={sortColumn}
					sortOrder={sortOrder}
					isLoading={false}
					height={350}
					onSortChanged={(e: any) => onSort(e)}
					//pagination details
					recordCount={recordCount}
					currentPage={currentPage}
					pageSize={pageSize}
					onClickFirst={onClickFirst}
					onClickPrevious={onClickPrevious}
					onClickNext={onClickNext}
					onClickLast={onClickLast}
					onPageSizeChanged={onPageSizeChanged}
				></GridWithLoaderAndPagination>
			</div>
			<div className='separator separator-dashed my-5' />
			<label className='col-4 pb-5 control-label fs-3'>
				<h3 style={{display: 'inline-block'}}>Communication ID: &nbsp;</h3>
				{customerCaseCommunicationInfo?.caseCommunicationId}
			</label>
			<label className='col-6 pb-5 control-label fs-3'>
				<h3 style={{display: 'inline-block'}}>External ID: &nbsp;</h3>
				{customerCaseCommunicationInfo?.externalCommunicationId}
			</label>
			<Tabs defaultActiveKey='communicationInfo' id='controlled-tab-communication' className='mb-3' style={{fontWeight: '600'}} onSelect={handdleSelectTab}>
				<Tab eventKey='communicationInfo' title='Communication' tabClassName='communication-tabitem'>
					<FormGroupContainer>
						<div className='row mt-4'>
							<div className='col-lg-3'>
								<label className='fw-bolder'>Purpose:&nbsp;</label>
								<label>{customerCaseCommunicationInfo?.purpose}</label>
							</div>
							<div className='col-lg-3'>
								<label className='fw-bolder'>Communication Owner:&nbsp;</label>
								<label>{customerCaseCommunicationInfo?.communicationOwnerName}</label>
							</div>
							<div className='col-lg-2'>
								<label className='fw-bolder'>Message Type:&nbsp;</label>
								<label>{customerCaseCommunicationInfo?.messageType}</label>
							</div>
							<div className='col-lg-2'>
								<label className='fw-bolder'>Message Status:&nbsp;</label>
								<label>{customerCaseCommunicationInfo?.messageStatus}</label>
							</div>
						</div>
						<div className='row mt-4'>
							<div className='col-lg-3'>
								<label className='fw-bolder'>Start Communication:&nbsp;</label>
								<label>{mlabFormatDate(customerCaseCommunicationInfo?.startCommunicationDate, properFormatDateHourMinSec)}</label>
							</div>
							<div className='col-lg-3'>
								<label className='fw-bolder'>End Communication:&nbsp;</label>

								<label>{mlabFormatDate(customerCaseCommunicationInfo?.endCommunicationDate, properFormatDateHourMinSec)}</label>
							</div>
							<div className='col-lg-2'>
								<label className='fw-bolder'>Duration:&nbsp;</label>
								<label>{customerCaseCommunicationInfo?.duration}&nbsp;minutes</label>
							</div>
							<div className='col-lg-2'>
								<label className='fw-bolder'>Message Response:&nbsp;</label>
								<label>{customerCaseCommunicationInfo?.messageResponse}</label>
							</div>
							<div className='col-lg-2'>
								<span className='fw-bolder'>Reported Date:&nbsp;</span>
								<label>{mlabFormatDate(customerCaseCommunicationInfo?.reportedDate, properFormatDateHourMinSec)}</label>
							</div>
						</div>
						<div className='row mt-4 d-flex align-items-center'>
							<span className='fw-bolder' style={{width: 'auto'}}>
								Communication Content:{' '}
							</span>
							{access?.includes(USER_CLAIMS.CommunicationAnnotateWrite) && (
								<span className='fs-italic py-2' style={{fontStyle: 'italic', fontSize: '12px'}}>
									*Note: Highlight to add or click highlighted text to update annotation
								</span>
							)}
						</div>

						{access?.includes(USER_CLAIMS.CommunicationAnnotateWrite) || access?.includes(USER_CLAIMS.CommunicationAnnotateRead) ? (
							<div className='row'>
								<div className='col-lg-9'>
									<div
										id='annotateSectionHTMLParser'
										role='application'
										aria-label='Annotate Section'
										ref={annotateSectionRef}
										onMouseUp={handleSelection}
										contentEditable={false}
										style={{
											userSelect: 'text',
											maxHeight: '60rem',
											position: 'relative',
											border: '1px solid #c9c9c9',
											minHeight: '50em',
											paddingBottom: '1em',
											paddingLeft: '1.5em',
											paddingRight: '1.5em',
											overflowY: 'scroll',
										}}
									>
										<br />
										{ReactHtmlParser(initialContentRaw)}
									</div>

									<Toast
										show={activePopOverShow}
										onClose={() => {
											setActivePopOverShow(false);
										}}
										onMouseOut={() => {
											setActivePopOverShow(false);
										}}
										onMouseEnter={() => {
											setActivePopOverShow(true);
										}}
										className='toast-annotation'
										style={{
											position: 'absolute',
											top: toastPosition.top,
											left: toastPosition.left,
											color: '#3a3a3a',
											textAlign: 'left',
											display: activePopOverShow ? 'block' : 'none',
											maxWidth: '300px',
											minWidth: '200px',
										}}
									>
										<Toast.Body>{toastPosition.tag} </Toast.Body>
									</Toast>
								</div>

								<div className='col-lg-3'>
									{/* solution 2 */}
									<label className='fw-bold pb-2'>{showMofidyButtons ? 'Edit ' : 'Add '} line comment:</label>
									<textarea
										className='form-control mb-3 small font-weight-normal'
										rows={8}
										data-kt-element='input'
										maxLength={1000}
										value={annotationComment}
										onChange={(e) => setAnnotationComment(e.target.value)}
										style={{fontWeight: 'normal', fontSize: '1em'}}
										disabled={!access?.includes(USER_CLAIMS.CommunicationAnnotateWrite)}
									></textarea>

									<div style={{float: 'right'}}>
										<button
											type='button'
											className='btn btn-sm btn-secondary mx-2 px-3'
											onClick={() => onCancelAnnotationComment()}
											disabled={!access?.includes(USER_CLAIMS.CommunicationAnnotateWrite)}
										>
											<FontAwesomeIcon icon={faBan} size='lg' color='#5e5e5e' /> Cancel
										</button>
										{showMofidyButtons ? (
											<>
												<button
													type='button'
													className='btn btn-sm mx-2 px-3 border border-danger'
													style={{color: '#F1416C'}}
													title='Remove'
													disabled={!annotationComment || !access?.includes(USER_CLAIMS.CommunicationAnnotateWrite)}
													onClick={() => onDeleteAnnotationComment()}
												>
													<FontAwesomeIcon icon={faTrashAlt} size='lg' color='#F1416C' /> Remove
												</button>
												<button
													type='button'
													className='btn btn-sm px-3 border border-primary'
													style={{color: '#0095E8'}}
													disabled={!annotationComment || !access?.includes(USER_CLAIMS.CommunicationAnnotateWrite)}
													onClick={() => onUpdateAnnotationComment()}
												>
													<FontAwesomeIcon icon={faSave} size='lg' color='#0095E8' /> Save
												</button>
											</>
										) : (
											<button
												type='button'
												className='btn btn-sm px-3 border border-primary'
												style={{color: '#0095E8'}}
												disabled={!annotationComment || !access?.includes(USER_CLAIMS.CommunicationAnnotateWrite) || selectedRanges.length === 0}
												onClick={() => onSaveAnnotationComment()}
											>
												<FontAwesomeIcon icon={faSave} size='lg' color='#0095E8' /> Save
											</button>
										)}
									</div>
								</div>
							</div>
						) : (
							<div className='row'>
								<div className='border mt-4'>
									<MLabQuillEditor
										isUploadToMlabStorage={true}
										uploadToMlabStorage={undefined}
										isReadOnly={true}
										quillValue={decodedContent}
										setQuillValue={(content: string) => {
											setDecodedContent(content);
										}}
										hasImageToEditor={true}
									/>
								</div>
							</div>
						)}
					</FormGroupContainer>
				</Tab>
				<Tab eventKey='feedback' title='Feedback and Survey' tabClassName='communication-tabitem'>
					<CustomerCaseCommunicationFeedback communicationFeedback={customerCaseCommunicationFeedback} />
					<CustomerCaseCommunicationSurvey
						surveyTemplateId={customerCaseCommunicationInfo?.surveyTemplateId ?? null}
						communicationSurvey={customerCaseCommunicationSurvey}
					/>
				</Tab>
				<Tab eventKey='pcs' title='PCS' tabClassName='communication-tabitem'>
					<CustomerCaseCommunicationPCS pcsData={customerCaseCommunicationPCS} />
				</Tab>
				<Tab eventKey='systemdata' title='System Data' tabClassName='communication-tabitem'>
					<FormGroupContainer>
						<div className='row mt-4'>
							<div>
								<label className='fw-bolder'>Communication Created Date:&nbsp;</label>
								<label>{customerCaseCommunicationInfo?.createdDate}</label>
							</div>
						</div>
						<div className='row mt-4'>
							<div>
								<label className='fw-bolder'>Communication Created By:&nbsp;</label>
								<label>{customerCaseCommunicationInfo?.createdByName}</label>
							</div>
						</div>
						<div className='row mt-4'>
							<div>
								<label className='fw-bolder'>Last Updated Date:&nbsp;</label>
								<label>{customerCaseCommunicationInfo?.updatedDate}</label>
							</div>
						</div>
						<div className='row mt-4'>
							<div>
								<label className='fw-bolder'>Last Updated By:&nbsp;</label>
								<label>{customerCaseCommunicationInfo?.updatedByName}</label>
							</div>
						</div>
					</FormGroupContainer>
				</Tab>
				{customerCaseCommunicationInfo?.messageTypeId === parseInt(SearchCaseAndCommunication.LivePersonMessageTypeId) && (
					<Tab eventKey='chatStatistic' title='Chat Statistic' tabClassName='communication-tabitem' >
						<CustomerCaseChatStatistic communicationId={selectedCommunicationId} 
						messageType={customerCaseCommunicationInfo?.messageType}
						isChatStatisticTabSelected = {isChatStatisticTabSelected} />
					</Tab>
				)}
				
			</Tabs>
			{showCommReview && canAccessCommunicationReview() && (
				<div className='communication-review-drawer' style={{width: 'auto'}}>
					<DrawerComponent
						communicationReview={communicationReview}
						communicationReviewRef={communicationReviewRef}
						stateChange={setIsWithCurrentReview}
					></DrawerComponent>
				</div>
			)}
		</FormGroupContainerBordered>
	);
};

export default CustomerCaseCommunicationSec;
