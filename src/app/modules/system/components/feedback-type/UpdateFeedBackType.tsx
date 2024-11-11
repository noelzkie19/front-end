import React,{ useEffect,useState } from 'react'
import { useDispatch,useSelector, shallowEqual } from 'react-redux'
import {
    ContentContainer,
    FieldContainer,
    FieldLabel,
    FormContainer,
    MainContainer,
    ErrorLabel,
    FormModal,
    SuccesLoaderButton,
    DefaultTextInput,
    DefaultSecondaryButton
} from '../../../../custom-components'
import Select from 'react-select'
import * as system from '../../redux/SystemRedux'
import { FeedbackTypeByIdRequest, FeedBackTypeResponse } from '../../models'
import { RootState } from '../../../../../setup'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { ModalFooter } from 'react-bootstrap-v5'
import { getFeedbackTypeById, sendFeedbackTypeById } from '../../redux/SystemService'
import * as hubConnection from '../../../../../setup/hub/MessagingHub'
import { Guid } from "guid-typescript";
import swal from 'sweetalert';
import useConstant from '../../../../constants/useConstant'

const initialValues = {
    name: '',
    status: ''
}

const FormSchema = Yup.object().shape({
    topicName: Yup.string()
})

interface Props {
    showForm: boolean
    closeModal: () => void
    Id: number
}

interface StatusOption {
    value: number
    label: string
}


const UpdateFeedBackType: React.FC<Props> = ({ showForm, closeModal, Id }) => {

    const dispatch = useDispatch()
    const {successResponse, HubConnected, SwalServerErrorMessage, SwalFailedMessage, SwalFeedbackMessage} = useConstant();

    // -----------------------------------------------------------------
    // GET REDUX STORE
    // -----------------------------------------------------------------
    const systemData = useSelector<RootState>(({ system }) => system.getFeedbackTypes, shallowEqual) as any
    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number
    const postData = useSelector<RootState>(({ system }) => system.postFeedbackTypes, shallowEqual) as any

    // -----------------------------------------------------------------
    // STATES
    // -----------------------------------------------------------------
    const [selectedStatuses, setSelectedStatuses] = useState<any>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [hasErrors, setHasErrors] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [infoData, setInfoData] = useState<any>([])

    // -----------------------------------------------------------------
    // VARIABLES
    // -----------------------------------------------------------------
    const statusOptions = [
        { value: '1', label: 'Active' },
        { value: '2', label: 'Inactive' }
    ];

    // -----------------------------------------------------------------
    // WATCHER
    // -----------------------------------------------------------------
    useEffect(() => {
        setLoading(false)
        setHasErrors(false);
        setErrorMessage('');
        setSelectedStatuses('')
        if(showForm === true){
            _getData()
        }
    }, [showForm])

    // -----------------------------------------------------------------
    // MOUNTED
    // -----------------------------------------------------------------

    const _timeoutHandler = (messagingHub: any) => {
        setTimeout(() => {
            if (messagingHub.state === HubConnected) {
                messagingHub.stop();
                setLoading(false)
            }
        }, 30000)
    }

    const _getData = () => {

        setTimeout(() => {
            //FETCH TO API
            const messagingHub = hubConnection.createHubConnenction();
            messagingHub
                .start()
                .then(() => {
                    // CHECKING STATE CONNECTION
                    if (messagingHub.state === HubConnected) {

                        // PARAMETER TO PASS ON API GATEWAY //
                        const request: FeedbackTypeByIdRequest = {
                            userId: userAccessId.toString(),
                            queueId: Guid.create().toString(),
                            feedbackTypeId: Id
                        }

                        // REQUEST FIRST TO GATEWAY IF TRANSACTION WAS VALID
                        sendFeedbackTypeById(request)
                            .then((response) => {
                                // IF REQUEST IS SUCCESS THEN CONSUME CALLBACK API
                                if (response.status === successResponse) {

                                    messagingHub.on(request.queueId.toString(), message => {
                                        // CALLBACK API
                                        getFeedbackTypeById(message.cacheId)
                                            .then((data) => {
                                                let resultData =Object.assign(new Array<FeedBackTypeResponse>(), data.data)
                                                setInfoData(resultData)
                                            })
                                            .catch(() => {
                                                setLoading(false)
                                            })
                                        messagingHub.off(request.queueId.toString());
                                        messagingHub.stop();
                                    });

                                    _timeoutHandler(messagingHub);

                                } else {
                                    messagingHub.stop();
                                    swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
                                }
                            })
                            .catch(() => {
                                messagingHub.stop();
                                swal(SwalFailedMessage.title, SwalFeedbackMessage.textErrorFeedbackList('feedback type'), SwalFailedMessage.icon);
                            })

                    } else {
                        swal(SwalServerErrorMessage.title, SwalServerErrorMessage.textError, SwalServerErrorMessage.icon);
                    }
                })
                .catch(err => console.log('Error while starting connection: ' + err))

        }, 1000);

    }

    // -----------------------------------------------------------------
    // MOUNT OLD VALUES
    // -----------------------------------------------------------------
    useEffect(() => {
        if (infoData!= undefined)
        {
            let stat = (infoData.feedbackTypeStatus === true ? { value: '1', label: 'Active' } : { value: '2', label: 'Inactive' })
            setSelectedStatuses(stat)
            formik.setFieldValue('name',infoData.feedbackTypeName)
        }

    }, [infoData])

    // -----------------------------------------------------------------
    // METHODS
    // -----------------------------------------------------------------
    const _dispatchTransaction = ( name :string, status: string ) => {
        // ----------------------------------- DISPATCH OF DATA FOR TABLE AND POST REDUX-----------------------------------------//

        const request: FeedBackTypeResponse = {
            codeListId: infoData.codeListId,
            codeListName: infoData.codeListName,
            feedbackTypeId: infoData.feedbackTypeId,
            feedbackTypeName: name,
            feedbackTypeStatus: (status === '1' ? "true" :  "false" ),
            position: infoData.position,
            action: 'EDIT'
        }
        // REMOVE DATA FROM TANBLE BEFORE REINSERT ON REDUX STORE
        let filterData = systemData.filter((x: FeedBackTypeResponse) => x.feedbackTypeId != infoData.feedbackTypeId);
        // REINSERT UPDATED DATA
        let DataToTable = [...filterData,request]
        //DISPATCH DATA TO TABLE STORE
        dispatch(system.actions.getFeedbackTypes(DataToTable))

        // FIRST GET INDEXT OF ITEM
        const postIndex = postData.findIndex((x: FeedBackTypeResponse) => x.feedbackTypeId === infoData.feedbackTypeId);

        // CHECKING ON INSERT OR UPDATE
        if (postIndex < 0) {
            // IF NOT EXIST THEN ADD
            const newDataToStore  = postData.concat(request)
            dispatch(system.actions.postFeedbackTypes(newDataToStore))
        } else {
            // IF EXISIST THEN REMOVE FIRST
            let filteredData = postData.filter((x: FeedBackTypeResponse) => x.feedbackTypeId != infoData.feedbackTypeId);
            let updatedPostData = [...filteredData,request]
            dispatch(system.actions.postFeedbackTypes(updatedPostData))
        }

        // -----------------------------------------------------------------------------------------------------------//
    }
    function onChangeSelectedStatues(val: string) {
        setSelectedStatuses(val)
    }
    const _validateTransaction = (name: string, status: string) => {
        let isError: boolean = false;

        if (name === '' || name === undefined || name === null) {
            setHasErrors(true);
            setErrorMessage('Unable to proceed, kindly fill up all mandatory field');
            isError = true
        }

        if (status === '' || status === undefined || status === null) {
            setHasErrors(true);
            setErrorMessage('Unable to proceed, kindly fill up all mandatory field');
            isError = true
        }

        return isError
    }
    // -----------------------------------------------------------------
    // FORMIK FORM POST
    // -----------------------------------------------------------------
    const formik = useFormik({
        initialValues,
        validationSchema: FormSchema,
        onSubmit: (values, { setStatus, setSubmitting, resetForm }) => {
            setSubmitting(true)

            // -- SET TOPIC STATUS ON -- //
            values.status = selectedStatuses.value

            // -- VALIDATE VALUES IF EMPTY OR NULL --//
            const isError = _validateTransaction(values.name, values.status)

            // -- VALIDATION SATISFIED PROCEED TO TRANSACTION --//
            if (isError === false) {

                // IF SUCCESS THEN PROCEED TO TRANSACTION
                _dispatchTransaction(values.name, values.status);
                resetForm();
                setHasErrors(false);
                setErrorMessage('');
            }
            setSubmitting(false);
        },
    })

    // -----------------------------------------------------------------
    // RETURN ELEMENT
    // -----------------------------------------------------------------
    return (
        <FormModal headerTitle={'Edit Feedback Type'} haveFooter={false} show={showForm}>
            <FormContainer onSubmit={formik.handleSubmit}>
                <MainContainer>
                    <ContentContainer>

                        <ErrorLabel hasErrors={hasErrors} errorMessage={errorMessage} />
                        <FieldContainer>
                            <FieldLabel title={'Feedback Type Name'}/>
                            <DefaultTextInput ariaLabel={'Feedback Type Name'}
                                disabled={true}
                                {...formik.getFieldProps('name')}
                            />
                        </FieldContainer>
                        <FieldContainer>
                            <FieldLabel title={'Feedback Type Status'}/>
                            <div className="col-sm-10">
                                <Select
                                    native
                                    size="small"
                                    style={{ width: '100%' }}
                                    options={statusOptions}
                                    onChange={onChangeSelectedStatues}
                                    value={selectedStatuses}
                                />
                            </div>
                        </FieldContainer>

                    </ContentContainer>
                </MainContainer>
                <ModalFooter style={{border:0}}>
                    <SuccesLoaderButton title={'Submit'} loading={loading} disabled={formik.isSubmitting} loadingTitle={'Please wait ...'}/>
                    <DefaultSecondaryButton access={true} title={'Close'} onClick={closeModal}/>
                </ModalFooter>
            </FormContainer>
        </FormModal>
    )
}

export default UpdateFeedBackType