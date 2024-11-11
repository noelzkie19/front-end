import {useState} from 'react';
import {SegmentConditionModel} from '../modules/player-management/segmentation/models';

export default function searchTree(key: string, tree: Array<SegmentConditionModel>) {
	const childKeys: Array<string> = [];
	let data: any = [];
	tree
		.filter((i) => i.parentKey !== '' && i.key !== undefined)
		.forEach((item) => {
			if (item.parentKey === key) {
				childKeys.push(item.key);
				data = childKeys.concat(
					searchTree(
						item.key,
						tree.filter((j) => !childKeys.includes(j.key))
					)
				);
			}
		});

	return data;
}
