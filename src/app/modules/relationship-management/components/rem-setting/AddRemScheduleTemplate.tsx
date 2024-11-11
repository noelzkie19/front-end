import {faPencilAlt, faTrash} from '@fortawesome/free-solid-svg-icons';
import {HubConnection} from '@microsoft/signalr';
import {AgGridReact} from 'ag-grid-react';
import {AxiosResponse} from 'axios';
import {Guid} from 'guid-typescript';
import React, {useState} from 'react';
import {ButtonGroup, Col, Row} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {ElementStyle} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {BasicTextInput, FormHeader, MainContainer, MlabButton, TableIconButton} from '../../../../custom-components';
import {useLanguageOption} from '../../../../custom-functions';
import {usePromptOnUnload} from '../../../../custom-helpers';
import {IAuthState} from '../../../auth';
import {OptionsSelectedModel} from '../../../system/models';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import useRemSettingConstant from '../../constants/useRemSettingConstant';
import {
	SaveScheduleTemplateRequest,
	ScheduleTemplateLanguageResponse,
	ScheduleTemplateLanguageTypeRequest,
	ValidateTemplateRequest,
} from '../../models';
import {SaveScheduleTemplateSetting, ValidateTemplateSetting} from '../../services/RemSettingApi';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import CellRenderRowIndex from '../../../../custom-components/grid-components/CellRenderRowIndex';

const AddRemScheduleTemplate: React.FC = () => {
	//Redux
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	// Hooks
	const {languageOptions} = useLanguageOption();
	const {remSettingMessages, defaultOptionValue} = useRemSettingConstant();
	const {HubConnected, successResponse} = useConstant();
	const history = useHistory();
	usePromptOnUnload(true, 'Are you sure you want to leave?');

	//States
	const [templateName, setTemplateName] = useState<string>('');
	const [templateDescription, setTemplateDescription] = useState<string>('');
	const [rowData, setRowData] = useState<Array<ScheduleTemplateLanguageResponse>>([]);
	const [language, setLanguage] = useState<any>(defaultOptionValue);
	const [languageLocalTranslation, setLanguageLocalTranslation] = useState<string>('');
	const [isUpdateLanguage, setIsUpdateLanguage] = useState<boolean>(false);
	const [updateLanguage, setUpdateLanguage] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	//Constants
	let userAccessId = userId === undefined ? 1 : userId.toString();
	const ArrayObjOptionLanguange = languageOptions.filter(({id: id}) => !rowData.some(({languageId: languageId}) => languageId === id));

	const customCellLanguageIdRender = (params: any) => {
		const {data} = params;

		return (
			<ButtonGroup aria-label='Basic example'>
				<div className='d-flex justify-content-center flex-shrink-0'>
					<div className='me-6'>
						<TableIconButton
							access={true}
							faIcon={faPencilAlt}
							isDisable={false}
							toolTipText={'Edit'}
							onClick={() => {
								_handleUpdateLanguage(data);
							}}
						/>
					</div>
					<div className='me-6'>
						<TableIconButton
							access={true}
							faIcon={faTrash}
							isDisable={false}
							toolTipText={'Remove'}
							iconColor={'text-danger'}
							onClick={() => {
								_handleRemoveLanguage(data);
							}}
						/>
					</div>
				</div>
			</ButtonGroup>
		);
	};
	const customCellNoRender = (params: any) => {
		return <>{params ? <div>{params.rowIndex + 1}</div> : null}</>;
	};
	const columnDefs : (ColDef<ScheduleTemplateLanguageResponse> | ColGroupDef<ScheduleTemplateLanguageResponse>)[] = [
		{headerName: 'No', field: 'languageId', cellRenderer: CellRenderRowIndex},
		{headerName: 'Language', field: 'languageName'},
		{headerName: 'Local Character Translation', field: 'languageLocalTranslation'},
		{
			headerName: 'Action',
			field: 'languageId',
			cellRenderer: customCellLanguageIdRender,
		},
	];

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

		if (templateName === '') {
			isError = true;
		}
		if (templateDescription === '') {
			isError = true;
		}
		return isError;
	};

	//Methods
	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
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
				scheduleTemplateSettingId: 0,
			};

			if (rowData.length === 0) {
				setRowData([requestToStore]);
				_clearFields();
			} else {
				// check if language already exist on table before adding on grid
				if (rowData.filter((x) => x.languageId === requestToStore.languageId).length === 0) {
					setRowData([...rowData, requestToStore]);
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
	};

	const _submitUpdateLanguage = () => {
		if (_validateAddRemLanguage()) {
			swal('Failed', remSettingMessages.mandatoryFields, 'error');
		} else {
			const requestNewData: ScheduleTemplateLanguageResponse = {
				languageId: language?.value !== undefined ? parseInt(language?.value) : 0,
				languageLocalTranslation: languageLocalTranslation,
				languageName: language?.label !== undefined ? language?.label : '',
				scheduleTemplateLanguageSettingId: 0,
				scheduleTemplateSettingId: 0,
			};

			swal({
				title: 'Confirmation',
				text: remSettingMessages.updateLanguageSetting,
				icon: 'warning',
				buttons: ['No', 'Yes'],
				dangerMode: true,
			}).then((onClosePage) => {
				if (onClosePage) {
					let removeToEditData = rowData.filter((x) => x.languageName !== updateLanguage);

					setRowData([...removeToEditData, requestNewData]);
					setIsUpdateLanguage(false);
					setUpdateLanguage('');
					_clearFields();
				} else {
					_clearFields();
				}
			});
		}
	};

	const postAddScheduleTemplate = () => {
		// check if user added english  language to proceed
		if (rowData.length === 0 || rowData.filter((x) => x.languageId === 2).length === 0) {
			swal('Failed', remSettingMessages.noLanguage, 'error');
		} else {
			let postData = Array<ScheduleTemplateLanguageTypeRequest>();
			rowData.forEach((x: ScheduleTemplateLanguageResponse) => {
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
				scheduleTemplateName: templateName,
				scheduleTemplateDescription: templateDescription,
				scheduleTemplateSettingId: 0,
				userId: userAccessId.toString(),
				scheduleTemplateLanguageSettingType: postData,
				isDirty: false,
			};

			setTimeout(() => {
				setIsSubmitting(true);
				const messagingHub = hubConnection.createHubConnenction();
				messagingHub
					.start()
					.then(() => {
						if (messagingHub.state === HubConnected) {
							const validateAddRequest: ValidateTemplateRequest = {
								isAdd: 1,
								scheduleTemplateName: templateName,
								scheduleTemplateSettingId: 0,
							};

							ValidateTemplateSetting(validateAddRequest).then((response) => {
								if (response.data.status === successResponse) {
									//submit confirmation before proceed
									swal({
										title: 'Confirmation',
										text: remSettingMessages.submitConfirm,
										icon: 'warning',
										buttons: ['No', 'Yes'],
										dangerMode: true,
									}).then((onConfirmAddTemplate) => {
										if (onConfirmAddTemplate) {
											SaveScheduleTemplateSetting(request)
												.then((response) => {
													debugger;
													processSaveScheduleTemplateSettingRecieved(messagingHub, response, request);
												})
												.catch(() => {
													messagingHub.stop();
													setIsSubmitting(false);
													swal('Failed', 'Problem in Connection on Gateway', 'error');
												});
										} else {
											setIsSubmitting(false);
										}
									});
								} else {
									//template name already exist on database
									swal('Failed', remSettingMessages.existingTemplateName, 'error');
									setIsSubmitting(false);
								}
							});
						}
					})
					.catch((err) => console.log('Error while starting connection: ' + err));
			}, 1000);
		}
	};
	const processSaveScheduleTemplateSettingResult = (resultData: any) => {
		if (resultData.Status === successResponse) {
			setIsSubmitting(false);
			swal('Success', 'Transaction successfully submitted', 'success').then((onSuccess) => {
				if (onSuccess) {
					history.push(`/relationship-management/rem-view-schedule-template/detail/${resultData.Data.ScheduleTemplateSettingId}`);
				}
			});
		} else {
			setIsSubmitting(false);
			swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
		}
	};
	const processSaveScheduleTemplateSettingRecieved = (
		messagingHub: HubConnection,
		response: AxiosResponse<any>,
		request: SaveScheduleTemplateRequest
	) => {
		if (response.status === successResponse) {
			messagingHub.on(request.queueId.toString(), (message) => {
				let resultData = JSON.parse(message.remarks);
				processSaveScheduleTemplateSettingResult(resultData);
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
	};
	const _submitAddScheduleTemplate = () => {
		//Validation of fields
		if (_validateAddRemSchedule()) {
			swal('Failed', remSettingMessages.mandatoryFields, 'error');
		} else {
			postAddScheduleTemplate();
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
				setRowData(rowData.filter((x) => x.languageId !== data.languageId));
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

	return (
		<>
			<MainContainer>
				<div>
					<FormHeader headerLabel={'Add Schedule Template'} />
					<div style={{margin: 20}}>
						<Row>
							<Col sm={12}>
								<label className='col-form-label col-sm required'>{'Schedule Template Name'}</label>
								<BasicTextInput
									ariaLabel={'Schedule Template Name'}
									colWidth={'col-sm-12'}
									value={templateName}
									onChange={(e) => setTemplateName(e.target.value)}
									disabled={false}
								/>
							</Col>
							<Col sm={12} style={{marginTop: 10}}>
								<label className='col-form-label col-sm required'>{'Schedule Template Description'}</label>
								<textarea
									defaultValue={templateDescription}
									className='form-control form-control-sm'
									value={templateDescription}
									onChange={(e) => setTemplateDescription(e.target.value)}
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
								<Col sm={12}>
									{isUpdateLanguage ? (
										<MlabButton
											access={access?.includes(USER_CLAIMS.RemSettingWrite)}
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
											access={access?.includes(USER_CLAIMS.RemSettingWrite)}
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
								<Col sm={8}></Col>
							</Row>
							<Col sm={6}></Col>
						</Col>
					</Row>
					<Row style={{margin: 10}}>
						<Col sm={12}>
							<div className='ag-theme-quartz mt-5' style={{height: 500, width: '100%'}}>
								<AgGridReact
									rowData={rowData}
									defaultColDef={{
										sortable: true,
										resizable: true,
									}}
									onGridReady={onGridReady}
									rowBuffer={0}
									enableRangeSelection={true}
									pagination={true}
									paginationPageSizeSelector={false}
									paginationPageSize={10}
									columnDefs={columnDefs}
								/>
							</div>
						</Col>
					</Row>
				</div>
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
								onClick={_submitAddScheduleTemplate}
							/>
							<MlabButton
								access={access?.includes(USER_CLAIMS.RemSettingRead)}
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
		</>
	);
};

export default AddRemScheduleTemplate;
