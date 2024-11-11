import {faPencilAlt, faTrash} from '@fortawesome/free-solid-svg-icons';
import {AgGridReact} from 'ag-grid-react';

import {Guid} from 'guid-typescript';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ButtonGroup, Col, ModalFooter, Row} from 'react-bootstrap-v5';
import {shallowEqual, useSelector} from 'react-redux';
import Select from 'react-select';
import swal from 'sweetalert';
import {RootState} from '../../../../../setup';
import * as hubConnection from '../../../../../setup/hub/MessagingHub';
import {OptionListModel} from '../../../../common/model';
import {ElementStyle} from '../../../../constants/Constants';
import useConstant from '../../../../constants/useConstant';
import {
	BasicFieldLabel,
	BasicTextInput,
	FormModal,
	LocalGridPagination,
	MainContainer,
	MlabButton,
	RequiredLabel,
	TableIconButton,
} from '../../../../custom-components';
import {IAuthState} from '../../../auth';
import {USER_CLAIMS} from '../../../user-management/components/constants/UserClaims';
import {TopicLanguageUdtModel, UpSertTopicRequestModel} from '../../models';
import {SendUpSertTopic, sendTopicName} from '../../redux/SystemService';
import {useSystemOptionHooks} from '../../shared';
import LangunageInfoMessage from './LangunageInfoMessage';
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface Props {
	showForm: boolean;
	setModalShow: (e: boolean) => void;
}

const languageInstructionStyle = {
	fontStyle: 'italic',
	color: '#818181',
	fontSize: '12px',
};

const CreateTopic: React.FC<Props> = ({showForm, setModalShow}) => {
	/**
	 *  ? Redux
	 */
	const {access, userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;

	/**
	 *  ? States
	 */

	const [caseType, setCaseType] = useState<any>('');
	const [brand, setBrand] = useState<any>('');
	const [currency, setCurrency] = useState<any>('');
	const [topicName, setTopicName] = useState<string>('');
	const [selectedStatuses, setSelectedStatuses] = useState<string | any>('');

	const [language, setLanguage] = useState<any>('');
	const [languageTranslation, setLanguageTranslation] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [isUpdateLanguage, setIsUpdateLanguage] = useState<boolean>(false);
	const [rowData, setRowData] = useState<Array<TopicLanguageUdtModel>>([]);
	const [disableLanguage, setDisableLanguage] = useState<boolean>(false);

	const [gridPageSize, setGridPageSize] = useState<number>(10);
	const [gridCurrentPage, setGridCurrentPage] = useState<number>(1);
	const [gridTotalPages, setGridTotalPages] = useState<number>(1);

	const {
		getCaseTypeOptions,
		caseTypeOptionList,
		brandOptionList,
		isCaseTypeLoading,
		getBrandOptions,
		isBrandLoading,
		getCurrencyOptions,
		isCurrencyLoading,
		currencyOptionList,
		getLanguageOptions,
		languageOptions,
	} = useSystemOptionHooks();

	const statusOptions = [
		{value: '1', label: 'Active'},
		{value: '2', label: 'Inactive'},
	];
	const gridRef: any = useRef();

	const {successResponse, message, HubConnected,SwalConfirmMessage} = useConstant();
	const ArrayObjOptionLanguange = languageOptions.filter(({id: id}) => !rowData.some(({languageId: languageId}) => languageId === id));
	const ref: any = useRef();
	const customPageSizeElementId = 'create-topic';

	/**
	 *  ? Mounted
	 */
	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	useEffect(() => {
		if (showForm) {
			setRowData([]);
			getCaseTypeOptions();
			getBrandOptions();
			getCurrencyOptions();
			getLanguageOptions();
		}
	}, [showForm]);

	/**
	 *  ? Watchers
	 */

	useEffect(() => {
		if (languageOptions.length !== 0) addDefautLanguage();
	}, [languageOptions]);

	useEffect(() => {
		if (topicName.trim() === '') {
			setDisableLanguage(true);
		} else {
			setDisableLanguage(false);
		}
	}, [topicName]);

	useEffect(() => {
		if (document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement) {
			(document.getElementById('mlab-grid-loading-overlay') as HTMLInputElement).innerText = 'No Rows To Show';
		}
	}, []);

	/**
	 *  ? Events
	 */

	const onChangeSelectedStatues = (val: any) => {
		setSelectedStatuses(val);
	};

	const onChangeBrand = (val: any) => {
		setBrand(val);
	};

	const onChangeLanguage = (val: any) => {
		setLanguage(val);
	};

	const onChangeCaseType = (val: any) => {
		setCaseType(val);
	};

	const onChangeCurrency = (val: any) => {
		setCurrency(val);
	};
	
	const onChangeTopicName = (_topicName: string) => {
		setTopicName(_topicName);

		let filterLanguageData = rowData.filter((x) => x.languageName?.toLocaleLowerCase() !== 'english (united states)');

		let _languageId = languageOptions.find((x) => x.languageName.toLocaleLowerCase() === 'english (united states)')?.id || 0;

		const request: TopicLanguageUdtModel = {
			topicId: 0,
			topicLanguageId: 0,
			languageId: _languageId,
			languageName: languageOptions.find((x) => x.languageName.toLocaleLowerCase() === 'english (united states)')?.languageName || '',
			topicLanguageTranslation: _topicName,
		};

		setRowData([request, ...filterLanguageData]);
	};

	/**
	 *  ? Pagination Methods
	 */

	const onPaginationChanged = useCallback(() => {
		if (gridRef.current.api) {
			//new implem
			setGridPageSize(gridRef.current.api.paginationGetPageSize());
			setGridCurrentPage(gridRef.current.api.paginationGetCurrentPage() + 1);
			setGridTotalPages(gridRef.current.api.paginationGetTotalPages());
		}
	}, []);
	/**
	 *  ? Methods
	 */

	const validateRequiredFields = () => {
		let error: boolean = false;

		if (topicName === '') {
			error = true;
		}

		if (selectedStatuses.length === 0) {
			error = true;
		}

		if (caseType.length === 0) {
			error = true;
		}

		if (brand.length === 0) {
			error = true;
		}

		if (currency.length === 0) {
			error = true;
		}

		return error;
	};

	const postTopicName = (_isExist: boolean) => {
		if (!_isExist) {
			swal({
				title: SwalConfirmMessage.title,
				text: SwalConfirmMessage.textSaveConfirm,
				icon: SwalConfirmMessage.icon,
				buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
				dangerMode: true,
			})
				.then((willUpdate) => {
					if (willUpdate) {
						setIsSubmitting(true);
						addTopic();
					}
				})
				.catch(() => {});
		} else {
			swal('Failed', message.alreadyExist, 'error').catch(() => {});
			setIsSubmitting(false);
		}
	};

	const validateAddTopicForm = () => {
		if (validateRequiredFields() === true) {
			swal('Failed', message.requiredFields, 'error').catch(() => {});
		} else {
			const {value} = caseType;

			sendTopicName(topicName, parseInt(value))
				.then((response) => {
					if (response.status === successResponse) {
						postTopicName(response.data);
					}
				})
				.catch(() => {
					swal('Failed', 'Connection error Please close the form and try again', 'error').catch(() => {});
					setIsSubmitting(false);
				});
		}
	};

	const closeCreateTopic = () => {
		swal({
			title: 'Confirmation',
			text: 'Any changes will be discarded, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		})
			.then((willUpdate) => {
				if (willUpdate) {
					setCaseType('');
					setSelectedStatuses('');
					setTopicName('');
					setBrand('');
					setCurrency('');
					setRowData([]);
					setModalShow(false);
				}
			})
			.catch(() => {});
	};

	const postUpserTopicResult = (_response: number) => {
		if (_response === successResponse) {
			swal('Success', 'Record successfully submitted', 'success')
				.then((onSuccess) => {
					if (onSuccess) {
						setCaseType('');
						setSelectedStatuses('');
						setTopicName('');
						setBrand('');
						setCurrency('');
						setRowData([]);
						setIsSubmitting(false);
						setModalShow(false);
					}
				})
				.catch(() => {});
		} else {
			swal('Failed', 'Problem connecting to the server, Please refresh', 'error').catch(() => {});
			setIsSubmitting(false);
			setModalShow(false);
		}
	};

	async function requestFomula() {
		const request: UpSertTopicRequestModel = {
			queueId: Guid.create().toString(),
			codeListId: 1,
			topicName: topicName,
			userId: userId?.toString() ?? '0',
			topicId: 0,
			caseTypeId: parseInt(caseType.value),
			topicBrandType: brand.map((x: OptionListModel) => {
				return {
					topicId: 0,
					brandId: parseInt(x.value),
				};
			}),
			topicCurrencyType: currency.map((x: OptionListModel) => {
				return {
					topicId: 0,
					currencyId: parseInt(x.value),
				};
			}),
			topicLanguageType: rowData.map((x: TopicLanguageUdtModel) => {
				return {
					topicLanguageId: x.topicLanguageId,
					topicId: 0,
					languageId: x.languageId,
					topicLanguageTranslation: x.topicLanguageTranslation,
				};
			}),
			isActive: selectedStatuses.value === '1' ? true : false,
			position: 0,
		};

		return request;
	}

	const addTopic = () => {
		setIsSubmitting(true);
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(async () => {
					if (messagingHub.state === HubConnected) {
						let postRequest = await requestFomula();

						SendUpSertTopic(postRequest)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(postRequest.queueId.toString(), (message) => {
										let resultData = JSON.parse(message.remarks);

										postUpserTopicResult(resultData.Status);

										messagingHub.off(postRequest.queueId.toString());
										messagingHub.stop().catch(() => {});
									});

									setTimeout(() => {
										if (messagingHub.state === HubConnected) {
											messagingHub.stop().catch(() => {});
										}
									}, 30000);
								}
							})
							.catch(() => {
								swal('Failed', 'Problem in Connection on Gateway', 'error').catch(() => {});
								setIsSubmitting(false);
								setModalShow(false);
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	const addTopicLanguage = () => {
		const {label, value} = language;

		if (value === undefined || languageTranslation === '' || topicName === '') {
			swal('Failed', message.requiredFields, 'error').catch(() => {});
		} else {
			const request: TopicLanguageUdtModel = {
				topicId: 0,
				topicLanguageId: 0,
				languageId: parseInt(value),
				languageName: label,
				topicLanguageTranslation: languageTranslation,
			};
			setRowData([...rowData, request]);
			setLanguage('');
			setLanguageTranslation('');
		}
	};

	const addDefautLanguage = () => {
		let _languageId = languageOptions.find((x) => x.languageName.toLocaleLowerCase() === 'english (united states)')?.id || 0;

		const request: TopicLanguageUdtModel = {
			topicId: 0,
			topicLanguageId: 0,
			languageId: _languageId,
			languageName: languageOptions.find((x) => x.languageName.toLocaleLowerCase() === 'english (united states)')?.languageName || '',
			topicLanguageTranslation: languageTranslation,
		};

		setRowData([request]);
	};

	const _submitUpdateLanguage = () => {
		const {label, value} = language;

		const request: TopicLanguageUdtModel = {
			topicId: 0,
			topicLanguageId: 0,
			languageId: parseInt(value),
			languageName: label,
			topicLanguageTranslation: languageTranslation,
		};

		swal({
			title: 'Confirmation',
			text: 'This action will update language selected, please confirm',
			icon: 'warning',
			buttons: ['No', 'Yes'],
			dangerMode: true,
		})
			.then((onClosePage) => {
				if (onClosePage) {
					let removeToEditData = rowData.filter((x) => x.languageId !== parseInt(value));
					setRowData([...removeToEditData, request]);
					setIsUpdateLanguage(false);
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

	const removeLanguage = (_param: TopicLanguageUdtModel) => {
		const filterLanguage = rowData.filter((x) => x !== _param);
		setRowData(filterLanguage);
	};

	const editLanguage = (_param: TopicLanguageUdtModel) => {
		setIsUpdateLanguage(true);
		const {languageId, languageName, topicLanguageTranslation} = _param;
		setLanguage({value: languageId, label: languageName});
		setLanguageTranslation(topicLanguageTranslation);
	};
	
	/**
	 *  ? Tables
	 */
	const columnDefs: (ColDef<TopicLanguageUdtModel> | ColGroupDef<TopicLanguageUdtModel>)[] = [
		{headerName: 'No', field: 'topicLanguageId', minWidth: 100 , valueGetter: (params) => {
			const rowIndex = params.node?.rowIndex ?? -1; // Default to -1 if undefined
			return rowIndex >= 0 ? rowIndex + 1 : null; // Return ID if rowIndex is valid
		  }, 
		 },
		{headerName: 'Language', field: 'languageName', minWidth: 250, resizable: true},
		{headerName: 'Local Character Translation', field: 'topicLanguageTranslation', minWidth: 350, resizable: true},
		{
			headerName: 'Action',
			field: 'topicLanguageId',
			
			cellRenderer: (params: any) => (
				<>
					{params.data.languageName.toLowerCase() !== 'english (united states)' ? (
						<ButtonGroup aria-label='Topic Button Group'>
							<div className='d-flex justify-content-center flex-shrink-0'>
								<div className='me-6'>
									<TableIconButton
										access={true}
										toolTipText={'Edit'}
										faIcon={faPencilAlt}
										isDisable={disableLanguage}
										onClick={() => editLanguage(params.data)}
									/>
								</div>
								<div className='me-6'>
									<TableIconButton
										toolTipText={'Remove'}
										iconColor={'text-danger'}
										access={true}
										faIcon={faTrash}
										isDisable={disableLanguage}
										onClick={() => removeLanguage(params.data)}
									/>
								</div>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
			width: 200,
		},
	];

	return (
		<FormModal headerTitle={'Add Topic'} haveFooter={false} show={showForm} customSize={'xl'}>
			<MainContainer>
				<div style={{marginBottom: 20}}>
					<Row>
						<Col sm={6}>
							<RequiredLabel title={'Case Type'} />
							<Select
								native
								size='small'
								style={{width: '100%'}}
								options={caseTypeOptionList}
								onChange={onChangeCaseType}
								value={caseType}
								isLoading={isCaseTypeLoading}
							/>
						</Col>
						<Col sm={6}>
							<RequiredLabel title={'Status'} />
							<Select
								native
								size='small'
								style={{width: '100%'}}
								options={statusOptions}
								onChange={onChangeSelectedStatues}
								value={selectedStatuses}
							/>
						</Col>
					</Row>
					<Row>
						<Col sm={12}>
							<RequiredLabel title={'Topic Name'} />
							<BasicTextInput
								ariaLabel={'Topic Name'}
								colWidth={'col-sm-12'}
								value={topicName}
								onChange={(e) => onChangeTopicName(e.target.value)}
								disabled={false}
							/>
						</Col>
					</Row>
					<Row>
						<Col sm={12}>
							<RequiredLabel title={'Brand'} />
							<Select
								isMulti
								size='small'
								value={brand}
								style={{width: '100%'}}
								options={brandOptionList}
								onChange={onChangeBrand}
								isLoading={isBrandLoading}
							/>
						</Col>
					</Row>
					<Row>
						<Col sm={12}>
							<RequiredLabel title={'Currency'} />
							<Select
								isMulti
								size='small'
								style={{width: '100%'}}
								options={currencyOptionList}
								onChange={onChangeCurrency}
								value={currency}
								isLoading={isCurrencyLoading}
							/>
						</Col>
					</Row>
				</div>
			</MainContainer>

			<div className='separator separator-dashed my-5'></div>
			<LangunageInfoMessage isDisable={disableLanguage} languageInstructionStyle={languageInstructionStyle} />

			<MainContainer>
				<div style={{marginTop: 20, paddingLeft: 9, paddingRight:9}}>
					<Row>
						<Col sm={12}>
							<Row>
								<Col sm={6} style={{borderWidth: 1, borderColor: '#000'}}>
									<BasicFieldLabel title={'Select Language'} />
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
								<Col sm={6}>
									<BasicFieldLabel title={'Local Character Translation'} />
									<textarea
										className='form-control form-control-sm'
										value={languageTranslation}
										onChange={(e) => setLanguageTranslation(e.target.value)}
										disabled={false}
									/>
								</Col>
							</Row>
							<Row style={{marginTop: 20}}>
								<Col sm={12}>
									{isUpdateLanguage ? (
										<>
											<MlabButton
												access={access?.includes(USER_CLAIMS.TopicWrite)}
												size={'sm'}
												label={'Update Language'}
												style={ElementStyle.primary}
												type={'button'}
												weight={'solid'}
												loading={false}
												disabled={disableLanguage}
												loadingTitle={' Please wait...'}
												onClick={_submitUpdateLanguage}
											/>
										</>
									) : (
										<>
											<MlabButton
												access={access?.includes(USER_CLAIMS.TopicWrite)}
												size={'sm'}
												label={'Add Language'}
												style={ElementStyle.primary}
												type={'button'}
												weight={'solid'}
												loading={false}
												disabled={disableLanguage}
												loadingTitle={' Please wait...'}
												onClick={addTopicLanguage}
											/>
										</>
									)}
								</Col>
								<Col sm={8}></Col>
							</Row>
							<Col sm={6}></Col>
						</Col>
					</Row>
					<Row>
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
									//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
									columnDefs={columnDefs}
									ref={gridRef}
									paginationPageSize={gridPageSize}
									pagination={true}
									suppressPaginationPanel={true}
									suppressScrollOnNewData={true}
									onPaginationChanged={onPaginationChanged}
								/>
								<LocalGridPagination
									recordCount={rowData.length}
									gridCurrentPage={gridCurrentPage}
									gridPageSize={gridPageSize}
									setGridPageSize={setGridPageSize}
									gridTotalPages={gridTotalPages}
									gridRef={gridRef}
									customId={customPageSizeElementId} //page-size-create-subtopic | optional, for page that has more than one grid with page size selection
								/>
							</div>
						</Col>
					</Row>
				</div>
			</MainContainer>
			<ModalFooter style={{border: 0, padding: 0, marginTop: 15, marginBottom: 5}}>
				<MlabButton
					access={access?.includes(USER_CLAIMS.TopicWrite)}
					size={'sm'}
					label={'Submit'}
					style={ElementStyle.primary}
					type={'button'}
					weight={'solid'}
					loading={isSubmitting}
					disabled={isSubmitting}
					loadingTitle={' Please wait...'}
					onClick={validateAddTopicForm}
				/>
				<MlabButton
					access={access?.includes(USER_CLAIMS.TopicRead)}
					size={'sm'}
					label={'Close'}
					style={ElementStyle.secondary}
					type={'button'}
					weight={'solid'}
					loading={isSubmitting}
					disabled={isSubmitting}
					loadingTitle={' Please wait...'}
					onClick={closeCreateTopic}
				/>
			</ModalFooter>
		</FormModal>
	);
};

export default CreateTopic;
