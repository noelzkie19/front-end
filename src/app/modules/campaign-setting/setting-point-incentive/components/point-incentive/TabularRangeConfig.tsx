import React, {useEffect, useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../../../setup';
import {FormGroupContainer} from '../../../../../custom-components';
import {useCurrencies} from '../../../../../custom-functions';
// models
import {GoalParameterListModel} from '../../models/GoalParameterListModel';
import GoalParameterRangeConfigurationGrid from '../goal-parameter/GoalParameterRangeConfigurationGrid';

interface Props {
	modalData?: Array<GoalParameterListModel>;
}

const TabularRangeConfig: React.FC<Props> = ({modalData}) => {
	// GET REDUX STORE
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const postData = useSelector<RootState>(({system}) => system.postMessageResponseList, shallowEqual) as any;
	const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number;

	//  STATES
	const [loading, setLoading] = useState<boolean>(false);
	const [submitDisable, setSubmitDisable] = useState<boolean>(true);
	const [goalParameterRangeConfigList, setGoalParameterRangeConfigList] = useState<Array<GoalParameterListModel>>(modalData!);

	// METHODS
	//get currency List
	const currencyList: any = useCurrencies();

	const currencyTabs = currencyList.map((curr: any, index: any) => goalParameterRangeConfigList.filter((g) => g.currencyId == curr.value));

	// WATCHERS
	//upon load of form
	useEffect(() => {
		setGoalParameterRangeConfigList(modalData!);
	}, [modalData]);

	const listItems = currencyList.map((link: any) => (
		<li key={link.value}>
			{link.value}-{link.label}
		</li>
	));

	return (
		<>
			<FormGroupContainer>
				<div className='range-config mb-5'>
					<div className='tabbable-custom'>
						<ul className='nav nav-tabs nav-tab-border'>
							{currencyList
								.filter((u: any) => u.value == goalParameterRangeConfigList.map((g) => g.currencyId))
								.map((dataData: any, inx: any) => (
									<div className={'tab-pane'} id={'1-details'}>
										<GoalParameterRangeConfigurationGrid />
									</div>
								))}

							{currencyList.map((curr: any, index: any) => (
								<li className={index == 0 ? 'nav-item tab-highlighted' : 'nav-item'}>
									<a className={index == 0 ? 'nav-link active' : 'nav-link'} data-bs-toggle='tab' href={'#' + curr.label + '-details'}>
										{curr.label}
									</a>
								</li>
							))}
						</ul>
						<div className='tab-content'>
							{currencyList.map((curr: any, index: any) => (
								<div className={index == 0 ? 'tab-pane active' : 'tab-pane'} id={curr.label + '-details'}>
									<GoalParameterRangeConfigurationGrid />
								</div>
							))}
						</div>
					</div>
				</div>
			</FormGroupContainer>
		</>
	);
};

export default TabularRangeConfig;
