export interface CommunicationReviewRemarks {
    reviewPeriodName: string,
    reviewer: string,
    reviewee: string,
    revieweeTeamName: string,
    reviewID: number | string,
    communicationID: number | string,
    externalID: string,
    topic: string,
    ranking: string,
    measurementName: string,
    code: string,
    score: string,
    criteria: string,
    additionalRemark: string,
    suggestion: string,
    reviewDate: string,
}

export function CommunicationReviewRemarksModelFactory() {
	const initialRemarksData: CommunicationReviewRemarks = {
        reviewPeriodName: '',
        reviewer: '',
        reviewee: '',
        revieweeTeamName: '',
        reviewID: '',
        communicationID: '',
        externalID: '',
        topic: '',
        ranking: '',
        measurementName:  '',
        code: '',
        score:  '',
        criteria: '',
        additionalRemark: '',
        suggestion: '',
        reviewDate: '',
	};

	return initialRemarksData;
}