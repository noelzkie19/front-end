// Information:
// This reusable hook will display all list of schedule template created in Rem Setting
// with the following columns:
//
// ScheduleTemplateSettingId
// ScheduleTemplateName
// ScheduleTemplateDescription
// CreatedBy
// CreatedDate
// UpdatedBy
// UpdatedDate

import {useEffect, useState} from 'react';
import {OptionListModel} from '../../../../common/model';
import useConstant from '../../../../constants/useConstant';
import {RemProfileScheduleTemplateResponse} from '../../models/response/RemProfileScheduleTemplateResponse';
import {GetAllScheduleTemplateList} from '../../services/RemProfileApi';

const useAllScheduleTemplateList = () => {
	const [scheduleTemplateList, setScheduleTemplateList] = useState<Array<OptionListModel>>([]);
	const {successResponse} = useConstant();

	useEffect(() => {
		GetAllScheduleTemplateList()
			.then((response) => {
				if (response.status === successResponse) {
					let templateData = Object.assign(new Array<RemProfileScheduleTemplateResponse>(), response.data);
					let optionTempList = Array<OptionListModel>();

					templateData.forEach((item) => {
						const tempOption: OptionListModel = {
							value: item.scheduleTemplateSettingId.toString(),
							label: item.scheduleTemplateName,
						};
						optionTempList.push(tempOption);
					});

					setScheduleTemplateList(optionTempList);
				} else {
					console.log('Problem loading all schedule template list');
				}
			})
			.catch((e) => {
				console.log('Problem loading all schedule template list ', e);
			});
	}, []);

	return scheduleTemplateList;
};

export default useAllScheduleTemplateList;
