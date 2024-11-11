export interface CommunicationReviewScoreData {
    periodName: string,
    reviewer: string,
    reviewee: string,
    revieweeTeamName: string,
    reviewID: number | string,
    communicationID: number | string,
    externalID: string,
    reviewScore: string,
    reviewBenchmark: string,
    reviewDate: string,
}

export function CommunicationReviewScoreDataModelFactory() {
	const initialScoreData: CommunicationReviewScoreData = {
		periodName: '',
        reviewer: '',
        reviewee: '',
        revieweeTeamName: '',
        reviewID: '',
        communicationID: '',
        externalID: '',
        reviewScore: '',
        reviewBenchmark: '',
        reviewDate: '',
	};

	return initialScoreData;
}