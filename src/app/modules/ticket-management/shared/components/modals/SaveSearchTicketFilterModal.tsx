import { useEffect, useState } from "react";
import { DefaultSecondaryButton, FormModal, MlabButton } from "../../../../../custom-components"
import { TextFilter } from "../../../../relationship-management/shared/components";
import { Col, ModalFooter, Row } from "react-bootstrap-v5";
import { ElementStyle } from "../../../../../constants/Constants";
import swal from "sweetalert";
import useConstant from "../../../../../constants/useConstant";

interface SaveSearchTicketFilterModalProps {
    handleCloseModal: any,
    showModal: boolean,
    submitModal: any,
    savedFilterName: any
}

const SaveSearchTicketFilterModal: React.FC<SaveSearchTicketFilterModalProps> = ({ handleCloseModal, showModal, submitModal, savedFilterName }: SaveSearchTicketFilterModalProps) => {
    const [filterName, setFilterName] = useState<any>();
    const { message, SwalConfirmMessage } = useConstant();

    useEffect(() => {
        if (savedFilterName) {
            setFilterName(savedFilterName);
        }
    }, [savedFilterName])

    const closeModal = () => {
        swal({
            title: SwalConfirmMessage.title,
            text: SwalConfirmMessage.textDiscard,
            icon: SwalConfirmMessage.icon,
            buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
            dangerMode: true,
        }).then((onConfirm) => {
            if (onConfirm) {
                handleCloseModal();
            }
        });
    };

    const handleSubmit = () => {
        if (filterName) {
            submitModal(filterName);
        } else {
            swal('Failed', message.requiredAllFields, 'error');
        }

    }

    return (
        <FormModal headerTitle={'Save Filter'} haveFooter={false} show={showModal} onHide={closeModal}>
            <p>Please confirm to <b>save</b> this filter</p>

            <Row style={{ margin: '35px 0px' }}>
                <Col lg={2} style={{ textAlign: 'center', margin: 'auto 0' }}>
                <span>Filter Name <span style={{color: 'red'}}>*</span></span>
                </Col>
                <Col lg={10} style={{ paddingRight: '35px' }}>
                    <TextFilter
                        label=''
                        onChange={(val: any) => setFilterName(val)}
                        value={filterName}
                    />
                </Col>
            </Row>
            <ModalFooter style={{ border: 0 }}>
                <MlabButton
                    size={'sm'}
                    label={'Submit'}
                    style={ElementStyle.primary}
                    type={'button'}
                    weight={'solid'}
                    loading={false}
                    disabled={false}
                    loadingTitle={' Please wait...'}
                    onClick={() => handleSubmit()}
                    access={true}
                ></MlabButton>
                <DefaultSecondaryButton access={true} title={'Close'} onClick={closeModal} />
            </ModalFooter>
        </FormModal>
    )
}

export default SaveSearchTicketFilterModal