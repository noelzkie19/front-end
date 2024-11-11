import {faPencilAlt, faTrash} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import {Guid} from 'guid-typescript';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ButtonGroup, Col, Row} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import gridOverlayTemplate from '../../../../common-template/gridTemplates';
import {ElementStyle} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {BasicTextInput, DefaultGridPagination, FormHeader, MainContainer, MlabButton, TableIconButton} from '../../../../custom-components';
import {useLanguageOption} from '../../../../custom-functions';
import {usePromptOnUnload} from '../../../../custom-helpers';
import {IAuthState} from '../../../auth';
import {OptionsSelectedModel} from '../../../system/models';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import useRemSettingConstant from '../../constants/useRemSettingConstant';
import {
	SaveScheduleTemplateRequest,
	ScheduleTemplateByIdRequest,
	ScheduleTemplateLanguageListResponse,
	ScheduleTemplateLanguageRequest,
	ScheduleTemplateLanguageResponse,
	ScheduleTemplateLanguageTypeRequest,
	UseStateModel,
	ValidateTemplateRequest,
} from '../../models';
import {
	GetScheduleTemplateLanguageSettingListAsync,
	GetScheduleTeplateSettingById,
	SaveScheduleTemplateSetting,
	SendGetScheduleTemplateLanguageSettingList,
	SendGetScheduleTeplateSettingById,
	ValidateTemplateSetting,
} from '../../services/RemSettingApi';
import {ActiveTemplateUsers} from '../../shared/components';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import CellRenderRowIndex from '../../../../custom-components/grid-components/CellRenderRowIndex';

const EditRemScheduleTemplate: React.FC = () => {
	//Redux
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	// Constants
	const {remSettingMessages, defaultOptionValue} = useRemSettingConstant();

	//States
	const [templateName, setTemplateName] = useState<UseStateModel>({value: '', dirty: false});
	const [templateDescription, setTemplateDescription] = useState<UseStateModel>({value: '', dirty: false});
	const [rowData, setRowData] = useState<{value: Array<ScheduleTemplateLanguageResponse>; dirty: boolean}>({value: [], dirty: false});
	const [language, setLanguage] = useState<any>(defaultOptionValue);
	const [languageLocalTranslation, setLanguageLocalTranslation] = useState<string>('');
	const [isUpdateLanguage, setIsUpdateLanguage] = useState<boolean>(false);
	const [updateLanguage, setUpdateLanguage] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [templateLanguageSettingId, setTemplateLanguageSettingId] = useState<number>(0);
	const [templateSettingId, setTemplateSettingId] = useState<number>(0);
	const [isDirty, setIsDirty] = useState<boolean>(false);

	// Pagination
	const [pageSize, setPageSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [recordCount, setRecordCount] = useState<number>(0);
	const sortOrder = 'ASC';
	const sortColumn = 'languageId';

	// Hooks
	const {languageOptions} = useLanguageOption();
	const {HubConnected, successResponse} = useConstant();
	const history = useHistory();
	usePromptOnUnload(true, 'Are you sure you want to leave?');
	const {id}: {id: number} = useParams();
	const ArrayObjOptionLanguange = languageOptions.filter(({id}) => !rowData.value.some(({languageId}) => languageId === id));

	//useRef hooks
	const gridRef: any = useRef();

	//Mounted
	useEffect(() => {
		_getScheduleTemplateOnView();
	}, []);

	//Watchers
	useEffect(() => {
		// added interval due to loading overlay issue
		if (gridRef.current.api != null) {
			setTimeout(() => {
				if (isLoading) {
					onBtShowLoading();
				} else {
					if (rowData.value.length > 0) {
						onBtHide();
					} else {
						onBtShowNoRows();
					}
				}
			}, 10);
		}
	}, [isLoading]);

	useEffect(() => {
		if (rowData.dirty || templateName.dirty || templateDescription.dirty) {
			setIsDirty(true);
		}
	}, [rowData.dirty, templateName.dirty, templateDescription.dirty]);
	//Constants
	let userAccessId = userId === undefined ? 1 : userId.toString();
	const columnDefs : (ColDef<ScheduleTemplateLanguageResponse> | ColGroupDef<ScheduleTemplateLanguageResponse>)[] =[
		{headerName: 'No', field: 'languageId', cellRenderer: CellRenderRowIndex},

		{headerName: 'Language', field: 'languageName'},
		{headerName: 'Local Character Translation', field: 'languageLocalTranslation'},
		{
			headerName: 'Action',
			field: 'languageId',
			sortable: false,
			cellRenderer: (params: any) => editRemScheduleActionButtons(params),
		},
	];

	const editRemScheduleActionButtons = (params: any) => {
		return (
			<ButtonGroup aria-label='Basic example'>
				<div className='d-flex justify-content-center flex-shrink-0'>
					<div className='me-6'>
						<TableIconButton
							access={access?.includes(USER_CLAIMS.RemSettingWrite)}
							faIcon={faPencilAlt}
							isDisable={false}
							toolTipText={'Edit'}
							onClick={() => {
								_handleUpdateLanguage(params.data);
							}}
						/>
					</div>
					<div className='me-6'>
						<TableIconButton
							access={access?.includes(USER_CLAIMS.RemSettingWrite)}
							faIcon={faTrash}
							isDisable={false}
							toolTipText={'Remove'}
							iconColor={'text-danger'}
							onClick={() => {
								_handleRemoveLanguage(params.data);
							}}
						/>
					</div>
				</div>
			</ButtonGroup>
		);
	};

	const renderEditRemAgGridNoColumn = (editRemParams: any) => {
		return <>{editRemParams ? <div>{editRemParams.rowIndex + 1 + (currentPage - 1) * pageSize}</div> : null}</>;
	};

	//Events
	const onChangeLanguage = (val: OptionsSelectedModel) => {
		setLanguage(val);
	};

	//Validations
	const _validateAddRemLanguage = () => {
		//check required fields
		let isError: boolean = false;

		if (language?.value === undefined) {
			isError = true;
		}
		if (languageLocalTranslation === '') {
			isError = true;
		}
		return isError;
	};

	const _validateAddRemSchedule = () => {
		let isError: boolean = false;

		if (templateName.value === '') {
			isError = true;
		}
		if (templateDescription.value === '') {
			isError = true;
		}
		return isError;
	};

	//Methods
	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	const onBtShowLoading = useCallback(() => {
		gridRef.current.api.showLoadingOverlay();
	}, []);

	const onBtShowNoRows = useCallback(() => {
		gridRef.current.api.showNoRowsOverlay();
	}, []);

	const onBtHide = useCallback(() => {
		gridRef.current.api.hideOverlay();
	}, []);

	//Api Methods
	const _getScheduleTemplateOnView = () => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				const request: ScheduleTemplateByIdRequest = {
					queueId: Guid.create().toString(),
					userId: userAccessId.toString(),
					ScheduleTeplateSettingId: id,
				};
				SendGetScheduleTeplateSettingById(request).then((response) => {
					if (response.status === successResponse) {
						messagingHub.on(request.queueId.toString(), (message) => {
							GetScheduleTeplateSettingById(message.cacheId)
								.then((data) => {
									_getScheduleTemplateSettingLanguageList(10, 1, 'ScheduleTemplateLanguageSettingId', 'ASC');
									setTemplateName({value: data.data.scheduleTemplateName, dirty: false});
									setTemplateDescription({value: data.data.scheduleTemplateDescription, dirty: false});

									messagingHub.off(request.queueId.toString());
									messagingHub.stop();
								})
								.catch(() => {});
						});

						setTimeout(() => {
							if (messagingHub.state === HubConnected) {
								messagingHub.stop();
							}
						}, 30000);
					} else {
						messagingHub.stop();
					}
				});
			});
		}, 1000);
	};

	const _getScheduleTemplateSettingLanguageList = (pageSize: number, currentPage: number, sortColumn: string, sortOrder: string) => {
		setRowData({value: [], dirty: false});
		setTimeout(() => {
			setIsLoading(true);
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub.start().then(() => {
				const request: ScheduleTemplateLanguageRequest = {
					queueId: Guid.create().toString(),
					userId: userAccessId.toString(),
					scheduleTemplateSettingId: id,
					pageSize: pageSize,
					offsetValue: (currentPage - 1) * pageSize,
					sortColumn: sortColumn,
					sortOrder: sortOrder,
				};
				SendGetScheduleTemplateLanguageSettingList(request).then((response) => {
					if (response.status === successResponse) {
						messagingHub.on(request.queueId.toString(), (message) => {
							GetScheduleTemplateLanguageSettingListAsync(message.cacheId)
								.then((data) => {
									let resultData = Object.assign(new Array<ScheduleTemplateLanguageListResponse>(), data.data.scheduleTemplateLanguagesList);
									setRowData({value: resultData, dirty: false});
									setRecordCount(data.data.totalRecordCount);
									setIsLoading(false);
									messagingHub.off(request.queueId.toString());
									messagingHub.stop();
								})
								.catch(() => {
									console.log('error from callback function');
								});
						});
						setTimeout(() => {
							if (messagingHub.state === HubConnected) {
								messagingHub.stop();
							}
						}, 30000);
					} else {
						messagingHub.stop();
					}
				});
			});
		}, 1000);
	};

	const _handleAddLanguage = () => {
		if (_validateAddRemLanguage()) {
			swal('Failed', remSettingMessages.mandatoryFields, 'error');
		} else {
			const requestToStore: ScheduleTemplateLanguageResponse = {
				languageId: language?.value !== undefined ? parseInt(language?.value) : 0,
				languageLocalTranslation: languageLocalTranslation,
				languageName: language?.label !== undefined ? language?.label : '',
				scheduleTemplateLanguageSettingId: 0,
				scheduleTemplateSettingId: id,
			};

			if (rowData.value.length === 0) {
				setRowData({value: [requestToStore], dirty: true});
				_clearFields();
			} else {
				// check if language already exist on table before adding on grid
				if (rowData.value.filter((x) => x.languageId === requestToStore.languageId).length === 0) {
					setRowData({value: [...rowData.value, requestToStore], dirty: true});
					_clearFields();
				} else {
					swal('Failed', remSettingMessages.allReadyOnTable, 'error');
				}
				_clearFields();
			}
		}
	};

	const _handleUpdateLanguage = (data: ScheduleTemplateLanguageResponse) => {
		setIsUpdateLanguage(true);
		setLanguage({label: data.languageName, value: data.languageId.toString()});
		setLanguageLocalTranslation(data.languageLocalTranslation);
		setUpdateLanguage(data.languageName);
		setTemplateLanguageSettingId(data.scheduleTemplateLanguageSettingId);
		setTemplateSettingId(data.scheduleTemplateSettingId);
	};

	const _submitUpdateLanguage = () => {
		if (_validateAddRemLanguage()) {
			swal('Failed', remSettingMessages.mandatoryFields, 'error');
		} else {
			const requestNewData: ScheduleTemplateLanguageResponse = {
				languageId: language?.value !== undefined ? parseInt(language?.value) : 0,
				languageLocalTranslation: languageLocalTranslation,
				languageName: language?.label !== undefined ? language?.label : '',
				scheduleTemplateLanguageSettingId: templateLanguageSettingId,
				scheduleTemplateSettingId: templateSettingId,
			};

			swal({
				title: 'Confirmation',
				text: remSettingMessages.updateLanguageSetting,
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			}).then((onClosePage) => {
				if (onClosePage) {
					let removeToEditData = rowData.value.filter((x) => x.languageName !== updateLanguage);

					setRowData({value: [requestNewData, ...removeToEditData], dirty: true});
					setIsUpdateLanguage(false);
					setUpdateLanguage('');
					setTemplateLanguageSettingId(0);
					setTemplateSettingId(0);
					_clearFields();
				} else {
					_clearFields();
				}
			});
		}
	};

	const postEditScheduleTemplate = () => {
		// check if user added atlease one language to proceed
		if (rowData.value.length === 0 || rowData.value.filter((x) => x.languageId === 2).length === 0) {
			swal('Failed', remSettingMessages.noLanguage, 'error');
		} else {
			let postData = Array<ScheduleTemplateLanguageTypeRequest>();
			rowData.value.forEach((x: ScheduleTemplateLanguageResponse) => {
				const languageRequest: ScheduleTemplateLanguageTypeRequest = {
					languageId: x.languageId,
					languageLocalTranslation: x.languageLocalTranslation,
					scheduleTemplateLanguageSettingId: x.scheduleTemplateLanguageSettingId,
					scheduleTemplateSettingId: x.scheduleTemplateSettingId,
				};
				postData.push(languageRequest);
			});

			const request: SaveScheduleTemplateRequest = {
				queueId: Guid.create().toString(),
				scheduleTemplateName: templateName.value,
				scheduleTemplateDescription: templateDescription.value,
				scheduleTemplateSettingId: id,
				userId: userAccessId.toString(),
				scheduleTemplateLanguageSettingType: postData,
				isDirty: isDirty,
			};
			setIsSubmitting(true);
			setTimeout(() => {
				const messagingHub = hubConnection.createHubConnenction();

				messagingHub
					.start()
					.then(() => {
						if (messagingHub.state === HubConnected) {
							const validateAddRequest: ValidateTemplateRequest = {
								isAdd: 0,
								scheduleTemplateName: templateName.value,
								scheduleTemplateSettingId: id,
							};

							ValidateTemplateSetting(validateAddRequest).then((response) => {
								if (response.data.status === successResponse) {
									//submit confirmation before proceed
									swal({
										title: 'Confirmation',
										text: remSettingMessages.updateConfirm,
										icon: 'warning',
										buttons: ['No', 'Yes'],
										dangerMode: true,
									}).then((onConfirmAddTemplate) => {
										if (onConfirmAddTemplate) {
											SaveScheduleTemplateSetting(request)
												.then((response) => {
													if (response.status === successResponse) {
														messagingHub.on(request.queueId.toString(), (message) => {
															let resultData = JSON.parse(message.remarks);

															if (resultData.Status === successResponse) {
																swal('Success', 'Transaction successfully submitted', 'success').then((onSuccess) => {
																	if (onSuccess) {
																		history.push(
																			`/relationship-management/rem-view-schedule-template/detail/${resultData.Data.ScheduleTemplateSettingId}`
																		);
																		setIsSubmitting(false);
																	}
																});
															} else {
																setIsSubmitting(false);
																swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
															}

															messagingHub.off(request.queueId.toString());
															messagingHub.stop();
														});

														setTimeout(() => {
															if (messagingHub.state === HubConnected) {
																messagingHub.stop();
															}
														}, 30000);
													} else {
														setIsSubmitting(false);
														swal('Failed', 'Problem in Connection on Gateway', 'error');
													}
												})
												.catch(() => {
													setIsSubmitting(false);
													messagingHub.stop();
													swal('Failed', 'Problem in Connection on Gateway', 'error');
												});
										} else {
											setIsSubmitting(false);
										}
									});
								} else {
									//template name already exist on database
									swal('Failed', remSettingMessages.existingTemplateName, 'error');
								}
							});
						}
					})
					.catch((err) => console.log('Error while starting connection: ' + err));
			}, 1000);
		}
	};

	const _submitEditScheduleTemplate = () => {
		//Validation of fields
		if (_validateAddRemSchedule()) {
			swal('Failed', remSettingMessages.mandatoryFields, 'error');
		} else {
			postEditScheduleTemplate();
		}
	};

	const _handleRemoveLanguage = (data: ScheduleTemplateLanguageResponse) => {
		swal({
			title: 'Confirmation',
			text: remSettingMessages.removeLanguageSetting,
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((onClosePage) => {
			if (onClosePage) {
				setRowData({value: rowData.value.filter((x) => x.languageId !== data.languageId), dirty: false});
				_clearFields();
			} else {
				_clearFields();
			}
		});
	};

	const _back = () => {
		swal({
			title: 'Confirmation',
			text: remSettingMessages.closePage,
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		}).then((onBack) => {
			if (onBack) {
				history.push('/relationship-management/rem-schedule');
			}
		});
	};

	const _clearFields = () => {
		setLanguage(defaultOptionValue);
		setLanguageLocalTranslation('');
	};

	//Table Methods
	const onPageSizeChangedEdit = () => {
		const value: string = (document.getElementById('page-size') as HTMLInputElement).value;
		setPageSize(Number(value));
		setCurrentPage(1);

		if (rowData != undefined && rowData.value.length > 0) {
			_getScheduleTemplateSettingLanguageList(10, 1, sortColumn, sortOrder);
		}
	};

	const onClickFirstEdit = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
			_getScheduleTemplateSettingLanguageList(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickPreviousEdit = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			_getScheduleTemplateSettingLanguageList(pageSize, 1, sortColumn, sortOrder);
		}
	};

	const onClickNextEdit = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(currentPage + 1);
			_getScheduleTemplateSettingLanguageList(pageSize, currentPage + 1, sortColumn, sortOrder);
		}
	};

	const onClickLastEdit = () => {
		if (totalPage() > currentPage) {
			setCurrentPage(totalPage());
			_getScheduleTemplateSettingLanguageList(pageSize, totalPage(), sortColumn, sortOrder);
		}
	};

	const totalPage = () => {
		return Math.ceil(recordCount / pageSize) | 0;
	};

	//Local Components
	const FooterEditSchedule = () => {
		return (
			<MainContainer>
				<div style={{margin: 20}}>
					<Row>
						<Col sm={4}>
							<MlabButton
								access={access?.includes(USER_CLAIMS.RemSettingWrite)}
								size={'sm'}
								label={'Submit'}
								style={ElementStyle.primary}
								type={'button'}
								weight={'solid'}
								loading={isSubmitting}
								disabled={isSubmitting}
								loadingTitle={' Please wait...'}
								onClick={_submitEditScheduleTemplate}
							/>
							<MlabButton
								access={access?.includes(USER_CLAIMS.RemSettingWrite)}
								size={'sm'}
								label={'Back'}
								style={ElementStyle.secondary}
								type={'button'}
								weight={'solid'}
								loading={false}
								disabled={false}
								loadingTitle={' Please wait...'}
								onClick={_back}
							/>
						</Col>
						<Col sm={8}></Col>
					</Row>
				</div>
			</MainContainer>
		);
	};

	return (
		<>
			<MainContainer>
				<div>
					<FormHeader headerLabel={'Edit Schedule Template'} />
					<div style={{margin: 20}}>
						<Row>
							<Col sm={12}>
								<label className='col-form-label col-sm required'>{'Schedule Template Name'}</label>
								<BasicTextInput
									ariaLabel={'Schedule Template Name'}
									colWidth={'col-sm-12'}
									value={templateName.value}
									onChange={(e) => setTemplateName({value: e.target.value, dirty: true})}
									disabled={false}
								/>
							</Col>
							<Col sm={12} style={{marginTop: 10}}>
								<label className='col-form-label col-sm required'>{'Schedule Template Description'}</label>
								<textarea
									defaultValue={templateDescription.value}
									className='form-control form-control-sm'
									value={templateDescription.value}
									onChange={(e) => setTemplateDescription({value: e.target.value, dirty: true})}
								/>
							</Col>
						</Row>
					</div>
				</div>
			</MainContainer>
			<div style={{margin: 20}} />
			<MainContainer>
				<div>
					<FormHeader headerLabel={'Language Setting'} />
					<Row style={{margin: 10}}>
						<Col sm={6}>
							<Row>
								<Col sm={4}>
									<label className='col-form-label col-sm required'>{'Select Language'}</label>
								</Col>
								<Col sm={8} style={{borderWidth: 1, borderColor: '#000'}}>
									<Select
										style={{width: '100%'}}
										options={ArrayObjOptionLanguange.filter((x) => x.isComplete === true).flatMap((x) => [
											{label: x.languageName, value: x.id?.toString()},
										])}
										onChange={onChangeLanguage}
										value={language}
										isDisabled={isUpdateLanguage}
									/>
								</Col>
							</Row>
							<Row style={{marginTop: 20}}>
								<Col sm={4}>
									<label className='col-form-label col-sm required'>{'Local Character Translation'}</label>
								</Col>
								<Col sm={8}>
									<textarea
										className='form-control form-control-sm'
										value={languageLocalTranslation}
										onChange={(e) => setLanguageLocalTranslation(e.target.value)}
										disabled={false}
									/>
								</Col>
							</Row>
							<Row style={{marginTop: 20}}>
								<Col sm={6}>
									{isUpdateLanguage ? (
										<MlabButton
											access={true}
											size={'sm'}
											label={'Update Language Setting'}
											style={ElementStyle.primary}
											type={'button'}
											weight={'solid'}
											loading={false}
											disabled={false}
											loadingTitle={' Please wait...'}
											onClick={_submitUpdateLanguage}
										/>
									) : (
										<MlabButton
											access={true}
											size={'sm'}
											label={'Add Language Setting'}
											style={ElementStyle.primary}
											type={'button'}
											weight={'solid'}
											loading={false}
											disabled={false}
											loadingTitle={' Please wait...'}
											onClick={_handleAddLanguage}
										/>
									)}
								</Col>
							</Row>
						</Col>
					</Row>
					<Row style={{margin: 10}}>
						<Col sm={12}>
							<div className='ag-theme-quartz mt-5' style={{height: 500, width: '100%'}}>
								<AgGridReact
									rowData={rowData.value}
									defaultColDef={{
										sortable: true,
										resizable: true,
									}}
									onGridReady={onGridReady}
									rowBuffer={0}
									enableRangeSelection={true}
									pagination={false}
									paginationPageSize={10}
									columnDefs={columnDefs}
									overlayNoRowsTemplate={gridOverlayTemplate}
									overlayLoadingTemplate={gridOverlayTemplate}
									ref={gridRef}
								/>
								<DefaultGridPagination
									showPageSizeChange={false}
									recordCount={recordCount}
									currentPage={currentPage}
									pageSize={pageSize}
									onClickFirst={onClickFirstEdit}
									onClickPrevious={onClickPreviousEdit}
									onClickNext={onClickNextEdit}
									onClickLast={onClickLastEdit}
									onPageSizeChanged={onPageSizeChangedEdit}
								/>
							</div>
						</Col>
					</Row>
				</div>
			</MainContainer>
			<div style={{margin: 20}} />
			<ActiveTemplateUsers id={id} />
			<div style={{margin: 20}} />
			<FooterEditSchedule />
		</>
	);
};

export default EditRemScheduleTemplate;
