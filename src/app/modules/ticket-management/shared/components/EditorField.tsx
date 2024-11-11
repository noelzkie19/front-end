import {Col, Row} from 'react-bootstrap-v5';
import {ElementStyle} from '../../../../constants/Constants';
import {ButtonsContainer, MLabQuillEditor, MlabButton} from '../../../../custom-components';

const EditorField = ({...props}) => {
	const {handleOnChange, editorValue, handleSubmit, isSubmitClicked, handleCancel, cancelClearBtnLabel, isFromModal, disableSubmit, hasAccess} =
		props;
	return (
		<>
			<Row>
				<Col md={12} style={{backgroundColor: 'white'}}>
					<MLabQuillEditor
						isUploadToMlabStorage={true}
						uploadToMlabStorage={undefined}
						isReadOnly={!hasAccess}
						quillValue={editorValue}
						setQuillValue={(content: string) => {
							handleOnChange(content);
						}}
						hasImageToEditor={true}
					/>
				</Col>
			</Row>
			<Row>
				{!isFromModal && (
					<ButtonsContainer>
						<MlabButton
							access={true}
							size={'sm'}
							label={'Submit'}
							style={ElementStyle.primary}
							type={'button'}
							weight={'solid'}
							onClick={handleSubmit}
							loading={isSubmitClicked}
							loadingTitle={'Please wait ...'}
							disabled={disableSubmit || !hasAccess}
						/>
						<MlabButton
							access={true}
							size={'sm'}
							label={cancelClearBtnLabel}
							style={ElementStyle.secondary}
							type={'button'}
							weight={'solid'}
							onClick={handleCancel}
							loading={isSubmitClicked}
							loadingTitle={'Please wait ...'}
							disabled={isSubmitClicked || !hasAccess}
						/>
					</ButtonsContainer>
				)}
			</Row>
		</>
	);
};

export default EditorField;
