import {Guid} from 'guid-typescript'
import moment from 'moment'
import {useEffect, useState} from 'react'
import {shallowEqual, useSelector} from 'react-redux'
import swal from 'sweetalert'
import {RootState} from '../../../../setup'
import useConstant from '../../../constants/useConstant'
import {FormContainer, FormModal} from '../../../custom-components'
import {UserModel} from '../../auth/models/UserModel'
import {CallListNoteRequestModel, CallListNoteResponseModel, CallListNoteResponseModelFactory} from '../models'
import {getCallListNote} from '../redux/AgentWorkspaceService'

interface Props {
    note: CallListNoteResponseModel
    onHide?: () => void
	onSubmmit?: (note: CallListNoteRequestModel) => void
	modal: boolean
    toggle: () => void
}

export const CallListNoteModal = (props: Props) => {
    const currentUser = useSelector<RootState>(({auth}) => auth.user, shallowEqual) as UserModel
    const currentUserId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number
    const [note, setNote] = useState<CallListNoteResponseModel>(CallListNoteResponseModelFactory())
    const [noteValue, setNoteValue] = useState('')
    const { properFormatDateHourMinSec } = useConstant();
    const [isDisabled, setIsDisabled] = useState<boolean>(true);

    useEffect(() => {
        //console.log('TOGGLE MODAL', props)
        if(props.modal) {
            if(props && props.note.callListNoteId > 0) {
                getCallListNote(props.note.callListNoteId)
                .then((response) => {
                    if(response.status === 200) {
                        const obj = { ...response.data } as CallListNoteResponseModel;
                        setNote(obj)
                        setNoteValue(obj.note)
                    }
                })
            } else {
                setNote({...CallListNoteResponseModelFactory(), campaignPlayerId: props.note.campaignPlayerId})
                setNoteValue('')
            }
        }
    }, [props.modal])
    

    const handleNoteChange = (val: any) => {
        setIsDisabled(false);
        setNoteValue(val.target.value)
    }

    const getFullName = () => {
        if(note) 
            return note.updatedByName ?? note.createdByName
        else
            return currentUser.firstname + ' ' + currentUser.lastname
    }

    const getModDate = () => {
        if(note && note.callListNoteId > 0) 
            return moment(note.updatedByName !== null ? note.updatedDate : note.createdDate).format(properFormatDateHourMinSec)
        else
            return ''
    }

    const handleOnHide = () => {
        if(noteValue == note.note) {
            props.onHide && props?.onHide()
        } else {
        swal({
            title: "Confirmation",
            text: "This action will discard any changes made, please confirm",
            icon: 'warning',
            buttons: ['No', 'Yes'],
            dangerMode: true,
          }).then((willRedirect) => {
            if (willRedirect) {
                props.onHide && props?.onHide()
            }
          })
        
        }
    }

    const handleSubmit = () => {
        const request : CallListNoteRequestModel = {
            callListNoteId: note.callListNoteId ? note.callListNoteId : 0,
            campaignPlayerId: note.campaignPlayerId ? note.campaignPlayerId : 0,
            note: noteValue,
            queueId: Guid.create().toString(), 
            userId: currentUserId.toString(),

        }
        setIsDisabled(true);
        props.onSubmmit && props?.onSubmmit(request)
    }
    return (
        <FormModal headerTitle={'Call List Notes'} haveFooter={true} show={props.modal} onHide={() => handleOnHide()} onSubmmit={handleSubmit} isDisabled={isDisabled}>
            <FormContainer onSubmit={() => console.log('submitted')}>
                        <div className="form-group row mb-3 align-items-center">
                            <span className="col-lg-3  text-sm-right">Last Modified By</span>
                            <div className="col-lg-3">
                                <input type="email" className="form-control form-control-sm" value={getFullName()} disabled/>
                            </div>
                            <span className="col-lg-3 ext-sm-right">Last Modified Date & Time</span>
                            <div className="col-lg-3">
                                <input type="email" className="form-control form-control-sm" value={getModDate()} disabled/>
                            </div>
                        </div>
                        <div className="form-group row align-items-center">
                            <div className="col-sm-12">
                            <textarea className="form-control form-control-sm" rows={3} value={noteValue} onChange={handleNoteChange} />
                            </div>
                        </div>
                       
            </FormContainer>
        </FormModal>
    )
}
