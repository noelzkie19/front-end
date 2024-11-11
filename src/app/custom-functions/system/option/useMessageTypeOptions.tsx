import React, {useState, useEffect} from 'react';
import {MessageTypeOptionModel, OptionListModel} from '../../../common/model';
import {GetMessageTypeOptionList} from '../../../common/services';

export default function useMessageTypeOptions(channelTypeId?: string) {
	// -----------------------------------------------------------------
	// STATE
	// -----------------------------------------------------------------
	const [messageTypeOptionList, setMessageTypeOptionList] = useState<Array<OptionListModel>>([]);

	// -----------------------------------------------------------------
	// FIRST MOUNT OF COMPONENT
	// -----------------------------------------------------------------
	useEffect(() => {
		GetMessageTypeOptionList(channelTypeId)
			.then((response) => {
				if (response.status === 200) {
					let subTopics = Object.assign(new Array<MessageTypeOptionModel>(), response.data);

					let tempList = Array<OptionListModel>();

					subTopics.forEach((item) => {
						const OptionValue: OptionListModel = {
							value: item.messageTypeId,
							label: item.messageTypeName,
						};
						tempList.push(OptionValue);
					});

					setMessageTypeOptionList(tempList.filter((thing, i, arr) => arr.findIndex((t) => t.value === thing.value) === i));
				} else {
					// disableSplashScreen()
					console.log('Problem in message type list');
				}
			})
			.catch(() => {
				//disableSplashScreen()
				console.log('Problem in message type brand list');
			});
	}, []);

	return messageTypeOptionList;
}
