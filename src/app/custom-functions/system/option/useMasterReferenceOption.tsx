import {ValueService} from 'ag-grid-community';
import React, {useState, useEffect} from 'react';
import {MasterReferenceOptionListModel, MasterReferenceOptionModel, OptionListModel} from '../../../common/model';
import {GetMasterReferenceList, GetMessageResponseOptionById} from '../../../common/services';

export default function useMasterReferenceOption(masterReferenceIdRequest: string) {
	// -----------------------------------------------------------------
	// STATE
	// -----------------------------------------------------------------
	const [masterReferenceOptions, setMasterReferenceOptions] = useState<Array<MasterReferenceOptionModel>>([]);

	// -----------------------------------------------------------------
	// FIRST MOUNT OF COMPONENT
	// -----------------------------------------------------------------

	useEffect(() => {
		if (masterReferenceIdRequest !== '') {
			GetMasterReferenceList(masterReferenceIdRequest)
				.then((response) => {
					if (response.status === 200) {
						let masterReferenceList = Object.assign(new Array<MasterReferenceOptionListModel>(), response.data);
						let tempList = Array<MasterReferenceOptionModel>();

						masterReferenceList
							.filter((x: MasterReferenceOptionListModel) => x.isParent === false)
							.forEach((item) => {
								const OptionValue: MasterReferenceOptionModel = {
									masterReferenceParentId: item.masterReferenceParentId,
									options: {label: item.masterReferenceChildName, value: item.masterReferenceId.toString()},
								};
								tempList.push(OptionValue);
							});

						setMasterReferenceOptions(tempList);
					} else {
						// disableSplashScreen()
						console.log('Problem in  master reference list');
					}
				})
				.catch(() => {
					//disableSplashScreen()
					console.log('Problem in master reference list');
				});
		}
	}, [masterReferenceIdRequest]);

	return masterReferenceOptions;
}
