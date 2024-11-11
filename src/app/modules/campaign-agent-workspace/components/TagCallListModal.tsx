import moment from 'moment'
import {useEffect, useState} from 'react'
import Select from 'react-select'
import swal from 'sweetalert'
import {LookupModel} from '../../../common/model'
import {FormContainer, FormGroupContainer, FormModal} from '../../../custom-components'
import {getAgentsForTagging} from '../redux/AgentWorkspaceService'

interface Props {
    title: string
    lastTaggedDate: string
    agentId: number | undefined
    onHide?: () => void
	onSubmitForm?: (agent: any) => void
	modal: boolean
    toggle: () => void
}

export const TagCallListModal = (props: Props) => {

    // States -----------------------------
    const [agent, setAgent] = useState<any>()
    const [agentOptions, setAgentOptions] = useState<Array<LookupModel>>([])
    const [lastTaggedDate, setLastTaggedDate] = useState('')

    // Side Effects -----------------------
    useEffect(() => {
        getAgentsForTagging()
        .then(response => {
            if(response.status === 200) {
                setAgentOptions(response.data)
            }
        })
    }, [])

    useEffect(() => {
        if(props.modal) {
            if(props.agentId) {
                const taggedAgent = agentOptions.find(i => i.value === props.agentId)
                if(taggedAgent) {
                    setAgent(taggedAgent)
                }
            }

            if(props.lastTaggedDate) {
                const parsedDate = props.lastTaggedDate !== '' ? moment(props.lastTaggedDate).format("DD-MM-YYYY hh:mm:ss").toString() : ''
                setLastTaggedDate(parsedDate)
            }
        } else {
            setLastTaggedDate('')
            setAgent(undefined)
        }
    }, [props.modal])

    // Methods ----------------------------
    const handleAgentChange = (val: any) => {
        setAgent(val)
    }
    const handleSubmit = () => {
        let valid = true

        if(agent == undefined || agent == null) {
            valid = false
            swal("Failed", "Unable to proceed. Please enter values on mandatory fields.", "error");
        }

        if(valid) {
            props.onSubmitForm?.(agent)
        }
    }

    

    return (
        <FormModal headerTitle={props.title} haveFooter={true} show={props.modal} onHide={props.onHide} onSubmmit={handleSubmit}>
            <FormContainer onSubmit={() => console.log('submitted')}>
                        <FormGroupContainer>
                                <label className="col-4 col-form-label">Last Tagged Date</label>
                                <div className="col-8">
                                    <input className="form-control form-control-sm" type="text" value={lastTaggedDate} id="example-text-input" disabled/>
                                </div>
                        </FormGroupContainer>
                        <FormGroupContainer>
                                <label className="col-4 col-form-label">Agent Name</label>
                                <div className="col-8">
                                    <Select
                                        native
                                        size="small"
                                        style={{ width: '100%' }}
                                        isClearable={true}
                                        menuPortalTarget={document.body} 
                                        styles={{ menuPortal: (base: any) => ({ ...base, zIndex: 9999 }) }}
                                        options={agentOptions}
                                        onChange={handleAgentChange}
                                        value={agent}
                                    />
                                </div>
                        </FormGroupContainer>
            </FormContainer>
        </FormModal>
    )
}
