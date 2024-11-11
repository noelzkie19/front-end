import React from 'react';
import DynamicAccordion from './DynamicAccordion';
import CommunicationReviewReportGrid from './CommunicationReviewReportGrid';
import {CommunicationReviewAccordionModel} from './models/CommunicationReviewAccordionModel';
import {CommReviewReportFilterRequestModel} from './models/requests/CommReviewReportFilterRequestModel';

interface CommReviewListProps {
	accordionList: CommunicationReviewAccordionModel[];
	accordionToggle: (idx: number, status: boolean, id: number) => void;
	request: CommReviewReportFilterRequestModel;
}

const CommunicationReviewIndividualList = ({accordionList = [], accordionToggle, request}: CommReviewListProps) => {
	return (
		<>
			{accordionList.map((reviewee: any, idx: number) => {
				let elIndex = idx;
				return (
					<div key={elIndex}>
						<DynamicAccordion
							toggle={reviewee.isOpen}
							title={reviewee.header}
							counter={reviewee.recordCount}
							idx={reviewee.accordionIndex}
							id={reviewee.headerId}
							toggleClick={accordionToggle}
						>
							<CommunicationReviewReportGrid
								targetRevieweeId={reviewee.headerId}
								accordionIdx={reviewee.accordionIndex}
								showGrid={reviewee.isOpen}
								request={request}
							/>
						</DynamicAccordion>
					</div>
				);
			})}
		</>
	);
};

export default CommunicationReviewIndividualList;
