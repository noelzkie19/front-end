// Information:
// This reusable hook will display list of message type with channel type = contact details and are active from System > Codelist > Message Type
// Columns returned:
//
// MessageTypeId
// MessageTypeName
// Position

import {useEffect, useState} from 'react';
import {OptionListModel} from '../../../../common/model';
import useConstant from '../../../../constants/useConstant';
import {MessageTypeContactDetailsResponse} from '../../models/response/MessageTypeContactDetailsResponse';
import {GetMessageTypeChannelList} from '../../services/RemProfileApi';

const useMessageTypeContactDetails = () => {
	const [messageTypeList, setMessageTypeList] = useState<Array<OptionListModel>>([]);
	const {successResponse} = useConstant();

	useEffect(() => {
		GetMessageTypeChannelList()
			.then((response) => {
				if (response.status === successResponse) {
					let messageTypeListData = Object.assign(new Array<MessageTypeContactDetailsResponse>(), response.data);
					let optionTempList = Array<OptionListModel>();

					messageTypeListData
						.sort((a: any, b: any) => (a.position > b.position ? 1 : -1))
						.forEach((item) => {
							const tempOption: OptionListModel = {
								value: item.messageTypeId.toString(),
								label: item.messageTypeName,
							};
							optionTempList.push(tempOption);
						});

					setMessageTypeList(optionTempList);
				} else {
					console.log('Problem loading message type list');
				}
			})
			.catch(() => {
				console.log('Problem loading message type list');
			});
	}, []);

	return messageTypeList;
};

export default useMessageTypeContactDetails;
