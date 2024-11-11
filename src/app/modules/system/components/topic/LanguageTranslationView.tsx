import {AgGridReact} from 'ag-grid-react';
import {useEffect, useState} from 'react';
import {ModalFooter} from 'react-bootstrap-v5';
import {ContentContainer, DefaultSecondaryButton, FormModal, MainContainer} from '../../../../custom-components';
import {TopicResponseModel} from '../../models';
import { LanguageTranslationListModel } from '../../models/response/LanguageTranslationListModel';

// -- INTERFACES -- //
interface Props {
	showForm: boolean;
	languageTranslationList?: Array<LanguageTranslationListModel>;
	setModalLanguageTranslationShow: (e: boolean) => void;
	headerTitle: string;
}

const LanguageTranslationView: React.FC<Props> = ({showForm, setModalLanguageTranslationShow, languageTranslationList, headerTitle}) => {
	const [rowData, setRowData] = useState<Array<TopicResponseModel> | any>([]);

	const columnDefs = [
		{
			headerName: 'Language Name',
			field: 'languageName',
		},
		{headerName: 'Translation', field: 'languageTranslation'},
	];
	const onGridReady = (params: any) => {
		params.api.sizeColumnsToFit();
		setRowData(languageTranslationList);
	};
	useEffect(() => {
		setRowData(languageTranslationList);
	}, [languageTranslationList]);
	return (
		<FormModal headerTitle={headerTitle + ' Language'} haveFooter={false} show={showForm}>
			<MainContainer>
				<ContentContainer>
					<div className='ag-theme-quartz' style={{height: 200, width: '100%'}}>
						<AgGridReact
							rowData={rowData}
							rowDragManaged={true}
							suppressMoveWhenRowDragging={true}
							animateRows={true}
							onGridReady={onGridReady}
							//enableRangeSelection={true} //deprecated in AgGridReactver.32.0.0
							columnDefs={columnDefs}
						/>
					</div>
				</ContentContainer>
			</MainContainer>
			<ModalFooter style={{border: 0}}>
				<DefaultSecondaryButton access={true} title={'Close'} onClick={() => setModalLanguageTranslationShow(false)} />
			</ModalFooter>
		</FormModal>
	);
};
export default LanguageTranslationView;
