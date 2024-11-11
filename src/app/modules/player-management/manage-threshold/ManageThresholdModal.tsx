import React,{ useState, useEffect} from 'react';
import { Col, Modal, ModalFooter, Row } from 'react-bootstrap-v5';
import { ElementStyle } from '../../../constants/Constants';
import { BasicFieldLabel, BasicTextInput, DefaultTextInput, ErrorLabel, MlabButton, SearchTextInput } from '../../../custom-components';
import Select from 'react-select'
import swal from 'sweetalert'
import { ReactMultiEmail, isEmail } from 'react-multi-email';
import 'react-multi-email/style.css';
import { usePromptOnUnload } from '../../../custom-helpers';
import { useMasterReferenceOption } from '../../../custom-functions';
import { MasterReferenceOptionModel } from '../../../common/model';
import { GetManageThresholdResponse, ManageThresholdRequest, SaveManageThresholdRequest } from './models';
import { Guid } from 'guid-typescript'
import { useSelector, shallowEqual, useDispatch } from 'react-redux'
import { RootState } from '../../../../setup'
import * as hubConnection from '../../../../setup/hub/MessagingHub'
import { GetManageThresholds, SaveManageThreshold } from './ManageThresholdApi';
import { OptionsSelectedModel } from '../../system/models';
import { USER_CLAIMS } from '../../user-management/components/constants/UserClaims'

const ManageThresholdModal: React.FC = () => {

	// -----------------------------------------------------------------
    // GET REDUX STORE
    // -----------------------------------------------------------------
    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string
    const userUsername = useSelector<RootState>(({ auth }) => auth.user?.username, shallowEqual) as string
    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number

	// -----------------------------------------------------------------
	// STATES
	// -----------------------------------------------------------------
	const [showModal, setShowModal] = useState<boolean>(false);

	const [threshold1Count, setThreshold1Count] = useState<string>('');
	const [threshold2Count, setThreshold2Count] = useState<string>('');

	const [threshold1Action, setThreshold1Action] = useState<string | any>('');
	const [threshold2Action, setThreshold2Action] = useState<string | any>('');

	const [emails, setEmails] = useState<any>([]);

	const [loading, setLoading] = useState<boolean>(false)

	const [hasErrors, setHasErrors] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>('')
	usePromptOnUnload(true, 'Are you sure you want to leave?')

	const masterReference = useMasterReferenceOption('128').filter((x:MasterReferenceOptionModel) => x.masterReferenceParentId === 128).map((x:MasterReferenceOptionModel) => x.options).reverse().concat({label: 'Select',value: ''}).reverse()




	// -----------------------------------------------------------------
	// WATCHERS
	// -----------------------------------------------------------------
	
	useEffect(() => {
		setHasErrors(false)
		setErrorMessage('')
		
	}, []);


	useEffect(() => {

		if (showModal === true) {
			_getManageThreshold()
		}

	}, [showModal])
	
	
	// -----------------------------------------------------------------
	// METHODS
	// -----------------------------------------------------------------

	const _close = () => {
		swal({
            title: "Confirmation",
            text: "Any changes will be discarded, please confirm",
            icon: "warning",
            buttons: ["No", "Yes"],
            dangerMode: true
        })
        .then((willUpdate) => {
            if (willUpdate) {
				setShowModal(false)
            } 
        })
	}

	const _validate = () => {

		let isError: boolean = false

		if (threshold1Count === '') {
			// setHasErrors(true);
            // setErrorMessage('Unable to proceed, kindly fill up all mandatory fields');
			swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error')
			isError = true
		}

		if (threshold2Count === '') {
			// setHasErrors(true);
            // setErrorMessage('Unable to proceed, kindly fill up all mandatory fields');
			swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error')
			isError = true
		}

		if(parseInt(threshold2Count) <= parseInt(threshold1Count)) {
			// setHasErrors(true);
            // setErrorMessage('Unable to proceed, Daily Threshold 2 Count must be higher than Daily Threshold 1 Count');
			swal('Failed', 'Unable to proceed, Daily Threshold 2 Count must be higher than Daily Threshold 1 Count', 'error')
			isError = true
		}

		if(parseInt(threshold2Count) === 0 || parseInt(threshold1Count) === 0) {
			// setHasErrors(true);
            // setErrorMessage('Unable to proceed, Daily Threshold 2 Count must be higher than Daily Threshold 1 Count');
			swal('Failed', 'Unable to proceed, Daily Threshold Count must be higher than 0', 'error')
			isError = true
		}

		if (threshold1Action.value === '' || threshold1Action.value === undefined) {
			// setHasErrors(true);
            // setErrorMessage('Unable to proceed, kindly fill up all mandatory fields');
			swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error')
			isError = true
		}

		if (threshold2Action.value === '' || threshold2Action.value === undefined) {
			// setHasErrors(true);
            // setErrorMessage('Unable to proceed, kindly fill up all mandatory fields');
			swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error')
			isError = true
		}

		if(emails.length === 0)
		{
			// setHasErrors(true);
            // setErrorMessage('Unable to proceed, kindly fill up all mandatory fields');
			swal('Failed', 'Unable to proceed, kindly fill up all mandatory fields', 'error')
			isError = true
		}

		if(emails.length > 10)
		{
			swal('Failed', 'Unable to proceed, maximum email recipient is 10', 'error')
			isError = true
		}


		return isError;
	}

	const _submit = () => {

		if(_validate() === false) {
			swal({
				title: "Confirmation",
				text: "This action will update the configuration, please confirm",
				icon: "warning",
				buttons: ["No", "Yes"],
				dangerMode: true
			})
			.then((willUpdate) => {
				if (willUpdate) {
					// history.push('/campaign-workspace/agent-workspace');
					_postTransaction()

				} 
			})
		}

	}

	// -----------------------------------------------------------------
	// API METHODS
	// -----------------------------------------------------------------

	const _getManageThreshold = () => {
    
		GetManageThresholds()
		  .then((response) => {
			if (response.status === 200) {

				let data = Object.assign(new Array<GetManageThresholdResponse>(), response.data)
				
				// SET VARIABLE FOR DESIGNATED STATES
				let emailx = data.find(x => x.manageThresholdId === 1)?.emailRecipient.toString()

				let threshold1Countx: string | undefined = data.find(x => x.manageThresholdId === 1)?.thresholdCount.toString()
				let threshold1Actionx = masterReference.find(x => x.value === data.find(x => x.manageThresholdId === 1)?.thresholdAction.toString())


				let threshold2Countx: string | undefined = data.find(x => x.manageThresholdId === 2)?.thresholdCount.toString()
				let threshold2Actionx = masterReference.find(x => x.value === data.find(x => x.manageThresholdId === 2)?.thresholdAction.toString())

				setThreshold1Count(threshold1Countx !== undefined ? threshold1Countx : '')
				setThreshold1Action(threshold1Actionx)
				setThreshold2Count(threshold2Countx !== undefined ? threshold2Countx : '')
				setThreshold2Action(threshold2Actionx !== undefined ? threshold2Actionx : '')

				console.log(emailx)

				setEmails(emailx !== undefined ? emailx?.split(',') : [])

			}
		}).catch((ex) => {    
		  console.log('Error GetSystemLookups: ' + ex)          
		})

	  }
	
	const _postTransaction = () => {

		//-- FORMULATE REQUEST -- //

		const manageThresholdPost: Array<ManageThresholdRequest> = [
			{
				manageThresholdId: 1,
				thresholdCount: parseInt(threshold1Count),
				thresholdAction: parseInt(threshold1Action.value),
				emailRecipient: emails.toString()
			},
			{
				manageThresholdId: 2,
				thresholdCount: parseInt(threshold2Count),
				thresholdAction: parseInt(threshold2Action.value),
				emailRecipient: emails.toString()
			}
		]

		const request: SaveManageThresholdRequest = {
			queueId : Guid.create().toString(),
			userId: userAccessId.toString(),
			manageThresholds: manageThresholdPost
		}

		console.log('-----request to pass ---------------')
		console.log(request)
		console.log('------------------------------------')


		setTimeout(() => {

			const messagingHub = hubConnection.createHubConnenction();
			messagingHub
			.start()
			.then(() => {

				// CHECKING STATE CONNECTION OF MESSAGING HUB //
				if (messagingHub.state === 'Connected') { 
					setLoading(true)
					SaveManageThreshold(request)
					.then((response) => {
					
						if (response.status === 200) {
							
							messagingHub.on(request.queueId.toString(), message => {
					
							let resultData = JSON.parse(message.remarks);

							console.log(resultData)

							if (resultData.Status === 200) {

								swal("Success", "Transaction successfully submitted", "success").then((willUpdate) => {
									if (willUpdate) {
										// -- CATCH TRANSACTION IF SUCCESS THEN CLOSE MODAL -- //
										setLoading(false)
										setHasErrors(false)
										setErrorMessage('')
										setShowModal(false)
									}
								})

							} else {                                                          
								swal("Failed", "Problem connecting to the server, Please refresh", "error");
								setLoading(false)
							}
			
								messagingHub.off(request.queueId.toString());
								messagingHub.stop();
								
							});
	
							setTimeout(() => {
								if (messagingHub.state === 'Connected') {
									messagingHub.stop();
								}
							}, 30000)

						}else{

								console.log('fail')
								setLoading(false)
						}
					})
					.catch(() => {
						messagingHub.stop();
						swal("Failed", "Problem in Connection on Gateway", "error");
						setLoading(false)
					})
				}

			})
			.catch(err => console.log('Error while starting connection: ' + err))
		}, 1000);

	}


	// -----------------------------------------------------------------
	// EVENTS
	// -----------------------------------------------------------------
	function onChangeThreshold1Action(val: string) {
		console.log(val)
        setThreshold1Action(val)
    }

	function onChangeThreshold2Action(val: string) {
        setThreshold2Action(val)
    }

	return (<>
        <MlabButton
            access={userAccess.includes(USER_CLAIMS.ManageThresholdRead)}
            size={'sm'}
            label={'Manage Threshold'} 
            style={ElementStyle.primary}
            type={'button'}
            weight={'solid'}
            loading={false}
            disabled={false}
            loadingTitle={' Please wait...'}
            onClick={() => setShowModal(true)}
        />
        <Modal
            show={showModal}
            size=  {'lg'}
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >

            <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    Manage Threshold
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                    <>
                        <ErrorLabel hasErrors={hasErrors} errorMessage={errorMessage} />
                    </>
                    <Row style={{ marginBottom:5 }}>
                        <Col sm={6}>
                            <BasicFieldLabel title={'Daily Threshold 1 Count'} />
                            <BasicTextInput ariaLabel={'Threshold 1 Count'}  
                                disabled={userAccess.includes(USER_CLAIMS.ManageThresholdWrite) === true ? false : true}
                                value={threshold1Count}
                                onChange={(e) => setThreshold1Count( e.target.value.replace(/\D/,''))}
                                maxLength={7}
                            />
                        </Col>
                        <Col sm={6}>
                            <BasicFieldLabel title={'Action'} />
                            <Select
                                native
                                size="small"
                                style={{ width: '100%' }}
                                options={masterReference}
                                onChange={onChangeThreshold1Action}
                                value={threshold1Action}
                                isSearchable={false}
                                isDisabled={userAccess.includes(USER_CLAIMS.ManageThresholdWrite) === true ? false : true}
                            />
                        </Col>
                    </Row>
                    <Row style={{ marginBottom:5 }}>
                        <Col sm={6}>
                            <BasicFieldLabel title={'Daily Threshold 2 Count'} />
                            <BasicTextInput ariaLabel={'Threshold 2 Count'}  
                                value={threshold2Count}
                                onChange={(e) => setThreshold2Count(e.target.value.replace(/\D/,''))}
                                maxLength={7}
                                disabled={userAccess.includes(USER_CLAIMS.ManageThresholdWrite) === true ? false : true}
                            />
                        </Col>
                        <Col sm={6}>
                            <BasicFieldLabel title={'Action'} />
                            <Select
                                native
                                size="small"
                                style={{ width: '100%' }}
                                options={masterReference}
                                onChange={onChangeThreshold2Action}
                                value={threshold2Action}
                                isSearchable={false}
                                isDisabled={userAccess.includes(USER_CLAIMS.ManageThresholdWrite) === true ? false : true}
                            />
                        </Col>
                    </Row>
                    <Row style={{ marginBottom:5 }}>
                        <Col sm={12}>
                            <BasicFieldLabel title={'Email Recipient'} />
                            <ReactMultiEmail
                                
                                // style={{ minHeight: '100px',userAccess.includes(USER_CLAIMS.ManageThresholdWrite) === true ? pointerEvents:'none' :''}}
                                style={ userAccess.includes(USER_CLAIMS.ManageThresholdWrite) === false ? { minHeight: '100px',pointerEvents:'none'} : {minHeight: '100px'}}
                                emails={emails}
                                onChange={(_emails: string[]) => {
                                    setEmails(_emails)
                                }}
                                validateEmail={email => {
                                    return isEmail(email); // return boolean
                                }}
                                getLabel={(
                                    email: string,
                                    index: number,
                                    removeEmail: (index: number) => void,
                                ) => {
                                    return (
                                    <div data-tag key={index}>
                                        {email}
                                        <span data-tag-handle onClick={() => removeEmail(index)}>
                                        ×
                                        </span>
                                    </div>
                                    );
                                }}
                            />
                        </Col>
                    </Row>
            </Modal.Body>

            <ModalFooter style={{border:0}}>

                <MlabButton
                    access={userAccess.includes(USER_CLAIMS.ManageThresholdRead)}
                    size={'sm'}
                    label={'Submit'} 
                    style={ElementStyle.primary}
                    type={'submit'}
                    weight={'solid'}
                    loading={loading}
                    disabled={loading || !userAccess.includes(USER_CLAIMS.ManageThresholdWrite)}
                    loadingTitle={' Please wait...'}
                    onClick={() => _submit()}
                />

                <MlabButton
                    access={true}
                    size={'sm'}
                    label={'Close'} 
                    style={ElementStyle.secondary}
                    type={'submit'}
                    weight={'solid'}
                    loading={loading}
                    disabled={loading}
                    loadingTitle={' Please wait...'}
                    onClick={() => _close()}
                />

            </ModalFooter>

        </Modal>
    </>);


};

export default ManageThresholdModal;
