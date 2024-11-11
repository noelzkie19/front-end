import React, { useState } from 'react';
import { AccordionHeaderType, FilterFieldKeyword, SegmentSourceTypes } from '../../../../../../constants/Constants';
import { FilterAccordion, FormGroupContainer } from '../../../../../../custom-components';
import { SegmentQueryItemModel } from '../../../models';
import useSegmentConstant from '../../../useSegmentConstant';

type QueryFormViewProps = {
	queryForm: Array<SegmentQueryItemModel>;
};
const QueryFormView: React.FC<QueryFormViewProps> = ({queryForm}: QueryFormViewProps) => {
	const [showQuery, setShowQuery] = useState(true);
	const styleQuery = (index: any, query: string, fieldSourceId: number) => (
		<small key={index} className={`text-${fieldSourceId === SegmentSourceTypes.Tableau ? 'danger' : 'success'}`}>
			{query}
		</small>
	);

	const toggleQuery = () => {
		setShowQuery((prevState) => !prevState);
	};

	const compressedPlayerIdList = (_queryForm : any, playerListCompressed = '') => {
		//slice playerIds
		if ((_queryForm.includes(FilterFieldKeyword.PlayerId) || _queryForm.includes(FilterFieldKeyword.MlabPlayerId)) && !_queryForm.includes(FilterFieldKeyword.Items)) {
			const startIdx = _queryForm?.indexOf("(") 
			const endIdx = _queryForm.indexOf(")")
			const list = _queryForm.substring((startIdx ?? 0) + 1, endIdx)
			const result = list?.split(',')

			const compressed = result.map((i: any, idx: any) => i).slice(0,9).join(',') + ` ...(${result.length} ${FilterFieldKeyword.Items}`
			playerListCompressed = result.length > 10 ? `${_queryForm.slice(0, startIdx)}(${compressed})` : _queryForm
			return playerListCompressed
		}
		else 
			return _queryForm
	}

	return (
		<FormGroupContainer>
			<div className='col-lg-12 pt-2'>
				<h6 style={{cursor: 'pointer'}} onClick={toggleQuery}>
					Query <span className='badge bg-primary'>{showQuery ? 'Hide' : 'Show'}</span>
				</h6>

				{showQuery && (
					<p
						style={{
							fontFamily: 'Lucida Console, Courier New, monospace',
							fontSize: '12pt',
							borderRadius: 5,
							padding: 10,
						}}
						className='bg-light'
					>
						{queryForm.map((i, index) => styleQuery(index, compressedPlayerIdList(i.query), i.sourceTypeId))}
						
					</p>
				)}
			</div>
		</FormGroupContainer>
	);
};

export default QueryFormView;
