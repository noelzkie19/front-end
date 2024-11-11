import React, { useCallback, useEffect, useState } from 'react';
import { Button, Collapse, Table, OverlayTrigger, Tooltip } from 'react-bootstrap-v5';
import useConstant from '../../../../constants/useConstant';
import { PCSCommunicationQuestionsResponseModel } from '../../models';
import { getPCSCommunicationQuestionsById } from '../../services/CustomerCaseApi';
import swal from 'sweetalert';

interface PcsProps {
	resize: () => void;
	data: any;
}

const PCSQuestionDetailAccordion: React.FC<PcsProps> = (PcsProps) => {
	const [open, setOpen] = useState(PcsProps.data.isOpen);
	const [pcsCommunicationQuestions, setPcsCommunicationQuestions] = useState<Array<PCSCommunicationQuestionsResponseModel>>([]);
	const { HubConnected, successResponse, SwalFailedMessage, SwalConfirmMessage, message } = useConstant();

	useEffect(() => {

		if (PcsProps.data.isOpen) {
			getCommunicationQuestionAnswers(PcsProps.data.caseCommunicationId);
		}

	}, []);

	useEffect(() => {
		if (pcsCommunicationQuestions.length === 0) return
		let wrappedChar = document.querySelectorAll(`[data-wrapped="wrappedByChar"]`);
		if (wrappedChar.length > 0) {
			wrappedChar.forEach((el: any) => {
				let computedFontSize = window.getComputedStyle(el, null).getPropertyValue('font-size');
				el.style.height = computedFontSize
			})
		}
	}, [pcsCommunicationQuestions])

	const getCommunicationQuestionAnswers = (_caseCommunicationId: number) => {
		getPCSCommunicationQuestionsById(_caseCommunicationId)
			.then((response) => {
				if (response.status === successResponse) {
					setPcsCommunicationQuestions(response.data);
				}
			})
			.catch(() => {
				swal('Failed', 'Problem in getting getCaseManagementPCSQuestionsByFilter', 'error');
			});
	};

	const onClick = useCallback(() => {
		PcsProps.data.isOpen = !open;
		setOpen(!open);
		getCommunicationQuestionAnswers(PcsProps.data.caseCommunicationId);
		PcsProps.resize();
	}, [open]);

	const wrapMessageByCharCount = (data: string | undefined, charCount: number = 50) => {
		if (!data) return;
		const pattern = new RegExp(`.{1,${charCount}}`, 'g');
		let wrapArrayForm = [];
		let match;
		while ((match = pattern.exec(data)) !== null) {
			wrapArrayForm.push(match[0]);
		}

		return wrapArrayForm?.map((item: any, index: any) => {
			let arrIndex = index
			return (
				<div key={arrIndex} data-wrapped="wrappedByChar" style={{display: 'flex', alignItems: `${wrapArrayForm.length > 1 && 'center'}`}}>
					<span>{item}</span>
				</div>
			)
		});
	}

	return (
        // First Create A Collapsable Div
        (<>
            <Button onClick={onClick} variant='link' aria-controls={'example-collapse-text' + PcsProps.data.caseCommunicationId} aria-expanded={open}>
				{open ? '-' : '+'} {PcsProps.data.caseCommunicationId}
			</Button>
            <Collapse in={open}>
				<div id={'example-collapse-text' + PcsProps.data.caseCommunicationId}>
					<Table size={'sm'}>
						<thead>
							<tr>
								<th>QuestionID</th>
								<th>Question Message</th>
								<th>Answer</th>
							</tr>
						</thead>
						<tbody>
						{/* <label htmlFor='codelist-name' className='form-label-sm'>Code List Name</label> */}
							{pcsCommunicationQuestions.map((questionsObj) => {
								return (
									<tr key={questionsObj.questionId} style={{padding: '1rem'}}>
										<td style={{ width: '280px', paddingBottom: '1rem' }}>
											<OverlayTrigger placement='right' delay={{ show: 250, hide: 400 }} overlay={<Tooltip id='questionId-tooltip-2'>Click to copy Question Id</Tooltip>}>
												<button
													onClick={() => {
														navigator.clipboard.writeText(`${questionsObj.questionId}`)
														swal('Successful!', 'Question ID copied to clipboard', 'success')
													}}
													onKeyPress={() => {
														navigator.clipboard.writeText(`${questionsObj.questionId}`)
														swal('Successful!', 'Question ID copied to clipboard', 'success')
													}}
													className="bg-transparent d-inline-block text-left mb-3"
													style={{ width: 'fit-content', padding: '0'}}
												>
													{wrapMessageByCharCount(questionsObj.questionId, 50)}
												</button>
											</OverlayTrigger>
										</td >
										<td style={{ width: '350px'}}>
											<OverlayTrigger placement='right' delay={{ show: 250, hide: 400 }} overlay={<Tooltip id='questionId-tooltip-2'>Click to copy Question Message</Tooltip>}>
												<button
													onClick={() => {
														navigator.clipboard.writeText(`${questionsObj.questionMessageEN}`)
														swal('Successful!', 'Question Message copied to clipboard', 'success')
													}}
													onKeyPress={() => {
														navigator.clipboard.writeText(`${questionsObj.questionMessageEN}`)
														swal('Successful!', 'Question Message copied to clipboard', 'success')
													}}
													className="bg-transparent d-inline-block text-left mb-3"
													style={{ width: 'fit-content', padding: '0'}}
												>
													{wrapMessageByCharCount(questionsObj.questionMessageEN, 50)}
												</button>
											</OverlayTrigger>
										</td>
										<td style={{ width: '100px', paddingBottom: '1rem' }}>
											<OverlayTrigger placement='right' delay={{ show: 250, hide: 400 }} overlay={<Tooltip id='questionId-tooltip-2'>Click to copy Answer</Tooltip>}>
												<button
													onClick={() => {
														navigator.clipboard.writeText(`${questionsObj.answer}`)
														swal('Successful!', 'Answer copied to clipboard', 'success')
													}}
													onKeyPress={() => {
														navigator.clipboard.writeText(`${questionsObj.answer}`)
														swal('Successful!', 'Answer copied to clipboard', 'success')
													}}
													className="bg-transparent d-inline-block text-left mb-3"
													style={{ width: 'fit-content', padding: '0'}}
												>
													{wrapMessageByCharCount(questionsObj.answer, 50)}
												</button>
											</OverlayTrigger>
										</td>
									</tr>
								);
							})}
						</tbody>
					</Table>
				</div>
			</Collapse>
        </>)
    );
};

export default PCSQuestionDetailAccordion;
