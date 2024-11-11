import React, {useState, useEffect} from 'react';
import {MessageResponseOptionModel, OptionListModel} from '../../../common/model';
import {GetMessageResponseOptionById} from '../../../common/services';

export default function useMessageResponseOption(messageStatusId: number) {
	// -----------------------------------------------------------------
	// STATE
	// -----------------------------------------------------------------
	const [messageResponseOptionList, setMessageResponseOptionList] = useState<Array<OptionListModel>>([]);

	// -----------------------------------------------------------------
	// FIRST MOUNT OF COMPONENT
	// -----------------------------------------------------------------
	useEffect(() => {
		if (messageStatusId !== 0) {
			GetMessageResponseOptionById(messageStatusId)
				.then((response) => {
					if (response.status === 200) {
						let messageResponse = Object.assign(new Array<MessageResponseOptionModel>(), response.data);

						let tempList = Array<OptionListModel>();

						messageResponse.forEach((item) => {
							const OptionValue: OptionListModel = {
								value: item.messageResponseId,
								label: item.messageResponseName,
							};
							tempList.push(OptionValue);
						});

						setMessageResponseOptionList(tempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
					} else {
						// disableSplashScreen()
						console.log('Problem in message response list');
					}
				})
				.catch(() => {
					//disableSplashScreen()
					console.log('Problem in message response list');
				});
		}
	}, [messageStatusId]);

	return messageResponseOptionList;
}
