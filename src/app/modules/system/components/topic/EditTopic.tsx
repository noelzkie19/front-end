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
import {GetTopicByIdRequestModel} from '../../models/topic/request/GetTopicByIdRequestModel';
import {GetTopicById, SendGetTopicById, SendUpSertTopic, sendTopicName} from '../../redux/SystemService';
import {useSystemOptionHooks} from '../../shared';
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface Props {
	showForm: boolean;
	setModalEditTopicShow: (e: boolean) => void;
	searchToTopicList: () => void;
	topicId: number;
}

const languageInstructionStyle = {
	fontStyle: 'italic',
	color: '#818181',
	fontSize: '12px',
};

const EditTopic: React.FC<Props> = ({showForm, setModalEditTopicShow, topicId, searchToTopicList}) => {
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
	const [position, setPosition] = useState<number>(0);
	const [language, setLanguage] = useState<any>('');
	const [languageTranslation, setLanguageTranslation] = useState<string>('');
	const [isUpdateLanguage, setIsUpdateLanguage] = useState<boolean>(false);
	const [rowData, setRowData] = useState<Array<TopicLanguageUdtModel>>([]);
	const [disableLanguage, setDisableLanguage] = useState<boolean>(false);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [gridPageSize, setGridPageSize] = useState<number>(10);
	const [gridCurrentPage, setGridCurrentPage] = useState<number>(1);
	const [gridTotalPages, setGridTotalPages] = useState<number>(1);

	/**
	 *  ? Hooks
	 */
	const {
		getCaseTypeOptions,
		caseTypeOptionList,
		isCaseTypeLoading,
		brandOptionList,
		getBrandOptions,
		isBrandLoading,
		getCurrencyOptions,
		currencyOptionList,
		isCurrencyLoading,
		getLanguageOptions,
		languageOptions,
	} = useSystemOptionHooks();

	/**
	 *  ? Constants
	 */

	const statusOptions = [
		{value: '1', label: 'Active'},
		{value: '2', label: 'Inactive'},
	];
	const {successResponse, message, HubConnected} = useConstant();
	const ArrayObjOptionLanguange = languageOptions.filter(({id: id}) => !rowData.some(({languageId: languageId}) => languageId === id));
	const customPageSizeElementId = 'edit-topic';
	const gridRef: any = useRef();
	/**
	 *  ? Mounted
	 */

	useEffect(() => {
		if (showForm) {
			setRowData([]);
			getCaseTypeOptions();
			getBrandOptions();
			getCurrencyOptions();
			getLanguageOptions();
			getTopicDetails();

			setIsUpdateLanguage(false);
			setLanguage('');
			setLanguageTranslation('');
		}
	}, [showForm]);

	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
	};

	/**
	 *  ? Watchers
	 */
	useEffect(() => {
		if (topicName.trim() === '') {
			setDisableLanguage(true);
		} else {
			setDisableLanguage(false);
		}
	}, [topicName]);

	/**
	 *  ? Events
	 */

	const onChangeSelectedStatues = (val: any) => {
		setSelectedStatuses(val);
	};

	const onChangeCaseType = (val: any) => {
		setCaseType(val);
	};

	const onChangeBrand = (val: any) => {
		setBrand(val);
	};

	const onChangeCurrency = (val: any) => {
		setCurrency(val);
	};

	const onChangeLanguage = (val: any) => {
		setLanguage(val);
	};

	const onChangeTopicName = (_topicName: string) => {
		setTopicName(_topicName);

		let filterData = rowData.filter((x) => x.languageName?.toLocaleLowerCase() !== 'english (united states)');

		let _languageId = languageOptions.find((x) => x.languageName.toLocaleLowerCase() === 'english (united states)')?.id || 0;

		let _topicLanguageId = rowData.find((x) => x.languageName?.toLocaleLowerCase() === 'english (united states)')?.topicLanguageId || 0;

		const request: TopicLanguageUdtModel = {
			topicId: topicId,
			topicLanguageId: _topicLanguageId,
			languageId: _languageId,
			languageName: languageOptions.find((x) => x.languageName.toLocaleLowerCase() === 'english (united states)')?.languageName || '',
			topicLanguageTranslation: _topicName,
		};

		setRowData([request, ...filterData]);
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
	 *  ? Api Methods
	 */

	const getTopicByIdCallback = (_cacheId: string) => {
		GetTopicById(_cacheId)
			.then((data) => {
				setCaseType({label: data.data.caseTypeName, value: data.data.caseTypeId.toString()});
				setSelectedStatuses({label: data.data.statusName, value: data.data.isActive.toString()});
				setTopicName(data.data.topicName);
				setBrand(
					data.data.topicBrandType.flatMap((x) => [
						{
							label: x.brandName,
							value: x.brandId.toString(),
						},
					])
				);
				setCurrency(
					data.data.topicCurrencyType.flatMap((x) => [
						{
							label: x.currencyName,
							value: x.currencyId.toString(),
						},
					])
				);
				setRowData(data.data.topicLanguageType);
				setPosition(data.data.position);
			})
			.catch(() => {});
	};

	const getTopicDetails = () => {
		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(() => {
					if (messagingHub.state === HubConnected) {
						const request: GetTopicByIdRequestModel = {
							queueId: Guid.create().toString(),
							topicId: topicId,
							userId: userId?.toString() ?? '0',
						};

						SendGetTopicById(request)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(request.queueId.toString(), (message) => {
										getTopicByIdCallback(message.cacheId);
										messagingHub.off(request.queueId.toString());
										messagingHub.stop().catch(() => {});
									});
								} else {
									swal('Failed', 'Problem in Connection on Gateway', 'error').catch(() => {});
								}
							})
							.catch(() => {
								messagingHub.stop().catch(() => {});
								swal('Failed', 'Problem in Connection on Gateway', 'error').catch(() => {});
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	async function updateTopicRequest() {
		const request: UpSertTopicRequestModel = {
			queueId: Guid.create().toString(),
			codeListId: 1,
			topicName: topicName,
			userId: userId?.toString() ?? '0',
			topicId: topicId,
			caseTypeId: parseInt(caseType.value),
			topicBrandType: brand.map((x: OptionListModel) => {
				return {
					topicId: topicId,
					brandId: parseInt(x.value),
				};
			}),
			topicCurrencyType: currency.map((x: OptionListModel) => {
				return {
					topicId: topicId,
					currencyId: parseInt(x.value),
				};
			}),
			topicLanguageType: rowData.map((x: TopicLanguageUdtModel) => {
				return {
					topicLanguageId: x.topicLanguageId,
					topicId: topicId,
					languageId: x.languageId,
					topicLanguageTranslation: x.topicLanguageTranslation,
				};
			}),
			isActive: selectedStatuses.value === '1' ? true : false,
			position: position,
		};

		return request;
	}

	const updateTopic = () => {
		setIsSubmitting(true);

		setTimeout(() => {
			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
				.start()
				.then(async () => {
					if (messagingHub.state === HubConnected) {
						let request = await updateTopicRequest();

						SendUpSertTopic(request)
							.then((response) => {
								if (response.status === successResponse) {
									messagingHub.on(request.queueId.toString(), (message) => {
										let resultData = JSON.parse(message.remarks);

										if (resultData.Status === successResponse) {
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
														setModalEditTopicShow(false);
														searchToTopicList();
													}
												})
												.catch(() => {});
										}
									});
								}
							})
							.catch(() => {
								messagingHub.stop().catch(() => {});
								swal('Failed', 'Problem in Connection on Gateway', 'error').catch(() => {});
								setIsSubmitting(false);
							});
					}
				})
				.catch((err) => console.log('Error while starting connection: ' + err));
		}, 1000);
	};

	/**
	 *  ? Validations
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

	const validateAddTopicForm = () => {
		if (validateRequiredFields() === true) {
			swal('Failed', message.requiredFields, 'error').catch(() => {});
		} else {
			sendTopicName(topicName, topicId)
				.then((response) => {
					if (response.status === successResponse) {
						let res = response.data;

						if (!res) {
							swal({
								title: 'Confirmation',
								text: 'This action will save the changes made, Please confirm',
								icon: 'warning',
								buttons: ['No', 'Yes'],
								dangerMode: true,
							})
								.then((willUpdate) => {
									if (willUpdate) {
										setIsSubmitting(true);
										updateTopic();
										searchToTopicList();
									}
								})
								.catch(() => {});
						} else {
							swal('Failed', message.alreadyExist, 'error').catch(() => {});
							setIsSubmitting(false);
						}
					}
				})
				.catch(() => {
					swal('Failed', 'Connection error Please close the form and try again', 'error').catch(() => {});
					setIsSubmitting(false);
				});
			// }
		}
	};

	/**
	 *  ? Methods
	 */

	const closeEditTopic = () => {
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
					searchToTopicList();
					setModalEditTopicShow(false);
				}
			})
			.catch(() => {});
	};

	const addTopicLanguage = () => {
		const {label, value} = language;

		if (value === undefined || languageTranslation === '' || topicName === '') {
			swal('Failed', message.requiredFields, 'error').catch(() => {});
		} else {
			const request: TopicLanguageUdtModel = {
				topicId: topicId,
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

	const _submitUpdateLanguage = () => {
		const {label, value} = language;

		if (value === undefined || languageTranslation === '' || topicName === '') {
			swal('Failed', message.requiredFields, 'error').catch(() => {});
		} else {
			const request: TopicLanguageUdtModel = {
				topicId: topicId,
				topicLanguageId: rowData.find((obj) => obj.languageId === parseInt(value))?.topicLanguageId || 0,
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
						searchToTopicList();
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
		}
	};

	const removeLanguage = (_param: TopicLanguageUdtModel) => {
		const filterLanguage = rowData.filter((x) => x !== _param);
		setRowData(filterLanguage);
	};

	const editLanguage = (_param: TopicLanguageUdtModel) => {
		setIsUpdateLanguage(true);
		const {languageName, topicLanguageTranslation, languageId} = _param;
		setLanguage({value: languageId, label: languageName});
		setLanguageTranslation(topicLanguageTranslation);
	};

	/**
	 *  ? Local Components
	 */
	const LangunageInfoMessage = () => (
		<>
			<div style={languageInstructionStyle} className='mt-7 mb-4'>
				*Select Language and enter Local Character Translation to add Language Translation.
				<br />
				{disableLanguage && <span className='text-danger'>*Subtopic name is required to add or edit Language Translation.</span>}
			</div>
		</>
	);
	const Separator = () => <div className='separator separator-dashed my-5'></div>;

	/**
	 *  ? Tables
	 */
	const columnDefs: (ColDef<TopicLanguageUdtModel> | ColGroupDef<TopicLanguageUdtModel>)[] = [
		{headerName: 'No', width: 120, valueGetter: (params) => {
			const rowIndex = params.node?.rowIndex ?? -1; // Default to -1 if undefined
			return rowIndex >= 0 ? rowIndex + 1 : null; // Return ID if rowIndex is valid
		  }, 
		},
		{headerName: 'Language', field: 'languageName'},
		{headerName: 'Local Character Translation', field: 'topicLanguageTranslation', minWidth: 300},
		{
			headerName: 'Action',
			field: 'languageId',
			cellRenderer: (params: any) => (
				<>
					{params.data.languageName.toLowerCase() !== 'english (united states)' ? (
						<ButtonGroup aria-label='Basic example'>
							<div className='d-flex justify-content-center flex-shrink-0'>
								<div className='me-6'>
									<TableIconButton
										access={true}
										isDisable={disableLanguage}
										toolTipText={'Edit'}
										faIcon={faPencilAlt}
										onClick={() => editLanguage(params.data)}
									/>
								</div>
								<div className='me-6'>
									<TableIconButton
										faIcon={faTrash}
										access={true}
										isDisable={disableLanguage}
										iconColor={'text-danger'}
										toolTipText={'Remove'}
										onClick={() => removeLanguage(params.data)}
									/>
								</div>
							</div>
						</ButtonGroup>
					) : null}
				</>
			),
		},
	];

	return (
		<FormModal headerTitle={'Edit Topic'} haveFooter={false} show={showForm} customSize={'xl'}>
			<MainContainer>
				<div style={{marginBottom: 20}}>
					<Row>
						<Col sm={6}>
							<RequiredLabel title={'Case Type'} />
							<Select
								native
								style={{width: '100%'}}
								size='small'
								onChange={onChangeCaseType}
								options={caseTypeOptionList}
								value={caseType}
								isDisabled={true}
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
								value={selectedStatuses}
								onChange={onChangeSelectedStatues}
							/>
						</Col>
					</Row>
					<Row>
						<Col sm={12}>
							<RequiredLabel title={'Topic Name'} />
							<BasicTextInput
								value={topicName}
								disabled={false}
								ariaLabel={'Topic Name'}
								colWidth={'col-sm-12'}
								onChange={(e) => onChangeTopicName(e.target.value)}
							/>
						</Col>
					</Row>
					<Row>
						<Col sm={12}>
							<RequiredLabel title={'Brand'} />
							<Select
								isMulti
								size='small'
								style={{width: '100%'}}
								value={brand}
								onChange={onChangeBrand}
								options={brandOptionList}
								isLoading={isBrandLoading}
							/>
						</Col>
					</Row>
					<Row>
						<Col sm={12}>
							<RequiredLabel title={'Currency'} />
							<Select
								isMulti
								value={currency}
								size='small'
								style={{width: '100%'}}
								onChange={onChangeCurrency}
								options={currencyOptionList}
								isLoading={isCurrencyLoading}
							/>
						</Col>
					</Row>
				</div>
			</MainContainer>

			<Separator />
			<LangunageInfoMessage />

			<MainContainer>
				<div style={{marginTop: 20,paddingLeft: 9, paddingRight:9}}>
					<Row>
						<Col sm={12}>
							<Row>
								<Col sm={6} style={{borderWidth: 1, borderColor: '#000'}}>
									<BasicFieldLabel title={'Select Language'} />
									<Select
										value={language}
										style={{width: '100%'}}
										onChange={onChangeLanguage}
										isDisabled={isUpdateLanguage}
										options={ArrayObjOptionLanguange.filter((x) => x.isComplete === true).flatMap((x) => [
											{label: x.languageName, value: x.id?.toString()},
										])}
									/>
								</Col>
								<Col sm={6}>
									<BasicFieldLabel title={'Local Character Translation'} />
									<textarea
										disabled={false}
										value={languageTranslation}
										className='form-control form-control-sm'
										onChange={(e) => setLanguageTranslation(e.target.value)}
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
												type={'button'}
												weight={'solid'}
												loading={false}
												label={'Update Language'}
												style={ElementStyle.primary}
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
												type={'button'}
												weight={'solid'}
												loading={false}
												disabled={disableLanguage}
												loadingTitle={' Please wait...'}
												onClick={addTopicLanguage}
												label={'Add Language'}
												style={ElementStyle.primary}
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
									rowBuffer={0}
									rowData={rowData}
									defaultColDef={{
										sortable: true,
										resizable: true,
									}}
									onGridReady={onGridReady}
									pagination={true}
									suppressPaginationPanel={true}
									suppressScrollOnNewData={true}
									//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
									columnDefs={columnDefs}
									ref={gridRef}
									paginationPageSize={gridPageSize}
									onPaginationChanged={onPaginationChanged}
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
						</Col>
					</Row>
				</div>
			</MainContainer>
			<ModalFooter style={{border: 0, padding: 0, marginTop: 15, marginBottom: 5}}>
				<MlabButton
					access={access?.includes(USER_CLAIMS.TopicWrite)}
					size={'sm'}
					label={'Submit'}
					type={'button'}
					weight={'solid'}
					loading={isSubmitting}
					disabled={isSubmitting}
					style={ElementStyle.primary}
					onClick={validateAddTopicForm}
					loadingTitle={' Please wait...'}
				/>
				<MlabButton
					access={access?.includes(USER_CLAIMS.TopicRead)}
					size={'sm'}
					label={'Close'}
					type={'button'}
					weight={'solid'}
					loading={isSubmitting}
					disabled={isSubmitting}
					onClick={closeEditTopic}
					style={ElementStyle.secondary}
					loadingTitle={' Please wait...'}
				/>
			</ModalFooter>
		</FormModal>
	);
};

export default EditTopic;
