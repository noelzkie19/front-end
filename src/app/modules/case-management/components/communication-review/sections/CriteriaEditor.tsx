import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import useCommunicationReviewHooks from "../../../shared/hooks/useCommunicationReviewHooks";
import Select, { components } from "react-select";
import { OverlayTrigger, Tooltip } from "react-bootstrap-v5";

const Option = ({ ...props }) => {
	const { description } = props.data;
	const [showTooltip, setShowTooltip] = useState<boolean>(false);
	const onToggle = (e: any) => {
		setShowTooltip(e);
	}
	return (
		<OverlayTrigger onToggle={onToggle} show={showTooltip} delay={{ show: 700, hide: 0 }} placement='right' overlay={<Tooltip id='button-tooltip-2' className="dropdown-tooltip"><span dangerouslySetInnerHTML={{ __html: description }} /></Tooltip>}>
			<div className="overlap-ellipsis"><components.Option {...props} /></div>
		</OverlayTrigger>
	);
}

const CriteriaEditor = forwardRef((props: any, ref: any) => {
	const [selectedValue, setSelectedValue] = useState<any>();
	const [isValueChanged, setIsValueChanged] = useState<boolean>(false);
	const [filteredOptionList, setFilteredOptionList] = useState<Array<any>>([]);
	const selectRef: any = useRef();
	const { optionList, value, data, callbackFunction, rowIndex } = props;

	/* Hooks */
	const { getCriteriaList, criteriaList } = useCommunicationReviewHooks();

	useEffect(() => {
		if (value.trim() !== "") {
			let prevData = optionList.find((x : any) => x.code + ' ' + x.criteriaName === value)
			let displayValue = {...prevData, label: prevData.code + ' ' + prevData.criteriaName}
			setSelectedValue(displayValue);
		}

		if (optionList) {
			if (optionList.length > 0) {
				const filteredList: any[] = optionList.filter((x: any) => x.qualityReviewMeasurementId === data.qualityReviewMeasurementId).map((y: any) => ({
					...y,
					value: y.qualityReviewMeasurementId,
					label: y.code + ' ' + y.criteriaName
				}))
				setFilteredOptionList([...filteredList].sort((a, b) => a.order - b.order));
			}
		}

		refetchDropdown();
		setIsValueChanged(false);
	}, [])

	useEffect(() => {
		if (criteriaList.length > 0) {
			if (filteredOptionList.toString() !== criteriaList.toString()) {
				const filteredList: any[] = criteriaList.filter((x: any) => x.qualityReviewMeasurementId === data.qualityReviewMeasurementId).map((y: any) => ({
					...y,
					value: y.qualityReviewMeasurementId,
					label: y.code + ' ' + y.criteriaName
				}))
				setFilteredOptionList([...filteredList].sort((a, b) => a.order - b.order));
			}
		}
	}, [criteriaList])

	const customStyles = {
		container: (base: any) => ({
			...base,
			height: '35px'
		}),
		controller: (base: any) => ({
			...base,
			height: '35px'
		}),
		menu: (base: any) => ({
			...base,
			position: 'fixed',
			width: '30%',
			overflow: 'hidden',
			maxHeight: '168px',
			top: rowIndex > 3 ? 'unset' : '100%',
			bottom: rowIndex > 3 ? '100%' : 'unset',
			marginTop: '0',
			marginBottom: '0px',
		}),
		menuList: (base: any) => ({
			...base,
			width: '100%',
			maxHeight: '170px'
		}),
		valueContainer: (base: any) => ({
			...base,
			height: '35px'
		}),
		indicatorContainer: (base: any) => ({
			...base,
			height: '35px'
		}),
		singleValue: (base: any, state: any) => {
			return (
				{
					...base,
					top: (state.hasValue && state.selectProps.menuIsOpen) || isValueChanged ? '65%' : '50%'
				}
			)
		},
		placeholder: (base: any, state: any) => ({
			...base,
			top: state.isFocused ? '65%' : '50%'
		}),
		option: (base: any) => ({
			...base,
			overflow: 'hidden',
			textOverflow: 'ellipsis'
		})
	}

	const handleOnChange = (e: any) => {
		setSelectedValue(e);
		setIsValueChanged(true);
		callbackFunction(rowIndex, e.qualityReviewCriteriaId, e.qualityReviewMeasurementId);
	}

	useImperativeHandle(ref, () => {
		// will trigger this on cell outfocus
		return {
			getValue: () => {
				const result = selectRef.current?.state?.value;
				setSelectedValue(result ?? selectedValue); // return to select dropdown
				return result?.label ?? props.value; // return to cell
			}
		};
	});

	const refetchDropdown = () => {
		const { data } = props;
		getCriteriaList(data.qualityReviewMeasurementId);
	}

	return (
		<Select
			ref={selectRef}
			components={{ Option }}
			options={filteredOptionList}
			styles={customStyles}
			value={selectedValue}
			onChange={(e: any) => handleOnChange(e)}
		/>
	)
})

export default CriteriaEditor