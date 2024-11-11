import React, {useState} from 'react';
import DynamicAccordion from '../DynamicAccordion';
import {GenerateCommunicationReviewList} from '../../services/CommunicationReviewReportApi';
import {CommunicationReviewAccordionModel} from '../models/CommunicationReviewAccordionModel';
import {disableSplashScreen} from '../../../../utils/helper';
import swal from 'sweetalert';
import {Max_Open_Accordion} from '../../constants/ReportConstants';
import CommunicationReviewIndividualList from '../CommunicationReviewIndividualList';
import {CommReviewReportFilterRequestModel} from '../models/requests/CommReviewReportFilterRequestModel';

interface TeamListingProps {
	teamData: CommunicationReviewAccordionModel;
	request: CommReviewReportFilterRequestModel;
}

const CommReviewTeamListing = ({teamData, request}: TeamListingProps) => {
	const [groupListing, setGroupListing] = useState<CommunicationReviewAccordionModel[]>([]);
	const [paramBundle, setParamBundle] = useState<any>();
	const [teamAccordion, setTeamAccordion] = useState<CommunicationReviewAccordionModel>(teamData);

	const handleTeamAccordion = (id: number, toggleStatus: boolean) => {
		const updatedRequest = {...request, revieweeTeamIds: id.toString(), displayType: 'Individual'};
		setTeamAccordion({...teamAccordion, isOpen: !teamAccordion.isOpen});
		GenerateCommunicationReviewList(updatedRequest)
			.then(({data}) => {
				let result: CommunicationReviewAccordionModel[] = data.reduce((acc: any, curr: any) => {
					acc.push({
						accordionIndex: acc.length,
						headerId: curr.id,
						header: curr.name,
						recordCount: curr.recordCount,
						isOpen: false,
					});
					return acc;
				}, []);
				setGroupListing(result);
				setParamBundle(request);
				disableSplashScreen();
			})
			.catch((err) => {
				swal('Failed', 'Problem in exporting list', 'error');
				disableSplashScreen();
			});
	};

	const handleOpenAccordion = (accordionIndex: number, accordionStatus: boolean) => {
		if (accordionStatus) {
			defaultAccordionAction(accordionIndex);
			return;
		}
		const validateIfMaxOpenAccordion = groupListing.filter((reviewee: any) => reviewee.isOpen === true);

		if (validateIfMaxOpenAccordion.length === Max_Open_Accordion) {
			const findAccordiontoClose: CommunicationReviewAccordionModel = validateIfMaxOpenAccordion.reduce((acc: any, curr: any) => {
				return acc.accordionIndex < curr.accordionIndex ? acc : curr;
			});
			modifiedAccortionAction(findAccordiontoClose, accordionIndex);
		} else {
			defaultAccordionAction(accordionIndex);
		}
	};

	const modifiedAccortionAction = (findAccordiontoClose: CommunicationReviewAccordionModel, accordionIndex: number) => {
		const updateAccordion = groupListing.map((accordion: CommunicationReviewAccordionModel, idx: number) => {
			if (accordion === findAccordiontoClose) {
				return {...accordion, isOpen: false};
			}
			if (idx === accordionIndex) {
				return {...accordion, isOpen: true};
			} else return accordion;
		});
		setGroupListing(updateAccordion);
	};

	const defaultAccordionAction = (accordionIndex: number) => {
		const updateAccordion = groupListing.map((accordion: CommunicationReviewAccordionModel, idx: number) => {
			if (idx === accordionIndex) {
				return {...accordion, isOpen: !accordion.isOpen};
			} else return accordion;
		});
		setGroupListing(updateAccordion);
	};

	return (
		<DynamicAccordion
			toggle={teamAccordion.isOpen}
			title={teamAccordion.header}
			idx={teamAccordion.accordionIndex}
			id={teamAccordion.headerId}
			counter={teamAccordion.recordCount}
			toggleClick={() => {
				handleTeamAccordion(teamAccordion.headerId, teamAccordion.isOpen);
			}}
		>
			<div className='d-flex flex-column w-100'>
				<CommunicationReviewIndividualList accordionList={groupListing} accordionToggle={handleOpenAccordion} request={paramBundle} />
			</div>
		</DynamicAccordion>
	);
};

export default CommReviewTeamListing;
