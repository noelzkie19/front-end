import { useEffect, useState } from 'react';
import { Accordion, Button, Card } from 'react-bootstrap';
import ToggleComponent from './ToggleComponent';
import { MainModuleModel } from '../../../models/MainModuleModel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faUser } from '@fortawesome/free-solid-svg-icons';
import { SECURABLE_NAMES } from '../../constants/SecurableNames';

interface Props {
	CardHeaderEditStyles: any;
	CardBodyEditStyles: any;
	SecurableObjects?: Array<MainModuleModel>;
}

const PlayerManagementSecurableObjects = ({ CardHeaderEditStyles, CardBodyEditStyles, SecurableObjects }: Props) => {
	const [createSegmentationRead, setCreateSegmentationRead] = useState(false);
	const [createSegmentationWrite, setCreateSegmentationWrite] = useState(false);

	const [uploadPlayerListRead, setUploadPlayerListRead] = useState(false);
	const [uploadPlayerListWrite, setUploadPlayerListWrite] = useState(false);
	const [downloadSearchResultRead, setDownloadSearchResultRead] = useState(false);
	const [downloadSearchResultWrite, setDownloadSearchResultWrite] = useState(false);
	const [exportLogtoCSVRead, setExportLogtoCSVRead] = useState(false);
	const [exportLogtoCSVWrite, setExportLogtoCSVWrite] = useState(false);
	const [outputFilterTemplateRead, setOutputFilterTemplateRead] = useState(false);
	const [outputFilterTemplateWrite, setOutputFilterTemplateWrite] = useState(false);
	const [playerProfileRead, setPlayerProfileRead] = useState(false);
	const [playerProfileWrite, setPlayerProfileWrite] = useState(false);

	const [viewContactDetailsRead, setViewContactDetailsRead] = useState(false);
	const [viewContactDetailsWrite, setViewContactDetailsWrite] = useState(false);

	const [manageSegmentationRead, setManageSegmentationRead] = useState(false);
	const [manageSegmentationWrite, setManageSegmentationWrite] = useState(false);
	const [manageThresholdRead, setManageThresholdRead] = useState(false);
	const [manageThresholdWrite, setManageThresholdWrite] = useState(false);
	const [playerRead, setPlayerRead] = useState(false);
	const [playerWrite, setPlayerWrite] = useState(false);
	const [playerSearchRead, setPlayerSearchRead] = useState(false);
	const [playerSearchWrite, setPlayerSearchWrite] = useState(false);
	const [viewContactDetailsLogRead, setViewContactDetailsLogRead] = useState(false);
	const [viewContactDetailsLogWrite, setViewContactDetailsLogWrite] = useState(false);

	const [segmentationRead, setSegmentationRead] = useState(false);
	const [segmentationWrite, setSegmentationWrite] = useState(false);
	const [segmentationToStaticRead, setSegmentationToStaticRead] = useState(false);
	const [segmentationToStaticWrite, setSegmentationToStaticWrite] = useState(false);
	const [segmentationCustomQueryRead, setSegmentationCustomQueryRead] = useState(false);
	const [segmentationCustomQueryWrite, setSegmentationCustomQueryWrite] = useState(false);
	const [viewSensitiveDataRead, setViewSensitiveDataRead] = useState(false);
	const [viewSensitiveDataWrite, setViewSensitiveDataWrite] = useState(false);

	const [searchLeadsRead, setSearchLeadsRead] = useState(false);
	const [searchLeadsWrite, setSearchLeadsWrite] = useState(false);	

	

	let playerClaimRead = document.getElementById('playerClaimRead') as HTMLInputElement;
	let playerClaimWrite = document.getElementById('playerClaimWrite') as HTMLInputElement;

	let playerSearchClaimRead = document.getElementById('playerSearchClaimRead') as HTMLInputElement;
	let playerSearchClaimWrite = document.getElementById('playerSearchClaimWrite') as HTMLInputElement;
	let uploadPlayerListClaimRead = document.getElementById('uploadPlayerListClaimRead') as HTMLInputElement;
	let uploadPlayerListClaimWrite = document.getElementById('uploadPlayerListClaimWrite') as HTMLInputElement;
	let downloadSearchResultClaimRead = document.getElementById('downloadSearchResultClaimRead') as HTMLInputElement;
	let downloadSearchResultClaimWrite = document.getElementById('downloadSearchResultClaimWrite') as HTMLInputElement;
	let outputFilterTemplateClaimRead = document.getElementById('outputFilterTemplateClaimRead') as HTMLInputElement;
	let outputFilterTemplateClaimWrite = document.getElementById('outputFilterTemplateClaimWrite') as HTMLInputElement;
	let playerProfileClaimRead = document.getElementById('playerProfileClaimRead') as HTMLInputElement;
	let playerProfileClaimWrite = document.getElementById('playerProfileClaimWrite') as HTMLInputElement;

	let viewContactDetailsClaimRead = document.getElementById('viewContactDetailsClaimRead') as HTMLInputElement;
	let viewContactDetailsClaimWrite = document.getElementById('viewContactDetailsClaimWrite') as HTMLInputElement;

	let segmentationClaimRead = document.getElementById('segmentationClaimRead') as HTMLInputElement;
	let segmentationClaimWrite = document.getElementById('segmentationClaimWrite') as HTMLInputElement;
	let viewContactDetailsLogClaimRead = document.getElementById('viewContactDetailsLogClaimRead') as HTMLInputElement;
	let viewContactDetailsLogClaimWrite = document.getElementById('viewContactDetailsLogClaimWrite') as HTMLInputElement;
	let exportLogtoCSVClaimRead = document.getElementById('exportLogtoCSVClaimRead') as HTMLInputElement;
	let exportLogtoCSVClaimWrite = document.getElementById('exportLogtoCSVClaimWrite') as HTMLInputElement;
	let viewSensitiveDataClaimRead = document.getElementById('viewSensitiveDataClaimRead') as HTMLInputElement;
	let viewSensitiveDataClaimWrite = document.getElementById('viewSensitiveDataClaimWrite') as HTMLInputElement;
	let createSegmentationClaimRead = document.getElementById('createSegmentationClaimRead') as HTMLInputElement;
	let createSegmentationClaimWrite = document.getElementById('createSegmentationClaimWrite') as HTMLInputElement;
	let manageSegmentationClaimRead = document.getElementById('manageSegmentationClaimRead') as HTMLInputElement;
	let manageSegmentationClaimWrite = document.getElementById('manageSegmentationClaimWrite') as HTMLInputElement;
	let segmentationToStaticClaimRead = document.getElementById('segmentationToStaticClaimRead') as HTMLInputElement;
	let segmentationToStaticClaimWrite = document.getElementById('segmentationToStaticClaimWrite') as HTMLInputElement;
	let segmentationCustomQueryClaimRead = document.getElementById('segmentationCustomQueryClaimRead') as HTMLInputElement;
	let segmentationCustomQueryClaimWrite = document.getElementById('segmentationCustomQueryClaimWrite') as HTMLInputElement;
	let manageThresholdClaimRead = document.getElementById('manageThresholdClaimRead') as HTMLInputElement;
	let manageThresholdClaimWrite = document.getElementById('manageThresholdClaimWrite') as HTMLInputElement;

	let searchLeadsClaimRead = document.getElementById('searchLeadsClaimRead') as HTMLInputElement;
	let searchLeadsClaimWrite = document.getElementById('searchLeadsClaimWrite') as HTMLInputElement;


	useEffect(() => {
		if (!SecurableObjects) return;
		let playerClaim = SecurableObjects?.find((obj) => obj.description === SECURABLE_NAMES.Player);

		if (!playerClaim) return;
		let { read, write, subMainModuleDetails }: any = playerClaim;

		playerClaimRead.checked = read;
		setPlayerRead(read);
		playerClaimWrite.checked = write;
		setPlayerWrite(write);

		if (!subMainModuleDetails) return;
		playerSearchClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.PlayerSearch)?.read;
		playerSearchClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.PlayerSearch)?.write;
		uploadPlayerListClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.ImportPlayerList)?.read;
		uploadPlayerListClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.ImportPlayerList)?.write;
		downloadSearchResultClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.DownloadSearchResult)?.read;
		downloadSearchResultClaimWrite.checked = subMainModuleDetails?.find(
			(obj: any) => obj.description === SECURABLE_NAMES.DownloadSearchResult
		)?.write;
		outputFilterTemplateClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.OutputFilterTemplate)?.read;
		outputFilterTemplateClaimWrite.checked = subMainModuleDetails?.find(
			(obj: any) => obj.description === SECURABLE_NAMES.OutputFilterTemplate
		)?.write;
		playerProfileClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.PlayerProfile)?.read;
		playerProfileClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.PlayerProfile)?.write;
		exportLogtoCSVClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.ExportLogtoCSV)?.read;
		exportLogtoCSVClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.ExportLogtoCSV)?.write;
		viewSensitiveDataClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewSensitiveData)?.read;
		viewSensitiveDataClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewSensitiveData)?.write;
		
		viewContactDetailsClaimRead.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewContactDetails)?.read;
		viewContactDetailsClaimWrite.checked = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewContactDetails)?.write;

		searchLeadMapping(subMainModuleDetails);
		viewContactDetails(subMainModuleDetails);

		//Segmentation SubModule
		const {
			read: segmentationRead,
			write: segmentationWrite,
			subModuleDetails: segmentSubModules,
		} = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.Segmentation) ?? {
			read: false,
			write: false,
			subModuleDetails: [],
		};
		segmentationClaimRead.checked = segmentationRead;
		segmentationClaimWrite.checked = segmentationWrite;

		const { read: createSegmentRead, write: createSegmentWrite } = segmentSubModules?.find(
			(obj: any) => obj.description === SECURABLE_NAMES.CreateSegmentation
		) ?? { read: false, write: false };
		createSegmentationClaimRead.checked = createSegmentRead;
		createSegmentationClaimWrite.checked = createSegmentWrite;

		const { read: manageSegmentRead, write: manageSegmentWrite } = segmentSubModules?.find(
			(obj: any) => obj.description === SECURABLE_NAMES.ManageSegmentation
		) ?? { read: false, write: false };
		manageSegmentationClaimRead.checked = manageSegmentRead;
		manageSegmentationClaimWrite.checked = manageSegmentWrite;

		const { read: segmentStaticRead, write: segmentStaticWrite } = segmentSubModules?.find(
			(obj: any) => obj.description === SECURABLE_NAMES.SetSegmentationToStatic
		) ?? { read: false, write: false };
		segmentationToStaticClaimRead.checked = segmentStaticRead;
		segmentationToStaticClaimWrite.checked = segmentStaticWrite;

		const { read: segmentCustomQueryRead, write: segmentCustomQueryWrite } = segmentSubModules?.find(
			(obj: any) => obj.description === SECURABLE_NAMES.CreateCustomQuery
		) ?? { read: false, write: false };
		segmentationCustomQueryClaimRead.checked = segmentCustomQueryRead;
		segmentationCustomQueryClaimWrite.checked = segmentCustomQueryWrite;

		// View Contact Details Log
		const {
			read: viewContactDetailsLogRead,
			write: viewContactDetailsLogWrite,
			subModuleDetails: viewContactDetailsSubModules,
		} = subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewContactDetailsLog) ?? {
			read: false,
			write: false,
			subModuleDetails: [],
		};
		viewContactDetailsLogClaimRead.checked = viewContactDetailsLogRead;
		viewContactDetailsLogClaimWrite.checked = viewContactDetailsLogWrite;

		const { read: viewContactManageThresholdRead, write: viewContactManageThresholdWrite } = viewContactDetailsSubModules?.find(
			(obj: any) => obj.description === SECURABLE_NAMES.ManageThreshold
		) ?? { read: false, write: false };
		manageThresholdClaimRead.checked = viewContactManageThresholdRead;
		manageThresholdClaimWrite.checked = viewContactManageThresholdWrite;

		changePlayerRuleStatus();
		return () => { };	
	}, [SecurableObjects]);

	const searchLeadMapping = (_subMainModuleDetails: any) => {
		const {read: searchLeadMappingRead, write: searchLeadMappingWrite} = _subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.SearchLeads) ?? {
			read: false,
			write: false,		
		};

		searchLeadsClaimRead.checked = searchLeadMappingRead;
		searchLeadsClaimWrite.checked = searchLeadMappingWrite;
	};

	const viewContactDetails = (_subMainModuleDetails: any) => {
		const {read: viewContactDetailsRead, write: viewContactDetailsWrite} = _subMainModuleDetails?.find((obj: any) => obj.description === SECURABLE_NAMES.ViewContactDetails) ?? {
			read: false,
			write: false,		
		};

		viewContactDetailsClaimRead.checked = viewContactDetailsRead;
		viewContactDetailsClaimWrite.checked = viewContactDetailsWrite;
	}

	function onChangePlayerRead(val: boolean) {
		setPlayerRead(val);
		changePlayerRuleStatus();
	}

	function onChangePlayerWrite(val: boolean) {
		setPlayerWrite(val);
		changePlayerRuleStatus();
	}

	function onChangePlayerSearchRead(val: boolean) {
		setPlayerSearchRead(val);
	}

	function onChangePlayerSearchWrite(val: boolean) {
		setPlayerSearchWrite(val);
	}

	function onChangeUploadPlayerListRead(val: boolean) {
		setUploadPlayerListRead(val);
	}

	function onChangeUploadPlayerListWrite(val: boolean) {
		setUploadPlayerListWrite(val);
	}

	function onChangeDownloadSearchResultRead(val: boolean) {
		setDownloadSearchResultRead(val);
	}

	function onChangeDownloadSearchResultWrite(val: boolean) {
		setDownloadSearchResultWrite(val);
	}

	function onChangeOutputFilterTemplateRead(val: boolean) {
		setOutputFilterTemplateRead(val);
	}

	function onChangeOutputFilterTemplateWrite(val: boolean) {
		setOutputFilterTemplateWrite(val);
	}

	function onChangePlayerProfileRead(val: boolean) {
		setPlayerProfileRead(val);
		
	}

	function onChangePlayerProfileWrite(val: boolean) {
		setPlayerProfileWrite(val);
	}

	function onChangeSegmentationRead(val: boolean) {
		setSegmentationRead(val);
		changeSegmentationStatus();
	}

	function onChangeSegmentationWrite(val: boolean) {
		setSegmentationWrite(val);
		changeSegmentationStatus();
	}

	function changePlayerRuleStatus() {
		const playerStatusAllFalse = () => {
			setPlayerRead(false);
			setPlayerWrite(false);
			setPlayerSearchRead(false);
			setPlayerSearchWrite(false);
			setUploadPlayerListRead(false);
			setUploadPlayerListWrite(false);
			setDownloadSearchResultRead(false);
			setDownloadSearchResultWrite(false);
			setOutputFilterTemplateRead(false);
			setOutputFilterTemplateWrite(false);
			setPlayerProfileRead(false);
			setPlayerProfileWrite(false);

			setSegmentationRead(false);
			setSegmentationWrite(false);
			setViewContactDetailsLogRead(false);
			setViewContactDetailsLogWrite(false);
			setExportLogtoCSVRead(false);
			setExportLogtoCSVWrite(false);
			setViewSensitiveDataRead(false);
			setViewSensitiveDataWrite(false);
			setSearchLeadsRead(false);
			setSearchLeadsWrite(false);	
			setViewContactDetailsRead(false)
			setViewContactDetailsWrite(false)			
		};
		if (playerClaimRead.checked === true && playerClaimWrite.checked === true) {
			playerSearchClaimRead.disabled = false;
			playerSearchClaimWrite.disabled = false;
			uploadPlayerListClaimRead.disabled = false;
			uploadPlayerListClaimWrite.disabled = false;
			downloadSearchResultClaimRead.disabled = false;
			downloadSearchResultClaimWrite.disabled = false;
			outputFilterTemplateClaimRead.disabled = false;
			outputFilterTemplateClaimWrite.disabled = false;
			playerProfileClaimRead.disabled = false;
			playerProfileClaimWrite.disabled = false;

			segmentationClaimRead.disabled = false;
			segmentationClaimWrite.disabled = false;
			viewContactDetailsLogClaimRead.disabled = false;
			viewContactDetailsLogClaimWrite.disabled = false;
			exportLogtoCSVClaimRead.disabled = false;
			exportLogtoCSVClaimWrite.disabled = false;
			viewSensitiveDataClaimRead.disabled = false;
			viewSensitiveDataClaimWrite.disabled = false;
			searchLeadsClaimRead.disabled = false;
			searchLeadsClaimWrite.disabled = false;
			viewContactDetailsClaimRead.disabled = false;
			viewContactDetailsLogClaimWrite.disabled = false;
			viewContactDetailsClaimRead.disabled = false;
			viewContactDetailsClaimWrite.disabled = false;
		
			playerStatusAllFalse();
		} else if (playerClaimRead.checked === true && playerClaimWrite.checked === false) {
			playerSearchClaimRead.disabled = false;
			playerSearchClaimWrite.disabled = true;
			uploadPlayerListClaimRead.disabled = false;
			uploadPlayerListClaimWrite.disabled = true;
			downloadSearchResultClaimRead.disabled = false;
			downloadSearchResultClaimWrite.disabled = true;
			outputFilterTemplateClaimRead.disabled = false;
			outputFilterTemplateClaimWrite.disabled = true;
			playerProfileClaimRead.disabled = false;
			playerProfileClaimWrite.disabled = true;
			
			segmentationClaimRead.disabled = false;
			segmentationClaimWrite.disabled = true;
			viewContactDetailsLogClaimRead.disabled = false;
			viewContactDetailsLogClaimWrite.disabled = true;
			exportLogtoCSVClaimRead.disabled = false;
			exportLogtoCSVClaimWrite.disabled = true;
			viewSensitiveDataClaimRead.disabled = false;
			viewSensitiveDataClaimWrite.disabled = true;
			searchLeadsClaimRead.disabled = false;
			searchLeadsClaimWrite.disabled = true;
			viewContactDetailsClaimRead.disabled = false;
			viewContactDetailsClaimWrite.disabled = true;

			playerSearchClaimWrite.checked = false;
			uploadPlayerListClaimWrite.checked = false;
			downloadSearchResultClaimWrite.checked = false;
			outputFilterTemplateClaimWrite.checked = false;
			playerProfileClaimWrite.checked = false;
			segmentationClaimWrite.checked = false;
			viewContactDetailsLogClaimWrite.checked = false;
			exportLogtoCSVClaimWrite.checked = false;
			viewSensitiveDataClaimWrite.checked = false;
			searchLeadsClaimWrite.checked = false;
			viewContactDetailsClaimWrite.checked = false;
		

			setPlayerSearchWrite(false);
			setUploadPlayerListWrite(false);
			setDownloadSearchResultWrite(false);
			setOutputFilterTemplateWrite(false);
			setPlayerProfileWrite(false);
			setSegmentationWrite(false);
			setViewContactDetailsLogWrite(false);
			setExportLogtoCSVWrite(false);
			setViewSensitiveDataWrite(false);
			setSearchLeadsWrite(false);
			setViewContactDetailsWrite(false);
			
		} else if (playerClaimRead.checked === false && playerClaimWrite.checked === true) {
			downloadSearchResultClaimRead.disabled = false;
			downloadSearchResultClaimWrite.disabled = false;
			playerSearchClaimRead.disabled = false;
			playerSearchClaimWrite.disabled = false;
			outputFilterTemplateClaimRead.disabled = false;
			outputFilterTemplateClaimWrite.disabled = false;
			playerProfileClaimRead.disabled = false;
			playerProfileClaimWrite.disabled = false;
			
			segmentationClaimRead.disabled = false;
			segmentationClaimWrite.disabled = false;
			viewContactDetailsLogClaimRead.disabled = false;
			viewContactDetailsLogClaimWrite.disabled = false;
			exportLogtoCSVClaimRead.disabled = false;
			exportLogtoCSVClaimWrite.disabled = false;
			uploadPlayerListClaimRead.disabled = false;
			uploadPlayerListClaimWrite.disabled = false;
			viewSensitiveDataClaimRead.disabled = false;
			viewSensitiveDataClaimWrite.disabled = false;
			searchLeadsClaimRead.disabled = false;
			searchLeadsClaimWrite.disabled = false;
			viewContactDetailsClaimRead.disabled = false;
			viewContactDetailsClaimWrite.disabled = false;

			setExportLogtoCSVRead(false);
			setExportLogtoCSVWrite(false);
			setPlayerRead(false);
			setPlayerWrite(false);
			setPlayerSearchRead(false);
			setPlayerSearchWrite(false);
			setDownloadSearchResultRead(false);
			setDownloadSearchResultWrite(false);
			setOutputFilterTemplateRead(false);
			setOutputFilterTemplateWrite(false);
			setPlayerProfileRead(false);
			setPlayerProfileWrite(false);
			setSegmentationRead(false);
			setSegmentationWrite(false);
			setViewContactDetailsLogRead(false);
			setViewContactDetailsLogWrite(false);
			setUploadPlayerListRead(false);
			setUploadPlayerListWrite(false);
			setViewSensitiveDataRead(false);
			setViewSensitiveDataWrite(false);
			setSearchLeadsRead(false);
			setSearchLeadsWrite(false);
			setViewContactDetailsRead(false);
			setViewContactDetailsWrite(false);
					
		} else if (playerClaimRead.checked === false && playerClaimWrite.checked === false) {
			playerSearchClaimRead.disabled = true;
			playerSearchClaimWrite.disabled = true;
			uploadPlayerListClaimRead.disabled = true;
			uploadPlayerListClaimWrite.disabled = true;
			downloadSearchResultClaimRead.disabled = true;
			downloadSearchResultClaimWrite.disabled = true;
			outputFilterTemplateClaimRead.disabled = true;
			outputFilterTemplateClaimWrite.disabled = true;
			playerProfileClaimRead.disabled = true;
			playerProfileClaimWrite.disabled = true;

			segmentationClaimRead.disabled = true;
			segmentationClaimWrite.disabled = true;
			viewContactDetailsLogClaimRead.disabled = true;
			viewContactDetailsLogClaimWrite.disabled = true;
			exportLogtoCSVClaimRead.disabled = true;
			exportLogtoCSVClaimWrite.disabled = true;
			viewSensitiveDataClaimRead.disabled = true;
			viewSensitiveDataClaimWrite.disabled = true;
			searchLeadsClaimRead.disabled = true;
			searchLeadsClaimWrite.disabled = true;
			viewContactDetailsClaimRead.disabled = true;
			viewContactDetailsClaimWrite.disabled = true;
		
			playerSearchClaimRead.checked = false;
			playerSearchClaimWrite.checked = false;
			uploadPlayerListClaimRead.checked = false;
			uploadPlayerListClaimWrite.checked = false;
			downloadSearchResultClaimRead.checked = false;
			downloadSearchResultClaimWrite.checked = false;
			outputFilterTemplateClaimRead.checked = false;
			outputFilterTemplateClaimWrite.checked = false;
			playerProfileClaimRead.checked = false;
			playerProfileClaimWrite.checked = false;
			segmentationClaimRead.checked = false;
			segmentationClaimWrite.checked = false;
			viewContactDetailsLogClaimRead.checked = false;
			viewContactDetailsLogClaimWrite.checked = false;
			exportLogtoCSVClaimRead.checked = false;
			exportLogtoCSVClaimWrite.checked = false;
			viewSensitiveDataClaimRead.checked = false;
			viewSensitiveDataClaimWrite.checked = false;
			searchLeadsClaimRead.checked = false;
			searchLeadsClaimWrite.checked = false;
			viewContactDetailsClaimRead.checked = false;
			viewContactDetailsClaimWrite.checked = false;

			playerStatusAllFalse();
		}
		changeSegmentationStatus();
		changeContactDetailsLog();
	}

	function changeContactDetailsLog() {
		const contactDetailsAllFalse = () => {
			manageThresholdClaimRead.disabled = false;
			manageThresholdClaimWrite.disabled = false;

			setManageThresholdRead(false);
			setManageThresholdWrite(false);
		};

		if (viewContactDetailsLogClaimRead.checked === true && viewContactDetailsLogClaimWrite.checked === true) {
			contactDetailsAllFalse();
		} else if (viewContactDetailsLogClaimRead.checked === true && viewContactDetailsLogClaimWrite.checked === false) {
			manageThresholdClaimRead.disabled = false;
			manageThresholdClaimWrite.disabled = true;
			manageThresholdClaimWrite.checked = false;

			setManageThresholdWrite(false);
		} else if (viewContactDetailsLogClaimRead.checked === false && viewContactDetailsLogClaimWrite.checked === true) {
			contactDetailsAllFalse();
		} else if (viewContactDetailsLogClaimRead.checked === false && viewContactDetailsLogClaimWrite.checked === false) {
			manageThresholdClaimRead.disabled = true;
			manageThresholdClaimWrite.disabled = true;
			manageThresholdClaimRead.checked = false;
			manageThresholdClaimWrite.checked = false;

			setManageThresholdRead(false);
			setManageThresholdWrite(false);
		}
	}
	
	function changeSegmentationStatus() {
		if (segmentationClaimRead.checked === true && segmentationClaimWrite.checked === true) {
			createSegmentationClaimRead.disabled = false;
			createSegmentationClaimWrite.disabled = false;
			manageSegmentationClaimRead.disabled = false;
			manageSegmentationClaimWrite.disabled = false;
			segmentationToStaticClaimRead.disabled = false;
			segmentationToStaticClaimWrite.disabled = false;
			segmentationCustomQueryClaimRead.disabled = false;
			segmentationCustomQueryClaimWrite.disabled = false;

			setCreateSegmentationRead(false);
			setCreateSegmentationWrite(false);
			setManageSegmentationRead(false);
			setManageSegmentationWrite(false);
			setSegmentationToStaticRead(false);
			setSegmentationToStaticWrite(false);
			setSegmentationCustomQueryRead(false);
			setSegmentationCustomQueryWrite(false);
		} else if (segmentationClaimRead.checked === true && segmentationClaimWrite.checked === false) {
			createSegmentationClaimRead.disabled = false;
			createSegmentationClaimWrite.disabled = true;
			manageSegmentationClaimRead.disabled = false;
			manageSegmentationClaimWrite.disabled = true;
			segmentationToStaticClaimRead.disabled = false;
			segmentationToStaticClaimWrite.disabled = true;
			createSegmentationClaimWrite.checked = false;
			manageSegmentationClaimWrite.checked = false;
			segmentationToStaticClaimWrite.checked = false;
			segmentationCustomQueryClaimRead.disabled = false;
			segmentationCustomQueryClaimWrite.disabled = true;
			segmentationCustomQueryClaimWrite.checked = false;

			setCreateSegmentationWrite(false);
			setManageSegmentationWrite(false);
			setSegmentationToStaticWrite(false);
			setSegmentationCustomQueryWrite(false);
		} else if (segmentationClaimRead.checked === false && segmentationClaimWrite.checked === true) {
			createSegmentationClaimRead.disabled = false;
			createSegmentationClaimWrite.disabled = false;
			manageSegmentationClaimRead.disabled = false;
			manageSegmentationClaimWrite.disabled = false;
			segmentationToStaticClaimRead.disabled = false;
			segmentationToStaticClaimWrite.disabled = false;
			segmentationCustomQueryClaimRead.disabled = false;
			segmentationCustomQueryClaimWrite.disabled = false;

			setCreateSegmentationRead(false);
			setCreateSegmentationWrite(false);
			setManageSegmentationWrite(false);
			setManageSegmentationRead(false);
			setSegmentationToStaticRead(false);
			setSegmentationToStaticWrite(false);
			setSegmentationCustomQueryRead(false);
			setSegmentationCustomQueryWrite(false);
		} else if (segmentationClaimRead.checked === false && segmentationClaimWrite.checked === false) {
			createSegmentationClaimRead.disabled = true;
			createSegmentationClaimWrite.disabled = true;
			createSegmentationClaimRead.checked = false;
			createSegmentationClaimWrite.checked = false;
			manageSegmentationClaimRead.disabled = true;
			manageSegmentationClaimWrite.disabled = true;

			manageSegmentationClaimRead.checked = false;
			manageSegmentationClaimWrite.checked = false;
			segmentationToStaticClaimRead.checked = false;
			segmentationToStaticClaimWrite.checked = false;
			segmentationCustomQueryClaimRead.checked = false;
			segmentationCustomQueryClaimWrite.checked = false;
			segmentationToStaticClaimRead.disabled = true;
			segmentationToStaticClaimWrite.disabled = true;
			segmentationCustomQueryClaimRead.disabled = true;
			segmentationCustomQueryClaimWrite.disabled = true;

			setCreateSegmentationRead(false);
			setCreateSegmentationWrite(false);
			setManageSegmentationRead(false);
			setManageSegmentationWrite(false);
			setSegmentationToStaticRead(false);
			setSegmentationToStaticWrite(false);
			setSegmentationCustomQueryRead(false);
			setSegmentationCustomQueryWrite(false);
		}
	}

	function onChangeCreateSegmentationRead(val: boolean) {
		setCreateSegmentationRead(val);
	}

	function onChangeCreateSegmentationWrite(val: boolean) {
		setCreateSegmentationWrite(val);
	}

	function onChangeManageSegmentationRead(val: boolean) {
		setManageSegmentationRead(val);
	}

	function onChangeManageSegmentationWrite(val: boolean) {
		setManageSegmentationWrite(val);
	}

	function onChangeSegmentationToStaticRead(val: boolean) {
		setSegmentationToStaticRead(val);
	}

	function onChangeSegmentationToStaticWrite(val: boolean) {
		setSegmentationToStaticWrite(val);
	}

	function onChangeSegmentationCustomQueryRead(val: boolean) {
		setSegmentationCustomQueryRead(val);
	}

	function onChangeSegmentationCustomQueryWrite(val: boolean) {
		setSegmentationCustomQueryWrite(val);
	}

	// View Contact Details Log
	function onChangeContactDetailsLogRead(val: boolean) {
		setViewContactDetailsLogRead(val);
		changeContactDetailsLog();
	}

	function onChangeContactDetailsLogWrite(val: boolean) {
		setViewContactDetailsLogWrite(val);
		changeContactDetailsLog();
	}

	function onChangeManageThresholdRead(val: boolean) {
		setManageThresholdRead(val);
	}

	function onChangeManageThresholdWrite(val: boolean) {
		setManageThresholdWrite(val);
	}

	function onChangeExportLogtoCSVRead(val: boolean) {
		setExportLogtoCSVRead(val);
	}

	function onChangeExportLogtoCSVWrite(val: boolean) {
		setExportLogtoCSVWrite(val);
	}
	function onChangeViewSensitiveDataRead(val: boolean) {
		setViewSensitiveDataRead(val);
	}
	function onChangeViewSensitiveDataWrite(val: boolean) {
		setViewSensitiveDataWrite(val);
	}

	// Search Leads
	function onChangeSearchLeadsRead(val: boolean) {
		setSearchLeadsRead(val);
	}

	function onChangeSearchLeadsWrite(val: boolean) {
		setSearchLeadsWrite(val);
	}

	
	function onChangeViewContactDetailsRead(val: boolean) {
		setViewContactDetailsRead(val);
	}

	function onChangeViewContactDetailsWrite(val: boolean) {
		setViewContactDetailsWrite(val);
	}

	return (
		<>
			<Card.Header className='accordion-header' style={CardHeaderEditStyles}>
				<Accordion.Toggle as={Button} variant='link' eventKey='1'>
					<FontAwesomeIcon icon={faUser} /> {SECURABLE_NAMES.Player}
				</Accordion.Toggle>
				<div className='d-flex align-items-center my-2'>
					<div className='col-sm-7'>
						<div className='form-check form-switch form-check-custom form-check-solid'>
							<ToggleComponent
								toggleId='playerClaimRead'
								toggleTagging='Read'
								toggleChange={onChangePlayerRead}
								toggleDefaultValue={playerRead}
								isDisabled={false}
							/>
						</div>
					</div>
					<div className='col'>
						<div className='form-check form-switch form-check-custom form-check-solid'>
							<ToggleComponent
								toggleId='playerClaimWrite'
								toggleTagging='Write'
								toggleChange={onChangePlayerWrite}
								toggleDefaultValue={playerWrite}
								isDisabled={false}
							/>
						</div>
					</div>
				</div>
			</Card.Header>
			<Accordion.Collapse eventKey='1'>
				<Card.Body className='accordion-body' style={CardBodyEditStyles}>
					<Accordion defaultActiveKey='0' className='accordion'>
						<Card>
							<Card.Header className='accordion-header'>
								<Accordion.Toggle as={Button} variant='link' eventKey='0'>
									<FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.PlayerSearch}
								</Accordion.Toggle>
								<div className='d-flex align-items-center my-2'>
									<div className='col-sm-7'>
										<div className='form-check form-switch form-check-custom form-check-solid'>
											<ToggleComponent
												toggleId='playerSearchClaimRead'
												toggleTagging='Read'
												toggleChange={onChangePlayerSearchRead}
												toggleDefaultValue={playerSearchRead}
												isDisabled={true}
											/>
										</div>
									</div>
									<div className='col'>
										<div className='form-check frm-wrte form-switch form-check-custom form-check-solid elem-role-edit'>
											<ToggleComponent
												toggleId='playerSearchClaimWrite'
												toggleChange={onChangePlayerSearchWrite}
												toggleDefaultValue={playerSearchWrite}
												toggleTagging='Write'
												isDisabled={true}
											/>
										</div>
									</div>
								</div>
							</Card.Header>
						</Card>
						<Card>
							<Card.Header className='accordion-header'>
								<Accordion.Toggle as={Button} variant='link' eventKey='1'>
									<FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.ImportPlayerList}
								</Accordion.Toggle>
								<div className='d-flex align-items-center my-2 '>
									<div className='col-sm-7'>
										<div className='form-check form-switch form-check-custom form-check-solid elem-role-edit'>
											<ToggleComponent
												toggleId='uploadPlayerListClaimRead'
												toggleChange={onChangeUploadPlayerListRead}
												toggleDefaultValue={uploadPlayerListRead}
												toggleTagging='Read'
												isDisabled={true}
											/>
										</div>
									</div>
									<div className='col'>
										<div className='form-check form-switch form-check-custom form-check-solid elem-role-edit'>
											<ToggleComponent
												toggleId='uploadPlayerListClaimWrite'
												toggleChange={onChangeUploadPlayerListWrite}
												toggleDefaultValue={uploadPlayerListWrite}
												toggleTagging='Write'
												isDisabled={true}
											/>
										</div>
									</div>
								</div>
							</Card.Header>
						</Card>
						<Card>
							<Card.Header className='accordion-header'>
								<Accordion.Toggle as={Button} variant='link' eventKey='2'>
									<FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.DownloadSearchResult}
								</Accordion.Toggle>
								<div className='d-flex align-items-center my-2'>
									<div className='col-sm-7'>
										<div className='form-check form-switch frm-rd form-check-custom form-check-solid'>
											<ToggleComponent
												toggleId='downloadSearchResultClaimRead'
												toggleChange={onChangeDownloadSearchResultRead}
												toggleDefaultValue={downloadSearchResultRead}
												toggleTagging='Read'
												isDisabled={true}
											/>
										</div>
									</div>
									<div className='col'>
										<div className='form-check form-switch form-check-custom form-check-solid'>
											<ToggleComponent
												toggleId='downloadSearchResultClaimWrite'
												toggleChange={onChangeDownloadSearchResultWrite}
												toggleDefaultValue={downloadSearchResultWrite}
												toggleTagging='Write'
												isDisabled={true}
											/>
										</div>
									</div>
								</div>
							</Card.Header>
						</Card>
						<Card>
							<Card.Header className='accordion-header edit-user-div'>
								<Accordion.Toggle as={Button} variant='link' eventKey='3'>
									<FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.OutputFilterTemplate}
								</Accordion.Toggle>
								<div className='d-flex align-items-center my-2'>
									<div className='col-sm-7'>
										<div className='form-check form-switch form-check-custom form-check-solid'>
											<ToggleComponent
												toggleId='outputFilterTemplateClaimRead'
												toggleChange={onChangeOutputFilterTemplateRead}
												toggleDefaultValue={outputFilterTemplateRead}
												toggleTagging='Read'
												isDisabled={true}
											/>
										</div>
									</div>
									<div className='col'>
										<div className='form-check form-switch form-check-custom form-check-solid'>
											<ToggleComponent
												toggleId='outputFilterTemplateClaimWrite'
												toggleChange={onChangeOutputFilterTemplateWrite}
												toggleDefaultValue={outputFilterTemplateWrite}
												toggleTagging='Write'
												isDisabled={true}
											/>
										</div>
									</div>
								</div>
							</Card.Header>
						</Card>
						<Card>
							<Card.Header className='accordion-header form-edit'>
								<Accordion.Toggle as={Button} variant='link' eventKey='4'>
									<FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.PlayerProfile}
								</Accordion.Toggle>
								<div className='d-flex align-items-center my-2'>
									<div className='col-sm-7'>
										<div className='form-check form-switch form-check-custom form-check-solid'>
											<ToggleComponent
												toggleId='playerProfileClaimRead'
												toggleChange={onChangePlayerProfileRead}
												toggleDefaultValue={playerProfileRead}
												toggleTagging='Read'
												isDisabled={true}
											/>
										</div>
									</div>
									<div className='col'>
										<div className='form-check form-switch form-check-custom form-check-solid'>
											<ToggleComponent
												toggleId='playerProfileClaimWrite'
												toggleChange={onChangePlayerProfileWrite}
												toggleDefaultValue={playerProfileWrite}
												toggleTagging='Write'
												isDisabled={true}
											/>
										</div>
									</div>
								</div>
							</Card.Header>
						</Card>
						<Card>
							<Card.Header className='accordion-header'>
								<Accordion.Toggle as={Button} variant='link' eventKey='5'>
									<FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.Segmentation}
								</Accordion.Toggle>
								<div className='d-flex align-items-center my-2'>
									<div className='col-sm-7'>
										<div className='form-check form-switch form-check-custom form-check-solid'>
											<ToggleComponent
												toggleId='segmentationClaimRead'
												toggleChange={onChangeSegmentationRead}
												toggleDefaultValue={segmentationRead}
												toggleTagging='Read'
												isDisabled={true}
											/>
										</div>
									</div>
									<div className='col'>
										<div className='form-check form-switch form-check-custom form-check-solid'>
											<ToggleComponent
												toggleId='segmentationClaimWrite'
												toggleChange={onChangeSegmentationWrite}
												toggleDefaultValue={segmentationWrite}
												toggleTagging='Write'
												isDisabled={true}
											/>
										</div>
									</div>
								</div>
							</Card.Header>
							<Accordion.Collapse eventKey='5'>
								<Card.Body className='accordion-body' style={CardBodyEditStyles}>
									{/* Create Segmenatation */}
									<div className='row mb-3'>
										<div className='d-flex align-items-center my-2'>
											<div className='col-sm-10'>
												<div className='form-label-sm'>{SECURABLE_NAMES.CreateSegmentation}</div>
											</div>
											<div className='col-sm-1'>
												<div className='form-check form-switch form-check-custom form-check-solid'>
													<ToggleComponent
														toggleId='createSegmentationClaimRead'
														toggleChange={onChangeCreateSegmentationRead}
														toggleDefaultValue={createSegmentationRead}
														toggleTagging='Read'
														isDisabled={true}
													/>
												</div>
											</div>
											<div className='col'>
												<div className='form-check form-switch form-check-custom form-check-solid'>
													<ToggleComponent
														toggleId='createSegmentationClaimWrite'
														toggleChange={onChangeCreateSegmentationWrite}
														toggleDefaultValue={createSegmentationWrite}
														toggleTagging='Write'
														isDisabled={true}
													/>
												</div>
											</div>
										</div>
									</div>
									{/* Manage Segmenatation */}
									<div className='row mb-3'>
										<div className='d-flex align-items-center my-2'>
											<div className='col-sm-10'>
												<div className='form-label-sm'>{SECURABLE_NAMES.ManageSegmentation}</div>
											</div>
											<div className='col-sm-1'>
												<div className='form-check form-switch frm-sgment form-check-custom form-check-solid'>
													<ToggleComponent
														toggleId='manageSegmentationClaimRead'
														toggleChange={onChangeManageSegmentationRead}
														toggleDefaultValue={manageSegmentationRead}
														toggleTagging='Read'
														isDisabled={true}
													/>
												</div>
											</div>
											<div className='col'>
												<div className='form-check form-switch form-check-custom form-check-solid'>
													<ToggleComponent
														toggleId='manageSegmentationClaimWrite'
														toggleChange={onChangeManageSegmentationWrite}
														toggleDefaultValue={manageSegmentationWrite}
														toggleTagging='Write'
														isDisabled={true}
													/>
												</div>
											</div>
										</div>
									</div>
									{/* Static Segmenatation */}
									<div className='row mb-3'>
										<div className='d-flex align-items-center my-2'>
											<div className='col-sm-10'>
												<div className='form-label-sm'>{SECURABLE_NAMES.SetSegmentationToStatic}</div>
											</div>
											<div className='col-sm-1'>
												<div className='form-check form-switch form-check-custom form-check-solid'>
													<ToggleComponent
														toggleId='segmentationToStaticClaimRead'
														toggleChange={onChangeSegmentationToStaticRead}
														toggleDefaultValue={segmentationToStaticRead}
														toggleTagging='Read'
														isDisabled={true}
													/>
												</div>
											</div>
											<div className='col'>
												<div className='form-check form-switch form-check-custom form-check-solid'>
													<ToggleComponent
														toggleId='segmentationToStaticClaimWrite'
														toggleChange={onChangeSegmentationToStaticWrite}
														toggleDefaultValue={segmentationToStaticWrite}
														toggleTagging='Write'
														isDisabled={true}
													/>
												</div>
											</div>
										</div>
									</div>
									{/* Create Custom Query */}
									<div className='row mb-3'>
										<div className='d-flex align-items-center my-2'>
											<div className='col-sm-10'>
												<div className='form-label-sm'>{SECURABLE_NAMES.CreateCustomQuery}</div>
											</div>

											<div className='col-sm-1'>
												<div className='form-check form-switch form-check-custom form-check-solid'>
													<ToggleComponent
														toggleId='segmentationCustomQueryClaimRead'
														toggleChange={onChangeSegmentationCustomQueryRead}
														toggleDefaultValue={segmentationCustomQueryRead}
														toggleTagging='Read'
														isDisabled={true}
													/>
												</div>
											</div>
											<div className='col'>
												<div className='form-check form-switch form-check-custom form-check-solid'>
													<ToggleComponent
														toggleId='segmentationCustomQueryClaimWrite'
														toggleChange={onChangeSegmentationCustomQueryWrite}
														toggleDefaultValue={segmentationCustomQueryWrite}
														toggleTagging='Write'
														isDisabled={true}
													/>
												</div>
											</div>
										</div>
									</div>
								</Card.Body>
							</Accordion.Collapse>
						</Card>

						{/* View Contact Details Log */}
						<Card>
							<Card.Header className='accordion-header form-edit'>
								<Accordion.Toggle as={Button} variant='link' eventKey='6'>
									<FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.ViewContactDetailsLog}
								</Accordion.Toggle>
								<div className='d-flex align-items-center my-2'>
									<div className='col-sm-7'>
										<div className='form-check form-switch form-check-custom form-check-solid'>
											<ToggleComponent
												toggleId='viewContactDetailsLogClaimRead'
												toggleChange={onChangeContactDetailsLogRead}
												toggleDefaultValue={viewContactDetailsLogRead}
												toggleTagging='Read'
												isDisabled={true}
											/>
										</div>
									</div>
									<div className='col'>
										<div className='form-check form-switch form-check-custom form-check-solid'>
											<ToggleComponent
												toggleId='viewContactDetailsLogClaimWrite'
												toggleChange={onChangeContactDetailsLogWrite}
												toggleDefaultValue={viewContactDetailsLogWrite}
												toggleTagging='Write'
												isDisabled={true}
											/>
										</div>
									</div>
								</div>
							</Card.Header>
							<Accordion.Collapse eventKey='6'>
								<Card.Body className='accordion-body' style={CardBodyEditStyles}>
									{/* Manage Threshold */}
									<div className='row mb-3'>
										<div className='d-flex align-items-center my-2'>
											<div className='col-sm-10'>
												<div className='form-label-sm'>{SECURABLE_NAMES.ManageThreshold}</div>
											</div>

											<div className='col-sm-1'>
												<div className='form-check form-switch form-check-custom form-check-solid'>
													<ToggleComponent
														toggleId='manageThresholdClaimRead'
														toggleChange={onChangeManageThresholdRead}
														toggleDefaultValue={manageThresholdRead}
														toggleTagging='Read'
														isDisabled={true}
													/>
												</div>
											</div>
											<div className='col'>
												<div className='form-check form-switch form-check-custom form-check-solid'>
													<ToggleComponent
														toggleId='manageThresholdClaimWrite'
														toggleChange={onChangeManageThresholdWrite}
														toggleDefaultValue={manageThresholdWrite}
														toggleTagging='Write'
														isDisabled={true}
													/>
												</div>
											</div>
										</div>
									</div>
								</Card.Body>
							</Accordion.Collapse>
						</Card>

						{/* Export Log to CSV */}
						<Card>
							<Card.Header className='accordion-header form-edit'>
								<Accordion.Toggle as={Button} variant='link' eventKey='7'>
									<FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.ExportLogtoCSV}
								</Accordion.Toggle>
								<div className='d-flex align-items-center my-2'>
									<div className='col-sm-7'>
										<div className='form-check form-switch form-check-custom form-check-solid'>
											<ToggleComponent
												toggleId='exportLogtoCSVClaimRead'
												toggleChange={onChangeExportLogtoCSVRead}
												toggleDefaultValue={exportLogtoCSVRead}
												toggleTagging='Read'
												isDisabled={true}
											/>
										</div>
									</div>
									<div className='col'>
										<div className='form-check form-switch form-check-custom form-check-solid'>
											<ToggleComponent
												toggleId='exportLogtoCSVClaimWrite'
												toggleChange={onChangeExportLogtoCSVWrite}
												toggleDefaultValue={exportLogtoCSVWrite}
												toggleTagging='Write'
												isDisabled={true}
											/>
										</div>
									</div>
								</div>
							</Card.Header>
						</Card>

						{/* View Sensitive Data */}
						<Card>
							<Card.Header className='accordion-header form-edit'>
								<Accordion.Toggle as={Button} variant='link' eventKey='7'>
									<FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.ViewSensitiveData}
								</Accordion.Toggle>
								<div className='d-flex align-items-center my-2'>
									<div className='col-sm-7'>
										<div className='form-check form-switch form-check-custom form-check-solid'>
											<ToggleComponent
												toggleId='viewSensitiveDataClaimRead'
												toggleChange={onChangeViewSensitiveDataRead}
												toggleDefaultValue={viewSensitiveDataRead}
												toggleTagging='Read'
												isDisabled={true}
											/>
										</div>
									</div>
									<div className='col'>
										<div className='form-check form-switch form-check-custom form-check-solid'>
											<ToggleComponent
												toggleId='viewSensitiveDataClaimWrite'
												toggleChange={onChangeViewSensitiveDataWrite}
												toggleDefaultValue={viewSensitiveDataWrite}
												toggleTagging='Write'
												isDisabled={true}
											/>
										</div>
									</div>
								</div>
							</Card.Header>
						</Card>
						{/* Search Leads */}
						<Card>
							<Card.Header className='accordion-header'>
								<Accordion.Toggle as={Button} variant='link' eventKey='8'>
									<FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.SearchLeads}
								</Accordion.Toggle>
								<div className='d-flex align-items-center my-2'>
									<div className='col-sm-7'>
										<div className='form-check form-switch form-check-custom form-check-solid'>
											<ToggleComponent
												toggleId='searchLeadsClaimRead'
												toggleChange={onChangeSearchLeadsRead}
												toggleDefaultValue={searchLeadsRead}
												toggleTagging='Read'
												isDisabled={true}
											/>
										</div>
									</div>
									<div className='col'>
										<div className='form-check form-switch form-check-custom form-check-solid'>
											<ToggleComponent
												toggleId='searchLeadsClaimWrite'
												toggleChange={onChangeSearchLeadsWrite}
												toggleDefaultValue={searchLeadsWrite}
												toggleTagging='Write'
												isDisabled={true}
											/>
										</div>
									</div>
								</div>
							</Card.Header>							
						</Card>	
						{/* View Contact Details */}
						<Card>
							<Card.Header className='accordion-header form-edit'>
								<Accordion.Toggle as={Button} variant='link' eventKey='4'>
									<FontAwesomeIcon icon={faCircle} /> {SECURABLE_NAMES.ViewContactDetails}
								</Accordion.Toggle>
								<div className='d-flex align-items-center my-2'>
									<div className='col-sm-7'>
										<div className='form-check form-switch form-check-custom form-check-solid'>
											<ToggleComponent
												toggleId='viewContactDetailsClaimRead'
												toggleChange={onChangeViewContactDetailsRead}
												toggleDefaultValue={viewContactDetailsRead}
												toggleTagging='Read'
												isDisabled={true}
											/>
										</div>
									</div>
									<div className='col'>
										<div className='form-check form-switch form-check-custom form-check-solid'>
											<ToggleComponent
												toggleId='viewContactDetailsClaimWrite'
												toggleChange={onChangeViewContactDetailsWrite}
												toggleDefaultValue={viewContactDetailsWrite}
												toggleTagging='Write'
												isDisabled={true}
											/>
										</div>
									</div>
								</div>
							</Card.Header>
						</Card>					
					</Accordion>
				</Card.Body>
			</Accordion.Collapse>
		</>
	);
};

export default PlayerManagementSecurableObjects;
