import React, {useState, useEffect} from 'react';
import {FeedbackAnswerOptionModel, OptionListModel} from '../../../common/model';
import {GetFeedbackAnswerOptionById} from '../../../common/services';

export default function useFeedbackAnswerOption(feedbackCategoryId: number) {
	// -----------------------------------------------------------------
	// STATE
	// -----------------------------------------------------------------
	const [feedbackAnswerOptionList, setFeedbackAnswerOptionList] = useState<Array<OptionListModel>>([]);

	// -----------------------------------------------------------------
	// FIRST MOUNT OF COMPONENT
	// -----------------------------------------------------------------
	useEffect(() => {
		if (feedbackCategoryId !== 0) {
			GetFeedbackAnswerOptionById({feedbackTypeId: '', feedbackCategoryId: feedbackCategoryId.toString(), feedbackFilter: ''})
				.then((response) => {
					if (response.status === 200) {
						let subTopics = Object.assign(new Array<FeedbackAnswerOptionModel>(), response.data);

						let tempList = Array<OptionListModel>();

						subTopics.forEach((item) => {
							const OptionValue: OptionListModel = {
								value: item.feedbackAnswerId,
								label: item.feedbackAnswerName,
							};
							tempList.push(OptionValue);
						});

						setFeedbackAnswerOptionList(tempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
					} else {
						// disableSplashScreen()
						console.log('Problem in category list');
					}
				})
				.catch(() => {
					//disableSplashScreen()
					console.log('Problem in category list');
				});
		}
	}, [feedbackCategoryId]);

	return feedbackAnswerOptionList;
}
