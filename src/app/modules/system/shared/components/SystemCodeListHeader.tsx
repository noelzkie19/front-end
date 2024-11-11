import {Col, Row} from 'react-bootstrap-v5';
import {CodeListModel} from '../../models';
import {useFormattedDate} from '../../../../custom-functions';

interface SystemCodeListHeaderProps {
	codeListInfo: CodeListModel | undefined;
}

const SystemCodeListHeader: React.FC<SystemCodeListHeaderProps> = (SystemCodeListHeaderProps) => {
	let {codeListInfo} = SystemCodeListHeaderProps;

	return (
		<>
			<Row>
				<Col sm={2}>Code List Name</Col>
				<Col sm={2}>Code List Type</Col>
				<Col sm={2}>Parent</Col>
				<Col sm={2}>Field Type</Col>
			</Row>
			<Row>
				<Col sm={2}>
					<b>{codeListInfo?.codeListName ?? ''}</b>
				</Col>
				<Col sm={2}>
					<b>{codeListInfo?.codeListTypeName ?? ''}</b>
				</Col>
				<Col sm={2}>
					<b>{codeListInfo?.parentCodeListName ?? ''}</b>
				</Col>
				<Col sm={2}>
					<b>{codeListInfo?.fieldTypeName ?? ''}</b>
				</Col>
			</Row>
			<div style={{marginTop: 10}}>
				<Row>
					<Col sm={2}>Created Date</Col>
					<Col sm={2}>Created By</Col>
					<Col sm={2}>Last Modified Date</Col>
					<Col sm={2}>Modified By</Col>
				</Row>
				<Row>
					<Col sm={2}>
						<b>{useFormattedDate(codeListInfo?.createdDate ?? '')} </b>
					</Col>
					<Col sm={2}>
						<b>{codeListInfo?.createdByName ?? ''}</b>
					</Col>
					<Col sm={2}>
						<b>{useFormattedDate(codeListInfo?.updatedDate ?? '')}</b>
					</Col>
					<Col sm={2}>
						<b>{codeListInfo?.updatedByName ?? ''}</b>
					</Col>
				</Row>
			</div>
		</>
	);
};

export {SystemCodeListHeader};
