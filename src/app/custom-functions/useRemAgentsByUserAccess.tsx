import { useEffect, useState } from 'react';
import useConstant from '../constants/useConstant';
import { getRemAgentsByUserAccess } from '../modules/system/redux/SystemService';
import swal from 'sweetalert';
import { LookupModel } from '../shared-models/LookupModel';

export default function useRemAgentsByUserAccess(userId?: number) {
	const {SwalFailedMessage, ReMAutoDistributionConstants, successResponse} = useConstant();
	// State
	const [remAgentsList, setRemAgentsList] = useState<Array<LookupModel>>([]);

	// First mount to component
	// Refactored useCurrencies to accept nullable parameter (userId) for data restriction fields
	useEffect(() => {
		getRemAgentsByUserAccess(userId)
			.then((response) => {
				if (response.status === successResponse) {
                    setRemAgentsList(response.data);
				} else {
					swal(SwalFailedMessage.title, ReMAutoDistributionConstants.remAgentsByUserAccessError, SwalFailedMessage.icon);
				}
			})
			.catch(() => {
				swal(SwalFailedMessage.title, ReMAutoDistributionConstants.remAgentsByUserAccessError, SwalFailedMessage.icon);
			});
	}, []);

	return remAgentsList;
}
