import {faPencilAlt, faTrash} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ModalFooter} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import * as Yup from 'yup';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {ElementStyle} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
// -- COMPONENTS -- //
import {
	BasicFieldLabel,
	ButtonsContainer,
	FormContainer,
	FormGroupContainer,
	FormModal,
	LoaderButton,
	LocalGridPagination,
	MlabButton,
	RequiredLabel,
	TableIconButton
} from '../../../../custom-components';
import {useCurrencies} from '../../../../custom-functions';
import useSystemHooks from '../../../../custom-functions/system/useSystemHooks';
import {usePromptOnUnload} from '../../../../custom-helpers';
import {IAuthState} from '../../../auth';
// -- MODELS -- //
import {
	CurrencyOptions,
	CurrencyRowsModel,
	GetSubtopicById,
	SubtopicByIdResponseModel,
	SubtopicLanguageModel,
	SubtopicNewRequestModel,
	TopicOptions,
	TopicRowsModel
} from '../../models';
// -- MOCKS DATA -- //
import {getSubtopicById, sendGetSubtopicById, upsertSubtopic, validatedSubtopicName} from '../../redux/SystemService';
import {CodelistLoading, useSystemOptionHooks} from '../../shared';
import SubtopicLangunageInfoMessage from './SubtopicLangunageInfoMessage';

// -- INTERFACES -- //
interface Props {
	showForm: boolean;
	closeModal: () => void;
	data: any;
	setModalShow: any;
	search: () => void;
}

// -- YUP SCHEMA -- //
const createSubtopicSchema = Yup.object().shape({
	subTopicName: Yup.string(),
});

// -- INITIAL VALUES OF FORM --//
const initialValues = {
	subTopicName: '',
	subTopicStatus: '',
	topics: Array<TopicOptions>(),
	currencies: Array<CurrencyOptions>(),
};

//	Styles
const languageInstructionStyle = {
	fontStyle: 'italic',
	color: '#818181',
	fontSize: '12px',
};
const EditSubtopic: React.FC<Props> = ({showForm, closeModal, data, setModalShow, search}) => {
	// Redux
	const {userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const gridRef: any = useRef();
	const messagingHub = hubConnection.createHubConnenction();

	// States
	const [selectedStatuses, setSelectedStatuses] = useState<any>('');
	const [rowData, setRowData] = useState<Array<any>>([]);
	const [disableLanguage, setDisableLanguage] = useState<boolean>(false);

	//	Language
	const [language, setLanguage] = useState<any>('');
	const [languageTranslation, setLanguageTranslation] = useState<string>('');
	const [isUpdateLanguage, setIsUpdateLanguage] = useState<boolean>(false);
	const [selectedSubtopicLanguageId, setSelectedSubtopicLanguageId] = useState<any>(null);

	//	Subtopic Details
	const [subtopicData, setSubtopicData] = useState<SubtopicByIdResponseModel>();
	const [selectedTopics, setSelectedTopics] = useState<Array<TopicOptions>>([]);
	const [selectedCurrencies, setSelectedCurrencies] = useState<Array<CurrencyOptions>>([]);
	const [defaultTopics, setDefaultTopics] = useState<Array<TopicOptions>>([]);
	const [subtopicNameInput, setSubtopicNameInput] = useState<string>('');

	//	Pagination
	const [gridPageSize, setGridPageSize] = useState<number>(10);
	const [gridCurrentPage, setGridCurrentPage] = useState<number>(1);
	const [gridTotalPages, setGridTotalPages] = useState<number>(1);

	// Variables
	const statusOptions = [
		{value: '1', label: 'Active'},
		{value: '2', label: 'Inactive'},
	];
	const defaultLanguageValue = 'English (United States)';
	const customPageSizeElementId = 'create-subtopic';

	// Hooks
	const {getLanguageOptions, languageOptions} = useSystemOptionHooks();
	const {getTopicOptions, topicOptions} = useSystemHooks();
	const {SwalConfirmMessage, SwalFailedMessage, SwalSuccessRecordMessage, successResponse, HubConnected, message} = useConstant();
	const ArrayObjOptionLanguange = languageOptions.filter(({id}) => !rowData.some(({languageId}) => languageId === id));
	const languageOptionList = ArrayObjOptionLanguange.filter((x) => x.isComplete === true).flatMap((x) => [
		{label: x.languageName, value: x.id?.toString()},
	]);

	usePromptOnUnload(true, 'Changes you made may not be saved.');

	const currencyOptions = useCurrencies();
	// Mounted
	useEffect(() => {
		if (showForm) {
			_clearForm();
			_getSubtopicById();
			getLanguageOptions();
		}
	}, [showForm]);

	useEffect(() => {
		if (topicOptions.length === 0) {
			getTopicOptions();
		}
	}, [topicOptions]);

	useEffect(() => {
		if (showForm && subtopicData) {
			let topicTempList = Array<any>();
			let currencyTempList = Array<CurrencyOptions>();

			if (subtopicData != undefined) {
				//	Assign multi select dropdown values
				let topicData = Object.assign(new Array<TopicRowsModel>(), subtopicData.subtopicTopicList);
				let currencyData = Object.assign(new Array<CurrencyRowsModel>(), subtopicData.subtopicCurrencyList);

				// map data in dropdown
				topicData.forEach((topic: TopicRowsModel) => {
					const topicOption = topicOptions
						.filter((obj) => obj.topicId === topic.topicId)
						.map((x) => {
							return {
								label: x.topicName + '(' + x.caseTypeName + ')',
								value: x.topicId.toString(),
							};
						});
					topicTempList.push(...topicOption);
				});

				setSelectedTopics(topicTempList);

				currencyData.forEach((currency: CurrencyRowsModel) => {
					const currencyOpt: CurrencyOptions = {
						value: currency.currencyId.toString(),
						label: currency.currencyName,
					};
					currencyTempList.push(currencyOpt);
				});

				setSelectedCurrencies(currencyTempList);

				if (subtopicData.subtopicDetails) {
					let subTopicStatus = subtopicData.subtopicDetails.isActive ? {value: '1', label: 'Active'} : {value: '2', label: 'Inactive'};
					setSelectedStatuses(subTopicStatus);
					setSubtopicNameInput(subtopicData.subtopicDetails.subtopicName);
				}
			}
		}
	}, [subtopicData]);

	const _getSubtopicById = () => {
		setTimeout(() => {
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						const getSubtopicByIdRequest: GetSubtopicById = {
							queueId: Guid.create().toString(),
							userId: userId?.toString() ?? '0',
							subtopicId: data.data.subtopicId,
						};
						_getSubtopicByIdGateway(getSubtopicByIdRequest);
					} else {
						swal('Failed', 'Problem connecting to the server, Please refresh', 'error').catch(() => {});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const _getSubtopicByIdGateway = (_request: GetSubtopicById) => {
		sendGetSubtopicById(_request)
			.then((response) => {
				if (response.status === successResponse) {
					messagingHub.on(_request.queueId.toString(), (message) => {
						getSubtopicById(message.cacheId)
							.then((data) => {
								setSubtopicData(data.data);
								setRowData(data.data.subtopicLanguageList);
							})
							.catch(() => {});
						_messageHubClose(_request.queueId.toString())
					});
				} else {
					
					_messageHubClose();
					swal('Failed', response.data.message, 'error').catch(() => {});
				}
			})
			.catch(() => {
				_messageHubClose();
				swal('Failed', 'Problem in getting topic by Id details', 'error').catch(() => {});
			});
	};

	const _messageHubClose = (_queueId?: any) => {
		if (_queueId) {
			messagingHub.off(_queueId);
			messagingHub.stop().catch(() => {});
		}
		else {
			messagingHub.stop().catch(() => {});
		}
	}

	// Form post
	const formik = useFormik({
		initialValues,
		validationSchema: createSubtopicSchema,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {
			setSubmitting(true);

			const isError = _validateForm(subtopicNameInput);

			if (isError === false) {
				validatedSubtopicName({subtopicName: subtopicNameInput, subtopicId: data.data.subtopicId})
					.then((response) => {
						if (response.status === successResponse) {
							if (response.data === true) {
								swal(SwalFailedMessage.title, SwalFailedMessage.textSubtopicExists, SwalFailedMessage.icon).catch(() => {});
							} else {
								swal({
									title: SwalConfirmMessage.title,
									text: message.genericSaveConfirmation,
									icon: SwalConfirmMessage.icon,
									buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
									dangerMode: true,
								})
									.then((onConfirm) => {
										if (onConfirm) {
											setSubmitting(true);
											saveUpdatedSubtopicDetails();
											search();
										}
									})
									.catch(() => {});
							}
						}
					})
					.catch(() => {
						swal(SwalFailedMessage.title, 'Connection error Please close the form and try again', SwalFailedMessage.icon).catch(() => {});
					});
			}
			setSubmitting(false);
		},
	});

	async function saveUpdatedSubtopicDetailsRequest() {
		const request: SubtopicNewRequestModel = {
			subtopicId: data.data.subtopicId,
			queueId: Guid.create().toString(),
			userId: userId ? userId.toString() : '0',
			subtopicName: subtopicNameInput,
			isActive: selectedStatuses.value === '1' ? true : false,
			position: subtopicData ? subtopicData.subtopicDetails.position : 0,
			subtopicCurrencyList: selectedCurrencies.map((c: CurrencyOptions) => {
				return {
					subtopicId: data.data.subtopicId,
					currencyId: parseInt(c.value),
				};
			}),
			subtopicTopicList: selectedTopics.map((t: TopicOptions) => {
				return {
					subtopicId: data.data.subtopicId,
					topicId: parseInt(t.value),
				};
			}),
			subtopicLanguageList: rowData,
		};

		return request;
	}

	const saveUpdatedSubtopicDetails = () => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(async () => {
					if (messagingHub.state === HubConnected) {
						const _subtopicUpdaterequest = await saveUpdatedSubtopicDetailsRequest();
						upsertSubtopic(_subtopicUpdaterequest)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(_subtopicUpdaterequest.queueId.toString(), (message) => {
										let resultData = JSON.parse(message.remarks);
										if (resultData.Status === successResponse) {
											swal(SwalSuccessRecordMessage.title, SwalSuccessRecordMessage.textSuccess, SwalSuccessRecordMessage.icon).catch(() => {});
											setModalShow(false);
										}
										messagingHub.off(_subtopicUpdaterequest.queueId.toString());
										messagingHub.stop().catch(() => {});
									});
								}
							})
							.catch(() => {
								messagingHub.stop().catch(() => {});
								swal('Failed', 'Problem in adding subtopic details', 'error').catch(() => {});
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	// METHOD
	const onChangeSelectedStatuesEditSubtopic = (val: string) => {
		setSelectedStatuses(val);
	};

	const onChangeSelectedTopicsEditSubtopic = (val: Array<TopicOptions>) => {
		setSelectedTopics(val);
	};
	const onChangeSelectedCurrencies = (val: Array<CurrencyOptions>) => {
		setSelectedCurrencies(val);
	};

	const _validateForm = (subtopicName: string) => {
		let isError: boolean = false;
		// -- VALIDATE EMPTY FIELDS REQUIRED -- //
		if (
			selectedTopics.map((x: TopicOptions) => x.label).toString() === '' ||
			selectedCurrencies.map((x: CurrencyOptions) => x.label).toString() === '' ||
			selectedStatuses.value === undefined ||
			!subtopicName
		) {
			swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon).catch(() => {});
			isError = true;
		}

		return isError;
	};

	const _clearForm = () => {
		formik.resetForm();
		setSelectedStatuses([]);
		setSelectedTopics([]);
		setSelectedCurrencies([]);
		formik.setSubmitting(false);
		setRowData([]);
		setLanguage('');
		setLanguageTranslation('');
		setIsUpdateLanguage(false);
		setSubtopicNameInput('');
		setSubtopicData(undefined);
	};

	const onEditLanguage = (data: SubtopicLanguageModel) => {
		setIsUpdateLanguage(true);
		const {subtopicId, subtopicLanguageId, languageId, languageName, subtopicLanguageTranslation} = data;
		setLanguage({value: languageId, label: languageName});
		setLanguageTranslation(subtopicLanguageTranslation);
		setSelectedSubtopicLanguageId(subtopicLanguageId);
	};

	const onRemoveLanguage = (data: SubtopicLanguageModel) => {
		swal({
			title: 'Confirmation',
			text: 'Language translation will be removed, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		})
			.then((onConfirm) => {
				if (onConfirm) {
					const filterLanguage = rowData.filter((x) => x !== data);
					setRowData(filterLanguage);
				}
			})
			.catch(() => {});
	};

	/**
	 *  ? Local Components
	 */
	const renderEditSubtopicActions = (_props: any) => (
		<>
			{_props.data && _props.data.languageName.toLowerCase() !== defaultLanguageValue.toLocaleLowerCase() ? (
				<div className='d-flex justify-content-center flex-shrink-0'>
					<div className='me-6'>
						<TableIconButton
							access={true}
							faIcon={faPencilAlt}
							isDisable={false}
							toolTipText={'Edit'}
							onClick={() => {
								onEditLanguage(_props.data);
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
								onRemoveLanguage(_props.data);
							}}
						/>
					</div>
				</div>
			) : null}
		</>
	);

	const renderEditSubtopicRowIndex = (_props: any) => <>{_props ? <div>{_props.rowIndex + 1}</div> : null}</>;

	//	Table/Grid
	const editSubtopicColumnDefs = [
		{
			headerName: 'No',
			field: 'subtopicLanguageId',
			width: 80,
			sortable: false,
			cellRenderer: renderEditSubtopicRowIndex,
		},
		{headerName: 'Language', field: 'languageName', sortable: true},
		{headerName: 'Local Character Translation', field: 'subtopicLanguageTranslation', width: 300, sortable: true},
		{
			headerName: 'Action',
			field: 'subtopicLanguageId',
			width: 150,
			cellRenderer: renderEditSubtopicActions,
		},
	];

	//	Pagination

	const onGridReady = (params: any) => {
		params.api.paginationGoToPage(1);
		params.api.sizeColumnsToFit();
	};

	const onPaginationChanged = useCallback(() => {
		if (gridRef.current.api) {
			//new implem
			setGridPageSize(gridRef.current.api.paginationGetPageSize());
			setGridCurrentPage(gridRef.current.api.paginationGetCurrentPage() + 1);
			setGridTotalPages(gridRef.current.api.paginationGetTotalPages());
		}
	}, []);

	const onChangeLanguage = (val: any) => {
		setLanguage(val);
	};

	const handleAddLanguage = () => {
		const {label, value} = language;
		if (!value || !label || !languageTranslation || !subtopicNameInput) {
			swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon).catch(() => {});
		} else {
			const languageDetails: SubtopicLanguageModel = {
				subtopicId: data.data.subtopicId,
				subtopicLanguageId: 0,
				languageId: parseInt(language.value),
				languageName: language.label,
				subtopicLanguageTranslation: languageTranslation,
			};

			setRowData([...rowData, languageDetails]);
			setLanguage(null);
			setLanguageTranslation('');
		}
	};

	const handleUpdateLanguage = () => {
		const {label, value} = language;

		const request: SubtopicLanguageModel = {
			subtopicId: 0,
			subtopicLanguageId: selectedSubtopicLanguageId,
			languageId: parseInt(value),
			languageName: label,
			subtopicLanguageTranslation: languageTranslation,
		};

		swal({
			title: 'Confirmation',
			text: 'This action will update language selected, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		})
			.then((OnhandleUpdateLanguageClosePage) => {
				if (OnhandleUpdateLanguageClosePage) {
					let removeSubtopicToEditDataObj = rowData.filter((filteredSubtopic) => filteredSubtopic.languageId !== parseInt(value));
					setRowData([...removeSubtopicToEditDataObj, request]);
					setIsUpdateLanguage(false);
					setLanguage('');
					setLanguageTranslation('');
					setSelectedSubtopicLanguageId(null);
				} else {
					setIsUpdateLanguage(false);
					setLanguage('');
					setLanguageTranslation('');
					setSelectedSubtopicLanguageId(null);
				}
			})
			.catch(() => {});
	};

	const onChangeSubtopicName = (val: string) => {
		setSubtopicNameInput(val);

		// validation for show/hide subtopic name language
		if (val.trim() === '') {
			setDisableLanguage(true);
		} else {
			setDisableLanguage(false);
		}

		const filterData = rowData.filter((x) => x.languageName.toLocaleLowerCase() !== defaultLanguageValue.toLocaleLowerCase());

		const updatedList = rowData
			.filter((x) => x.languageName.toLocaleLowerCase() === defaultLanguageValue.toLocaleLowerCase())
			.map((lang: SubtopicLanguageModel) => {
				return {
					subtopicId: lang.subtopicId,
					languageId: lang.languageId,
					languageName: lang.languageName,
					subtopicLanguageTranslation: val,
					subtopicLanguageId: lang.subtopicLanguageId,
				};
			});

		if (updatedList.length > 0) {
			setRowData([updatedList[0], ...filterData]);
		}
	};

	return (
		<FormModal headerTitle={'Edit Subtopic'} haveFooter={false} show={showForm}>
			<FormContainer onSubmit={formik.handleSubmit}>
				{!subtopicData && <CodelistLoading />}

				{subtopicData && (
					<>
						<FormGroupContainer>
							<div className='col-lg-8'>
								<RequiredLabel title={'Subtopic Name'} />
								<input
									type='text'
									autoComplete='off'
									className='form-control form-control-sm'
									value={subtopicNameInput}
									onChange={(e) => onChangeSubtopicName(e.target.value)}
								/>
							</div>
							<div className='col-lg-4'>
								<RequiredLabel title={'Status'} />
								<Select
									{...formik.getFieldProps('subTopicStatus')}
									native
									size='small'
									style={{width: '100%'}}
									options={statusOptions}
									onChange={onChangeSelectedStatuesEditSubtopic}
									value={selectedStatuses}
								/>
							</div>
						</FormGroupContainer>

						<FormGroupContainer>
							<div className='col-lg-12'>
								<RequiredLabel title={'Included to Topic'} />
								<Select
									isMulti
									options={topicOptions.flatMap((obj) => [
										{
											label: obj.topicName + '(' + obj.caseTypeName + ')',
											value: obj.topicId,
										},
									]).filter((option) => !selectedTopics.some((selected) => selected?.value.toString() === option?.value.toString()))}
									onChange={onChangeSelectedTopicsEditSubtopic}
									value={selectedTopics}
									defaultValue={defaultTopics}
								/>
							</div>
						</FormGroupContainer>
						<FormGroupContainer>
							<div className='col-lg-12'>
								<RequiredLabel title={'Currency'} />
								<Select isMulti options={currencyOptions} onChange={onChangeSelectedCurrencies} value={selectedCurrencies} />
							</div>
						</FormGroupContainer>
						<div className='separator separator-dashed my-5' />
						<SubtopicLangunageInfoMessage isDisable={disableLanguage} languageInstructionStyle={languageInstructionStyle} />

						<FormGroupContainer>
							<div className='col-lg-5'>
								<BasicFieldLabel title={'Select Language'} />
								<Select
									style={{width: '100%'}}
									options={[{label: 'Select...', value: ''}, ...languageOptionList]}
									isDisabled={isUpdateLanguage}
									onChange={onChangeLanguage}
									value={language}
								/>
							</div>

							<div className='col-lg-7'>
								<BasicFieldLabel title={'Local Character Translation'} />
								<input
									className='form-control form-control-sm'
									disabled={false}
									value={languageTranslation}
									onChange={(e) => setLanguageTranslation(e.target.value)}
								/>
							</div>
						</FormGroupContainer>
						{isUpdateLanguage ? (
							<ButtonsContainer>
								<MlabButton
									type={'button'}
									access={true}
									size={'sm'}
									label={'Update Language'}
									additionalClassStyle={{marginRight: 0}}
									style={ElementStyle.primary}
									weight={'solid'}
									onClick={handleUpdateLanguage}
								/>
							</ButtonsContainer>
						) : (
							<ButtonsContainer>
								<MlabButton
									type={'button'}
									access={true}
									size={'sm'}
									label={'Add Language'}
									additionalClassStyle={{marginRight: 0}}
									style={ElementStyle.primary}
									weight={'solid'}
									onClick={handleAddLanguage}
								/>
							</ButtonsContainer>
						)}

						<FormGroupContainer>
							<div className='ag-theme-quartz mb-13' style={{height: 300, width: '100%'}}>
								<AgGridReact
									rowData={rowData}
									defaultColDef={{
										sortable: true,
										resizable: true,
									}}
									onGridReady={onGridReady}
									rowBuffer={0}
									enableRangeSelection={true}
									onPaginationChanged={onPaginationChanged}
									columnDefs={editSubtopicColumnDefs}
									ref={gridRef}
									paginationPageSize={gridPageSize}
									pagination={true}
									suppressPaginationPanel={true}
									suppressScrollOnNewData={true}
								/>
								<LocalGridPagination
									setGridPageSize={setGridPageSize}
									recordCount={rowData.length}
									gridCurrentPage={gridCurrentPage}
									gridPageSize={gridPageSize}
									gridTotalPages={gridTotalPages}
									gridRef={gridRef}
									customId={customPageSizeElementId} //page-size-create-subtopic | optional, for page that has more than one grid with page size selection
								/>
							</div>
						</FormGroupContainer>

						<ModalFooter style={{border: 0, paddingRight: 0}}>
							<LoaderButton
								loadingTitle={'Please wait ...'}
								title={'Submit'}
								access={true}
								disabled={formik.isSubmitting}
								loading={formik.isSubmitting}
							/>
							<MlabButton
								access={true}
								type={'button'}
								size={'sm'}
								label={'Close'}
								weight={'solid'}
								onClick={() => {
									closeModal();
								}}
								additionalClassStyle={{marginRight: 0}}
								style={ElementStyle.secondary}
							/>
						</ModalFooter>
					</>
				)}
			</FormContainer>
		</FormModal>
	);
};

export default EditSubtopic;
