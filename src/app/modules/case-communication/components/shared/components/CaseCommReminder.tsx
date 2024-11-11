import React from 'react';
import {RetrieveCall} from './RetrieveCall';
import {MessageTypeEnum} from '../../../../../constants/Constants';

interface Props {
	messageTypeId: string;
	isFetching: boolean;
	isCalling: boolean
}
const CaseCommReminder: React.FC<Props> = ({messageTypeId, isFetching, isCalling}) => {
	return (
		<>
			{isFetching && <RetrieveCall />}

			{!isFetching && !(isCalling && messageTypeId === MessageTypeEnum.CloudTalk.toString()) ? (
				<label className={'text-danger'}>Reminder: Always end the call on the Softphone!</label>
			) : null}

			{!isFetching && isCalling && messageTypeId === MessageTypeEnum.CloudTalk.toString() ? (
				<label className={'text-danger'}>Reminder: Always copy the Dial ID to notes, and end the call on Softphone!</label>
			) : null}

		</>
	);
};

export {CaseCommReminder};
