import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';

interface CustomWindow extends Window {
	store: any; // You can specify the data type you want to store here
}
declare let window: CustomWindow;
if (window.store === undefined) {
	window.store = {persistScoring: 0}; //External storage to persist scoring
}

const ScoringEditor = forwardRef((props: any, ref) => {
	const [value, setValue] = useState<any>('');
	const refInput = useRef<HTMLInputElement>(null);
	useEffect(() => {
		// Focus on the input
		setTimeout(() => refInput.current?.focus());
		if (props.value !== 0) {
			setValue(parseFloat(props.value).toString());
		}

		if (isNaN(props.value)) {
			window.store.persistScoring = '0';
		} else {
			window.store.persistScoring = props.value;
		}
	}, []);

	const setBlur = (_event: any) => {
		props.stopEditing();
	};

	useImperativeHandle(ref, () => ({
		getValue() {
			const match = /(-?\d{0,7})[^.]*((?:\.\d{0,2})?)/g.exec(value);
			const val = match ? match[1] + match[2] : '0';
			return val.replace(/-/g, '').trim() !== '' ? parseFloat(val).toString() : window.store.persistScoring; 
		},
		isCancelBeforeStart() {
			return false;
		},
		isCancelAfterEnd() {
			// Our editor will reject any value greater than 10 or less than -10
			if (value.trim() !== '') {
				if (parseFloat(parseFloat(value).toFixed(2)) < 10.0 && parseFloat(parseFloat(value).toFixed(2)) > -10.0) {
					window.store.persistScoring = value;
				}
			}
			if (value) return parseFloat(parseFloat(value).toFixed(2)) > 10.0 || parseFloat(parseFloat(value).toFixed(2)) < -10.0;
			return false;
		},
	}));

	return (
		<input
			type='number'
			ref={refInput}
			value={value}
			onBlur={(event) => setBlur(event)}
			onChange={(event) => setValue(event.target.value)}
			style={{width: '100%', height: '50%'}}
		/>
	);
});
export default ScoringEditor;
