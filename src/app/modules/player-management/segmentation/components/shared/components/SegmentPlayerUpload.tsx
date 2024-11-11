import {faFileCsv} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React, {useEffect, useRef, useState} from 'react';
import {Modal, ModalFooter} from 'react-bootstrap-v5';
import {CSVLink} from 'react-csv';
import {useCSVReader} from 'react-papaparse';
import {shallowEqual, useSelector} from 'react-redux';
import {useParams} from 'react-router-dom';
import swal from 'sweetalert';
import {RootState} from '../../../../../../../setup';
import {ElementStyle, SegmentPageAction} from '../../../../../../constants/Constants';
import useConstant from '../../../../../../constants/useConstant';
import {FieldContainer, FormGroupContainer, MlabButton, SuccesLoaderButton} from '../../../../../../custom-components';
import AlertLabel from '../../../../../../custom-components/labels/AlertLabel';
import {AlertLabelModel} from '../../../../../../custom-components/models/AlertLabelModel';
import {InFileSegmentPlayerModel} from '../../../models/InFileSegmentPlayerModel';
import {ValidateInFileRequestModels} from '../../../models/requests/ValidateInFileRequestModel';
import {validateInFilePlayers} from '../../../redux/SegmentationService';
import { InFileSegmentModel } from '../../../models/InFileSegmentModel';

const csvErrorHeader = [
	{label: 'Player Id', key: 'playerId'},
	{label: 'Brand Name (1 Brand only)', key: 'brandName'},
	{label: 'Remarks', key: 'remarks'},
];

const csvHeader = [
	{label: 'Player Id', key: 'playerId'},
	{label: 'Brand Name (1 Brand only)', key: 'brandName'}
];

let csvData: any = [];
let csvNoData: any = [];

interface props {
	setUploadInFilePlayersId?: any;
	setUploadInFileBrandId?: any;
}

const SegmentPlayerUpload: React.FC<props> = ({setUploadInFilePlayersId, setUploadInFileBrandId}) => {
	const {CSVReader} = useCSVReader();
	const buttonRef = useRef(null);
	const {actionName, segmentId} = useParams();

	const fileType = 'text/csv';
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;
	const [showModal, setShowModal] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [showResults, setShowResults] = useState<boolean>(false);
	const [submitDisable, setSubmitDisable] = useState<boolean>(true);
	const [validBrandId, setValidBrandId] = useState<string>('');
	const [validPlayers, setValidPlayers] = useState<number>(0);
	const [invalidPlayers, setInvalidPlayers] = useState<number>(0);
	const [duplicatePlayers, setDuplicatePlayers] = useState<number>(0);
	const [fileName, setFileName] = useState<string>('');
	const [validPlayerList, setValidPlayerList] = useState<string>('');
	const [validPlayerArrList, setValidPlayerArrList] = useState<Array<InFileSegmentPlayerModel>>([]);
	const [readOnly, setReadOnly] = useState(false);
	const {successResponse, HubConnected} = useConstant();

	const [alertMessage, setAlertMessage] = useState<AlertLabelModel>();
	let alertLabel: AlertLabelModel;

	useEffect(() => {
		alertLabel = {hasAlert: false, message: '', status: ''};
		setAlertMessage(alertLabel);

		setLoading(false);
		setValidBrandId('');
		setValidPlayers(0);
		setInvalidPlayers(0);
		setShowResults(false);
	}, []);

	useEffect(() => {
		if (validPlayerArrList.length > 0) {
			alertLabel = {hasAlert: true, message: 'This will overwrite the previously uploaded player records', status: 'success'};
			setAlertMessage(alertLabel);
		}
	}, [validPlayerArrList]);

	useEffect(() => {
		if (actionName === SegmentPageAction.CONVERT_TO_STATIC || actionName === SegmentPageAction.VIEW) {
			setReadOnly(true);
		}
	}, [segmentId, actionName]);

	const handleImportPlayers = () => {
		setShowModal(true);
	};

	const clearData = () => {
		setValidPlayers(0);
		setInvalidPlayers(0);
		setDuplicatePlayers(0);
		setFileName('');
		setShowResults(false);
		setSubmitDisable(true);
		alertLabel = {hasAlert: false, message: '', status: ''};
		setAlertMessage(alertLabel);
	};

	const _close = () => {
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
	};

	const validatePlayerIds = (results: any) => {
		const playerIdObj = Array<InFileSegmentPlayerModel>();
		let isValidFile = alertLabel.hasAlert === true ? false : true;

		//remove header
		const rowsWithHeader = results.data.slice(1);
		//remove row when columns are empty
		const filteredData = rowsWithHeader.filter((row: any) => {
			return row.some((column: any) => column.trim() !== '');
		})

		// Check if any cell in any row is blank
		const hasBlankCell = filteredData.some((row: any) => {
			return row.some((cell: any) => cell.trim() === '');
		})

		if (results.data[0].length > 2 || results.data[0][0] !== csvHeader[0].label || results.data[0][1] !== csvHeader[1].label || hasBlankCell) {
			alertLabel = {hasAlert: true, message: 'Invalid file content.', status: 'danger'};
			setAlertMessage(alertLabel);
			isValidFile = false;
			setSubmitDisable(true);
		}

		if (filteredData.length > 50000) {
			alertLabel = {hasAlert: true, message: 'Unable to proceed. You can only upload maximum of 50,000 player IDs.', status: 'danger'};
			setAlertMessage(alertLabel);
			isValidFile = false;
			setSubmitDisable(true);
		}

		const uniqueValues = [...new Set(filteredData.map((item: any) => item[1]))];
		if(uniqueValues.length > 1){
			alertLabel = {hasAlert: true, message: 'Unable to proceed. Multiple brands detected on file.', status: 'danger'};
			setAlertMessage(alertLabel);
			isValidFile = false;
			setSubmitDisable(true);
		} 

		if (isValidFile) {
			const brandNameObj = uniqueValues[0] as string;

			filteredData.forEach((element: any, index: any) => {
				const parseFrst: any = {
					playerId: element[0]
				};
				playerIdObj.push(parseFrst);
			});

			const requestModel: InFileSegmentModel = {
				playerIds: playerIdObj,
				brandName: brandNameObj
			}

			let requests: ValidateInFileRequestModels = {
				playerList: requestModel,
				userId: userAccessId.toString(),
				queueId: '',
			};

			setLoading(true);
			validateInFilePlayers(requests)
				.then((response) => {
					if (response.status === successResponse) {
						setValidBrandId(response.data.validBrandId);
						setValidPlayers(response.data.validPlayerCount);
						setInvalidPlayers(response.data.invalidPlayerCount);
						setDuplicatePlayers(response.data.duplicatePlayerCount);
						setValidPlayerList(response.data.validPlayerIdList);
						csvData = response.data.remarksForInvalidPlayers;

						setShowResults(true);
						setSubmitDisable(false);
						setLoading(false);
					}
				})
				.catch((err) => {
					alertLabel = {hasAlert: true, message: 'Error encountered while proccessing file.', status: 'danger'};
					setAlertMessage(alertLabel);
					setLoading(false);
				});
		}
	};

	const validateFile = (data: any) => {
		clearData();
		setFileName(data.name);

		alertLabel = {hasAlert: false, message: '', status: ''};
		setAlertMessage(alertLabel);

		if (data.type != 'text/csv') {
			alertLabel = {hasAlert: true, message: 'Invalid file format, please upload in a CSV file with the player ID list', status: 'danger'};
			setAlertMessage(alertLabel);
		}
	};

	const CSVReaderField = () => {
		const {CSVReader} = useCSVReader();

		return (
			<CSVReader onUploadAccepted={(results: any) => validatePlayerIds(results)} validator={validateFile} disabled={loading}>
				{({getRootProps, acceptedFile, ProgressBar}: any) => (
					<>
						<div style={{display: 'flex', flexDirection: 'row', marginBottom: 10}}>
							<button type='button' {...getRootProps()} style={{width: '20%'}}>
								Choose file
							</button>
							<div style={{border: '1px solid #ccc', height: 40, lineHeight: 3, paddingLeft: 10, width: '80%'}}>
								{acceptedFile == '' || acceptedFile == undefined ? 'No file chosen' : acceptedFile && acceptedFile.name}
							</div>
						</div>
						<ProgressBar style={{backgroundColor: 'green'}} />
					</>
				)}
			</CSVReader>
		);
	};

	const _submit = () => {
		const validPlayerListArray = Array<InFileSegmentPlayerModel>();
		const arr = validPlayerList.split(', ');

		arr.forEach((id: any) => {
			const playerId: any = {
				playerId: id,
			};
			validPlayerListArray.push(playerId);
		});

		setUploadInFilePlayersId(validPlayerListArray);
		setUploadInFileBrandId(validBrandId);
		setValidPlayerArrList(validPlayerListArray);
		swal('Successful!', 'Transaction successfully submitted', 'success');
		setShowModal(false);
		clearData();
	};

	return (
		<>
			<MlabButton
				access={true}
				label={'Upload Player'}
				style={ElementStyle.primary}
				type={'button'}
				weight={'solid'}
				onClick={() => handleImportPlayers()}
				disabled={readOnly}
			/>

			<FormGroupContainer>
				<Modal show={showModal} size={'lg'} aria-labelledby='contained-modal-title-vcenter' centered>
					<Modal.Header>
						<Modal.Title id='contained-modal-title-vcenter'>Upload Player List</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<AlertLabel alert={alertMessage} />
						{CSVReaderField()}
						{showResults ? (
							<div style={{paddingTop: '20px'}}>
								<FieldContainer>
									<div className='col-sm-12'>
										<label className='form-label-sm'>File name:&nbsp;</label>
										<b>{fileName}</b>
									</div>
								</FieldContainer>
								<FieldContainer>
									<div className='col-sm-12'>
										<label className='form-label-sm'>Valid Player count:&nbsp;</label>
										<b>{validPlayers}</b>
									</div>
								</FieldContainer>
								<FieldContainer>
									<div className='col-sm-12'>
										<label className='form-label-sm'>Invalid Player count:&nbsp;</label>
										<b>{invalidPlayers}</b>
									</div>
								</FieldContainer>
								<FieldContainer>
									<div className='col-sm-12'>
										<label className='form-label-sm'>Duplicate records to current list:&nbsp;</label>
										<b>{duplicatePlayers}</b>
									</div>
								</FieldContainer>
								<FieldContainer>
									<div className='col-sm-12' style={{fontWeight: 'bold'}}>
										<label className='form-label-sm'>
											{invalidPlayers > 0 ? (
												<>
													See{' '}
													<CSVLink filename='Invalid_Players.csv' data={csvData} headers={csvErrorHeader}>
														file
													</CSVLink>{' '}
													attached for the error report.&nbsp;
												</>
											) : (
												''
											)}
										</label>
									</div>
								</FieldContainer>
							</div>
						) : (
							''
						)}
						<div style={{paddingTop: '50px'}}>
							<FieldContainer>
								<div className='col-sm-8' style={{paddingLeft: 3 + 'rem', fontWeight: 'bold'}}>
									<p>
										{' '}
										Input file must be an CSV file format with the Player ID list. <br /> Click this file to download sample file to fill-out.
									</p>
								</div>
								<div className='col-sm-4' style={{paddingLeft: 3 + 'rem', fontWeight: 'bold'}}>
									<CSVLink filename='Import_Reference.csv' data={csvNoData} headers={csvHeader}>
										<FontAwesomeIcon icon={faFileCsv} size='4x' color='green' />
									</CSVLink>
								</div>
							</FieldContainer>
						</div>
					</Modal.Body>
					<ModalFooter style={{border: 0}}>
						<SuccesLoaderButton
							title={'Submit'}
							loading={loading}
							disabled={submitDisable}
							loadingTitle={'Please wait ...'}
							onClick={() => _submit()}
						/>
						<MlabButton
							access={true}
							size={'sm'}
							label={'Close'}
							style={ElementStyle.secondary}
							type={'submit'}
							weight={'solid'}
							onClick={() => _close()}
						/>
					</ModalFooter>
				</Modal>
			</FormGroupContainer>
		</>
	);
};

export default SegmentPlayerUpload;
