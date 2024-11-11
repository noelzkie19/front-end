import { Guid } from 'guid-typescript';
import React, { useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import swal from 'sweetalert';
import { RootState } from '../../../../../../../setup';
import * as hubConnection from '../../../../../../../setup/hub/MessagingHub';
import { SegmentPageAction, SegmentThresholdLimit } from '../../../../../../constants/Constants';
import useConstant from '../../../../../../constants/useConstant';
import { IAuthState } from '../../../../../auth';
import { PlayerModel, SegmentConditionSaveRequestModel, SegmentTestRequestModel, SegmentTestResponseModel } from '../../../models';
import { testSegment, testSegmentResult } from '../../../redux/SegmentationService';
import useValidateConditions from './useValidateConditions';
import useSegmentConstant from '../../../useSegmentConstant';

export default function useTestSegment() {
	/**
	 * ? Reducer State
	 */
	const {userId} = useSelector<RootState>(({auth}) => auth, shallowEqual) as IAuthState;
	const [stringQuery, setStringQuery] = useState<string>('');
	const [tableJoins, setTableJoins] = useState<string>('');
	const [segmentConditions, setSegmentConditions] = useState<Array<SegmentConditionSaveRequestModel>>([]);
	const [segmentInputType, setSegmentInputType] = useState<any>(null);
	const [segmentCustomQuery, setSegmentCustomQuery] = useState('');
	/**
	 * ? Hooks
	 */
	const {validateConditions} = useValidateConditions();
	const {actionName, segmentId} = useParams();
	const { successResponse} = useConstant();
	const { SegmentInputTypes } = useSegmentConstant();

	/**
	 * ? State
	 */
	const [segmentLoading, setSegmentLoading] = useState<boolean>(false);
	const [playerList, setPlayerList] = useState<Array<PlayerModel>>([]);
	const [recordCount, setRecordCount] = useState<number>(0);

	/**
	 * ? Methods
	 */

	const handleSetStringQuery = (_stringQuery: string) => {
		setStringQuery(_stringQuery);
	};

	const handleSetTableJoins = (_tableJoins: string) => {
		setTableJoins(_tableJoins);
	};

	const handleSetSegmentState = (_dataState: Array<SegmentConditionSaveRequestModel>) => {
		setSegmentConditions(_dataState);
	};

	const handleSetInputType = (_inputTypeState: any) => {
		setSegmentInputType(_inputTypeState);
	}

	const handleSetSegmentCustomQuery = (_customQuery: any) => {
		setSegmentCustomQuery(_customQuery);
	}

	const handleTestSegment = (
		_pageSize: number,
		_currentPage: number,
		_sortColumn: string,
		_sortOrder: string,
		_playerId: string,
		_userName: string,
		_testSegmentCallback?: (param: any) => void,
		_validateTestBeforeSave?: boolean
	) => {
		let isValid = true;
		if(segmentInputType && segmentInputType.value === SegmentInputTypes.CustomQuery) {
			isValid = (segmentCustomQuery !== '' && segmentCustomQuery.trim() !== '') ? true : false;
		} else {
			isValid = validateConditions(segmentConditions);
		}

		let _searchFilter: string = '';

		if (_playerId !== '' && _userName.trim() !== '') {
			_searchFilter = ` AND p.PlayerId = ${_playerId}` + ` AND p.Username like '%${_userName}%'`;
		}

		if (_playerId !== '' && _userName.trim() === '') {
			_searchFilter = ` AND p.PlayerId = ${_playerId}`;
		}

		if (_playerId === '' && _userName.trim() !== '') {
			_searchFilter = ` AND p.Username LIKE '%${_userName}%'`;
		}

		if (isValid) {
			setSegmentLoading(true);
			setTimeout(() => {
				const parsedQueryForm = actionName === SegmentPageAction.CONVERT_TO_STATIC ? _searchFilter : stringQuery + _searchFilter;
				const messagingHub = hubConnection.createHubConnenction();
				messagingHub.start().then(() => {
					const request: SegmentTestRequestModel = {
						queryForm: parsedQueryForm,
						userId: userId !== null && userId !== undefined ? userId.toString() : '',
						queueId: Guid.create().toString(),
						pageSize: _pageSize,
						offsetValue: (_currentPage - 1) * _pageSize,
						sortColumn: _sortColumn,
						sortOrder: _sortOrder,
						queryJoins: tableJoins,
						segmentId:
							(actionName === SegmentPageAction.CONVERT_TO_STATIC || (actionName === SegmentPageAction.EDIT && segmentInputType && segmentInputType.value === SegmentInputTypes.CustomQuery))
								? segmentId // If isStatic, pass Source Segment (If action = tostatic)
								: undefined, // Pass Undefined SegmentId for (action = add, edit, clone) The user may modify the condition or filter the result
					};

					testSegment(request)
						.then((response) => {
							if (response.status === successResponse) {
								messagingHub.on(request.queueId.toString(), (message) => {
									testSegmentResult(message.cacheId)
										.then((returnData) => {
											let resultData = Object.assign({}, returnData.data as SegmentTestResponseModel);
											setPlayerList(resultData.players);
											setRecordCount(resultData.recordCount);
											if (_validateTestBeforeSave === undefined && (resultData === undefined || (resultData && resultData.players.length === 0))) {
												swal('Test Segment', 'No Record Found', 'info');
											}

											if (_validateTestBeforeSave === true) {
												const confirmationMessage =
													resultData.recordCount > SegmentThresholdLimit.ThresholdCount ? SegmentThresholdLimit.ValidationMessage : undefined;
												_testSegmentCallback && _testSegmentCallback(confirmationMessage);
											}

											setSegmentLoading(false);
										})
										.catch(() => {
											setSegmentLoading(false);
										});
									messagingHub.off(request.queueId.toString());
									messagingHub.stop();
								});

								setTimeout(() => {
									if (messagingHub.state === 'Connected') {
										messagingHub.stop();
										setSegmentLoading(false);
									}
								}, 30000);
							} else {
								messagingHub.stop();
								swal('Failed', response.data.message, 'error');
							}
						})
						.catch(() => {
							messagingHub.stop();
							swal('Failed', 'Problem in getting message type list', 'error');
						});
				});
			}, 1000);
		}
	};

	return {segmentLoading, handleTestSegment, playerList, recordCount, handleSetStringQuery, handleSetTableJoins, handleSetSegmentState, handleSetInputType, handleSetSegmentCustomQuery};
}
