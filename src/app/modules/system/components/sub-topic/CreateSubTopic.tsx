import {faPencilAlt, faTrash} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';
import {useFormik} from 'formik';
import {Guid} from 'guid-typescript';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ModalFooter} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {ElementStyle} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
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
import {IAuthState} from '../../../auth/redux/AuthRedux';
import {BrandOptions, CurrencyOptions, SubtopicLanguageModel, TopicOptions} from '../../models';
import {SubtopicNewRequestModel} from '../../models/subtopic/requests/SubtopicNewRequestModel';
import {upsertSubtopic, validatedSubtopicName} from '../../redux/SystemService';
import {useSystemOptionHooks} from '../../shared';
import SubtopicLangunageInfoMessage from './SubtopicLangunageInfoMessage';

// -- INTERFACES -- //
interface Props {
	showForm: boolean;
	closeModal: () => void;
	setModalShow: any;
}

// -- INITIAL VALUES OF FORM --//
const initialValues = {
	subTopicName: '',
	subTopicStatus: '',
	topics: Array<TopicOptions>(),
	brands: Array<BrandOptions>(),
	currencies: Array<CurrencyOptions>(),
};

//	Styles
const languageInstructionStyle = {
	fontStyle: 'italic',
	color: '#818181',
	fontSize: '12px',
};

const CreateSubTopic: React.FC<Props> = ({showForm, closeModal, setModalShow}) => {
	//  Get redux store
	const {userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const gridRef: any = useRef();

	//   Variables
	const defaultLanguageValue = 'English (United States)';

	//  States
	const [selectedStatuses, setSelectedStatuses] = useState<string | any>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [rowData, setRowData] = useState<Array<any>>([]);
	const [subtopicNameInput, setSubtopicNameInput] = useState<string>('');
	const [disableLanguage, setDisableLanguage] = useState<boolean>(false);

	//	Language
	const [language, setLanguage] = useState<any>('');
	const [languageTranslation, setLanguageTranslation] = useState<string>('');
	const [isUpdateLanguage, setIsUpdateLanguage] = useState<boolean>(false);

	// selected values
	const [selectedTopics, setSelectedTopics] = useState<Array<TopicOptions>>([]);
	const [selectedCurrencies, setSelectedCurrencies] = useState<Array<CurrencyOptions>>([]);

	const statusOptions = [
		{value: '1', label: 'Active'},
		{value: '2', label: 'Inactive'},
	];

	//	Pagination
	const [gridPageSize, setGridPageSize] = useState<number>(10);
	const [gridCurrentPage, setGridCurrentPage] = useState<number>(1);
	const [gridTotalPages, setGridTotalPages] = useState<number>(1);

	// Hooks
	const {getLanguageOptions, languageOptions, isLanguageLoading} = useSystemOptionHooks();
	const {getTopicOptions, topicOptions} = useSystemHooks();

	const {SwalConfirmMessage, SwalFailedMessage, SwalSuccessRecordMessage, successResponse, HubConnected} = useConstant();

	usePromptOnUnload(true, 'Changes you made may not be saved.');

	//variables
	const ArrayObjOptionLanguange = languageOptions.filter(({id}) => !rowData.some(({languageId}) => languageId === id));
	const languageOptionList = ArrayObjOptionLanguange.filter((x) => x.isComplete === true).flatMap((x) => [
		{label: x.languageName, value: x.id?.toString()},
	]);
	const customPageSizeElementId = 'create-subtopic';

	//   Watcher
	useEffect(() => {
		if (showForm) {
			_clearForm();
			getLanguageOptions();
			getTopicOptions();
			addDefaultLanguage();
		}
	}, [showForm]);

	useEffect(() => {
		if (languageOptions.length !== 0) addDefaultLanguage();
	}, [languageOptions]);

	useEffect(() => {
		if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
			(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
		}
	}, [loading]);

	// Methods
	const addDefaultLanguage = () => {
		let _languageId = languageOptions.find((x) => x.languageName.toLocaleLowerCase() === defaultLanguageValue.toLocaleLowerCase())?.id || 0;

		const request: SubtopicLanguageModel = {
			subtopicId: 0,
			subtopicLanguageId: 0,
			languageId: _languageId,
			languageName: defaultLanguageValue,
			subtopicLanguageTranslation: subtopicNameInput,
			createdBy: userId ? parseInt(userId) : 0,
			updatedBy: userId ? parseInt(userId) : 0,
		};

		setRowData([request]);
	};

	const validateSubtopicName = () => {
		validatedSubtopicName({subtopicName: subtopicNameInput, subtopicId: 0})
			.then((response) => {
				if (response.status === successResponse) {
					if (response.data === true) {
						swal(SwalFailedMessage.title, SwalFailedMessage.textSubtopicExists, SwalFailedMessage.icon).catch(() => {});
					} else {
						// new saving implementation
						swal({
							title: SwalConfirmMessage.title,
							text: SwalConfirmMessage.textSaveSubtopic,
							icon: SwalConfirmMessage.icon,
							buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
							dangerMode: true,
						})
							.then((onConfirm) => {
								if (onConfirm) {
									saveSubtopicDetails();
								}
							})
							.catch(() => {});
					}
				} else {
					swal(SwalFailedMessage.title, 'Connection error Please close the form and try again', SwalFailedMessage.icon).catch(() => {});
				}
			})
			.catch(() => {
				swal(SwalFailedMessage.title, 'Connection error Please close the form and try again', SwalFailedMessage.icon).catch(() => {});
			});
	};

	//  Formik form post
	const formik = useFormik({
		initialValues,
		onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {
			setSubmitting(true);
			let isError = _validateForm(subtopicNameInput);

			if (isError === false) {
				validateSubtopicName();
			}

			setSubmitting(false);
		},
	});

	async function saveSubtopicDetailsRequest() {
		const request: SubtopicNewRequestModel = {
			subtopicId: 0,
			queueId: Guid.create().toString(),
			userId: userId ? userId.toString() : '0',
			subtopicName: subtopicNameInput,
			isActive: selectedStatuses.value === '1' ? true : false,
			position: 0,
			subtopicCurrencyList: selectedCurrencies.map((curr) => {
				return {
					subtopicId: 0,
					currencyId: parseInt(curr.value),
				};
			}),
			subtopicTopicList: selectedTopics.map((topic) => {
				return {
					subtopicId: 0,
					topicId: parseInt(topic.value),
				};
			}),
			subtopicLanguageList: rowData,
		};

		return request;
	}


	const saveSubtopicDetails = () => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(async () => {
					if (messagingHub.state === HubConnected) {
						const reqSubtopic = await saveSubtopicDetailsRequest();

						upsertSubtopic(reqSubtopic)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(reqSubtopic.queueId.toString(), (message) => {
										let resultData = JSON.parse(message.remarks);
										if (resultData.Status === successResponse) {
											swal(SwalSuccessRecordMessage.title, SwalSuccessRecordMessage.textSuccess, SwalSuccessRecordMessage.icon).catch(() => {});

											setModalShow(false);
										}
										messagingHub.off(reqSubtopic.queueId.toString());
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

	//   Method
	const onChangeSelectedStatues = (val: string) => {
		setSelectedStatuses(val);
	};

	const onChangeSelectedTopics = (val: Array<TopicOptions>) => {
		setSelectedTopics(val);
	};

	const onChangeSelectedCurrencies = (val: Array<CurrencyOptions>) => {
		setSelectedCurrencies(val);
	};

	const _validateForm = (subTopicName: string) => {
		let isError: boolean = false;
		if (
			selectedTopics.map((x: TopicOptions) => x.label).toString() === '' ||
			selectedCurrencies.map((x: CurrencyOptions) => x.label).toString() === '' ||
			subTopicName === '' ||
			selectedStatuses.value === undefined
		) {
			isError = true;
			swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon).catch(() => {});
		}

		return isError;
	};

	const _clearForm = () => {
		formik.resetForm();
		setSelectedStatuses([]);
		setSelectedTopics([]);
		setSelectedCurrencies([]);
		formik.setSubmitting(false);
		setLoading(false);
		setRowData([]);
		setSubtopicNameInput('');
		setLanguage('');
		setLanguageTranslation('');
		setIsUpdateLanguage(false);
		setDisableLanguage(true);
	};

	const onChangeLanguage = (val: any) => {
		setLanguage(val);
	};

	const onEditLanguage = (data: SubtopicLanguageModel) => {
		setIsUpdateLanguage(true);
		const {subtopicId, subtopicLanguageId, languageId, languageName, subtopicLanguageTranslation} = data;
		setLanguage({value: languageId, label: languageName});
		setLanguageTranslation(subtopicLanguageTranslation);
	};

	//	Table/Grid
	const columnDefs = [
		{
			headerName: 'No',
			width: 80,
			sortable: false,
			valueGetter: (params: any) => {
				const rowIndex = params.node?.rowIndex ?? -1; // Default to -1 if undefined
				return rowIndex >= 0 ? rowIndex + 1 : null; // Return ID if rowIndex is valid
			  },
		},
		{headerName: 'Language', field: 'languageName', sortable: true},
		{headerName: 'Local Character Translation', field: 'subtopicLanguageTranslation', width: 300, sortable: true},
		{
			headerName: 'Action',
			width: 150,
			sortable: false,
			cellRenderer: (params: any) => (
				<>
					{params.data && params.data.languageName.toLowerCase() !== 'english (united states)' ? (
						<div className='d-flex justify-content-center flex-shrink-0'>
							<div className='me-6'>
								<TableIconButton
									access={true}
									faIcon={faPencilAlt}
									isDisable={false}
									toolTipText={'Edit'}
									onClick={() => {
										onEditLanguage(params.data);
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
										onRemoveLanguage(params.data);
									}}
								/>
							</div>
						</div>
					) : null}
				</>
			),
		},
	];

	const onGridReady = (params: any) => {
		params.api.paginationGoToPage(1);
		params.api.sizeColumnsToFit();
	};

	const handleAddLanguage = () => {
		const {label, value} = language;
		if (!language || !value || !label || !languageTranslation || !subtopicNameInput) {
			swal(SwalFailedMessage.title, SwalFailedMessage.textMandatory, SwalFailedMessage.icon).catch(() => {});
		} else {
			const languageDetails: SubtopicLanguageModel = {
				subtopicId: 0,
				subtopicLanguageId: 0,
				languageId: parseInt(language.value),
				languageName: language.label,
				subtopicLanguageTranslation: languageTranslation,
				createdBy: userId ? parseInt(userId) : 0,
				updatedBy: 0,
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
			subtopicLanguageId: 0,
			languageId: parseInt(value),
			languageName: label,
			subtopicLanguageTranslation: languageTranslation,
		};

		swal({
			title: 'Confirmation',
			text: 'This action will update language selected, please confirm',
			icon: 'warning',
			dangerMode: true,
			buttons: ['No', 'Yes'],
		})
			.then((onClosePage) => {
				if (onClosePage) {
					let removeToEditData = rowData.filter((x) => x.languageId !== parseInt(value));
					setIsUpdateLanguage(false);
					setRowData([...removeToEditData, request]);
					setLanguage('');
					setLanguageTranslation('');
				} else {
					setIsUpdateLanguage(false);
					setLanguage('');
					setLanguageTranslation('');
				}
			})
			.catch(() => {});
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

	const onChangeSubtopicName = (val: string) => {
		setSubtopicNameInput(val);

		// validation for show/hide subtopic name language
		if (val.trim() === '') {
			setDisableLanguage(true);
		} else {
			setDisableLanguage(false);
		}
		let filterData = rowData.filter((x) => x.languageName.toLocaleLowerCase() !== defaultLanguageValue.toLocaleLowerCase());

		let _languageId = languageOptions.find((x) => x.languageName.toLocaleLowerCase() === defaultLanguageValue.toLocaleLowerCase())?.id || 0;

		const request: SubtopicLanguageModel = {
			subtopicId: 0,
			subtopicLanguageId: 0,
			languageId: _languageId,
			languageName: languageOptions.find((x) => x.languageName.toLocaleLowerCase() === defaultLanguageValue.toLocaleLowerCase())?.languageName || '',
			subtopicLanguageTranslation: val,
			createdBy: userId ? parseInt(userId) : 0,
			updatedBy: 0,
		};

		setRowData([request, ...filterData]);
	};

	//new pagination
	const onPaginationChanged = useCallback(() => {
		if (gridRef.current.api) {
			//new implem
			setGridPageSize(gridRef.current.api.paginationGetPageSize());
			setGridCurrentPage(gridRef.current.api.paginationGetCurrentPage() + 1);
			setGridTotalPages(gridRef.current.api.paginationGetTotalPages());
		}
	}, []);

	return (
		<FormModal headerTitle={'Add Subtopic'} haveFooter={false} show={showForm}>
			<FormContainer onSubmit={formik.handleSubmit}>
				<FormGroupContainer>
					<div className='col-lg-8'>
						<RequiredLabel title={'Subtopic Name'} />
						<input
							type='text'
							autoComplete='off'
							className='form-control form-control-sm'
							id='subtopicName'
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
							onChange={onChangeSelectedStatues}
							value={selectedStatuses}
						/>
					</div>
				</FormGroupContainer>

				<FormGroupContainer>
					<div className='col-lg-12'>
						<RequiredLabel title={'Included to Topic'} />
						<Select
							{...formik.getFieldProps('topics')}
							isMulti
							options={topicOptions.flatMap((obj) => [
								{
									label: obj.topicName + '(' + obj.caseTypeName + ')',
									value: obj.topicId,
								},
							]).filter((option) => !selectedTopics.some((selected) => selected?.value.toString() === option?.value.toString()))}
							onChange={onChangeSelectedTopics}
							value={selectedTopics}
						/>
					</div>
				</FormGroupContainer>
				<FormGroupContainer>
					<div className='col-lg-12'>
						<RequiredLabel title={'Currency'} />
						<Select
							{...formik.getFieldProps('currencies')}
							isMulti
							options={useCurrencies()}
							onChange={onChangeSelectedCurrencies}
							value={selectedCurrencies}
						/>
					</div>
				</FormGroupContainer>
				<div className='separator separator-dashed my-5' />
				<SubtopicLangunageInfoMessage isDisable={disableLanguage} languageInstructionStyle={languageInstructionStyle} />

				<FormGroupContainer>
					<div className='col-lg-5'>
						<BasicFieldLabel title={'Select Language'} />
						<Select
							size='small'
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
							value={languageTranslation}
							disabled={false}
							onChange={(e) => setLanguageTranslation(e.target.value)}
						/>
					</div>
				</FormGroupContainer>

				{isUpdateLanguage ? (
					<ButtonsContainer>
						<MlabButton
							access={true}
							type={'button'}
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
							disabled={disableLanguage}
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
							onPaginationChanged={onPaginationChanged}
							enableRangeSelection={true}
							columnDefs={columnDefs}
							ref={gridRef}
							paginationPageSize={gridPageSize}
							pagination={true}
							suppressPaginationPanel={true}
							suppressScrollOnNewData={true}
						/>
						<LocalGridPagination
							gridRef={gridRef}
							recordCount={rowData.length}
							gridCurrentPage={gridCurrentPage}
							gridPageSize={gridPageSize}
							setGridPageSize={setGridPageSize}
							gridTotalPages={gridTotalPages}
							customId={customPageSizeElementId} //page-size-create-subtopic | optional, for page that has more than one grid with page size selection
						/>
					</div>
				</FormGroupContainer>
				<ModalFooter style={{border: 0, paddingRight: 0}}>
					<LoaderButton
						access={true}
						title={'Submit'}						
						loadingTitle={'Please wait ...'}
						loading={formik.isSubmitting}
						disabled={formik.isSubmitting}
					/>
					<MlabButton
						access={true}
						type={'button'}
						size={'sm'}
						label={'Close'}
						weight={'solid'}
						additionalClassStyle={{marginRight: 0}}
						style={ElementStyle.secondary}
						onClick={() => {
							closeModal();
							setLoading(false);
						}}
					/>
				</ModalFooter>
			</FormContainer>
		</FormModal>
	);
};

export default CreateSubTopic;
