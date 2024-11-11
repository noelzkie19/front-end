import React from 'react';
import {ModalFooter} from 'react-bootstrap-v5';
import DefaultSecondaryButton from '../buttons/DefaultSecondaryButton';
import MainContainer from '../containers/MainContainer';
import FormModal from '../modals/FormModal';

interface IMlabQuillEditorPreviewModalProps {
	showPreview: boolean;
	setShowPreview: (e: boolean) => void;
	contentPreview: string;
}

const MlabQuillEditorPreviewModal: React.FC<IMlabQuillEditorPreviewModalProps> = ({showPreview, setShowPreview, contentPreview}) => {
	return (
		<FormModal headerTitle={'Content Preview'} haveFooter={false} show={showPreview} customSize={'xl'}>
			<MainContainer>
				<div style={{maxWidth: '100%', overflow: 'hidden'}}>
					<div dangerouslySetInnerHTML={{__html: contentPreview ?? ''}} />
				</div>
			</MainContainer>
			<ModalFooter style={{border: 0}}>
				<DefaultSecondaryButton access={true} title={'Close'} onClick={() => setShowPreview(false)} />
			</ModalFooter>
		</FormModal>
	);
};

export default MlabQuillEditorPreviewModal;
