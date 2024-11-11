import React from 'react';
import {CommunicationReviewAccordionModel} from './models/CommunicationReviewAccordionModel';
import {CommReviewReportFilterRequestModel} from './models/requests/CommReviewReportFilterRequestModel';
import CommReviewTeamListing from './groupings/CommReviewTeamListing';

interface CommReviewListProps {
	accordionList: CommunicationReviewAccordionModel[];
	request: CommReviewReportFilterRequestModel;
}
const CommunicationReviewGroupList = ({accordionList = [], request}: CommReviewListProps) => {
	return (
		<>
			{accordionList.map((team: any, idx: number) => {
				let elIndex = idx;
				return <CommReviewTeamListing key={elIndex} teamData={team} request={request} />;
			})}
		</>
	);
};

export default CommunicationReviewGroupList;
