import { Container, ModalFooter } from 'react-bootstrap-v5';
import { FormModal, MlabButton } from '../../../../../../custom-components';
import swal from 'sweetalert';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ElementStyle, PROMPT_MESSAGES } from '../../../../../../constants/Constants';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../../../../../../../setup';
import { USER_CLAIMS } from '../../../../../user-management/components/constants/UserClaims';
import { AgGridReact } from 'ag-grid-react';
import { AutoDistributionSettingConfigsListOrder } from '../../../../models/response/AutoDistributionSettingConfigsListOrder';
import useConstant from '../../../../../../constants/useConstant';
import { UpdateAutoDistributionSettingPriorityRequestModel } from '../../../../models/request/UpdateAutoDistributionSettingPriorityRequestModel';
import { UpdateAutoDistributionSettingPriority } from '../../../../services/RemSettingApi';
import useAutoDistributionSettingHooks from '../../../../shared/hooks/useAutoDistributionSettingHooks';
import { ColDef, ColGroupDef } from 'ag-grid-community';

interface Props {
    showForm: boolean;
    closeModal: () => void;
}

const ReorderConfigDistributionPriorityModal: React.FC<Props> = ({ showForm, closeModal }) => {
    //Redux
    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string;
    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number;
    const gridRef: any = useRef();

    //States
    const { getAllAutoDistributionConfigListOrder, configListOrder } = useAutoDistributionSettingHooks();
    const [rowData, setRowData] = useState<Array<AutoDistributionSettingConfigsListOrder>>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { successResponse, SwalConfirmMessage, SwalSuccessMessage, SwalServerErrorMessage } = useConstant();

    //Watchers
    useEffect(() => {
        if (showForm)
            getAllAutoDistributionConfigListOrder();
    }, [showForm]);

    useEffect(() => {
        if (showForm)
            setRowData(configListOrder);
    }, [configListOrder]);

    const reorderPriorityColumnDefs : (ColDef<AutoDistributionSettingConfigsListOrder> | ColGroupDef<AutoDistributionSettingConfigsListOrder>)[] =[
        {
            headerName: 'Priority',
            field: 'priorityId',
            rowDrag: true,
        },
        {
            headerName: 'Configuration Name',
            field: 'autoConfigurationName',
            width: 300,
        },
    ];

    const onReorderPriorityGridReady = (params: any) => {
        params.api.sizeColumnsToFit();
    };

    const onReorderPriorityRowDragEnd = (event: any) => {
        let movingNode = event.node;
        let overNode = event.overNode;
        let rowNeedsToMove = movingNode !== overNode;

        if (rowNeedsToMove) {
            switchPriorityFromTo(movingNode.data, overNode.data);
        }
    };

    const switchPriorityFromTo = (fromData: AutoDistributionSettingConfigsListOrder, toData: AutoDistributionSettingConfigsListOrder) => {
        const fromIndex = rowData.findIndex(item => item === fromData);
        const toIndex = rowData.findIndex(item => item === (toData ?? null));

        if (fromIndex !== -1 && toIndex !== -1) {
            const newStore = [...rowData];
            newStore.splice(fromIndex, 1);
            newStore.splice(toIndex, 0, fromData);

            newStore.forEach((item, index) => {
                item.priorityId = index + 1;
            });

            setRowData(newStore);
        }
    };

    const getReorderPriorityRowNodeId = useCallback(
		(params: any) => String(params.data.autoDistributionSettingId),
		[],
	  );

    async function generateParam() {
        const request: UpdateAutoDistributionSettingPriorityRequestModel = {
            userId: userAccessId,
            autoConfigurations: rowData.map((i) => {
                return {
                    autoConfigurationId: i.autoDistributionSettingId,
                    priorityId: i.priorityId
                };
            }),
        };
        return request;
    }

    const confirmSaveReorderPriority = () => {
        swal({
            title: PROMPT_MESSAGES.ConfirmSubmitTitle,
            text: PROMPT_MESSAGES.ConfirmSubmitMessageEdit,
            icon: SwalConfirmMessage.icon,
            buttons: [SwalConfirmMessage.btnNo, SwalConfirmMessage.btnYes],
            dangerMode: true
        }).then(async (action) => {
            if (action) {
                let reorderRequest = await generateParam();
                saveReorderPriority(reorderRequest);
            }
        });
    }

    const saveReorderPriority = async (requestObj: UpdateAutoDistributionSettingPriorityRequestModel) => {
        setLoading(true);
        const response: any = await UpdateAutoDistributionSettingPriority(requestObj);
        if (response.status === successResponse) {
            swal(SwalSuccessMessage.title, SwalSuccessMessage.textSuccess, SwalSuccessMessage.icon);
            setLoading(false);
            closeModal();
        } else {
            swal(SwalServerErrorMessage.title, response.data.message, SwalServerErrorMessage.icon);
            setLoading(false);
        }
    };

    const onCloseModal = () => {
        closeModal();
    };

    return (
        <FormModal
            headerTitle="Change Auto Distribution Configuration Priority"
            haveFooter={false}
            show={showForm}
            customSize='md'
        >
            <Container>
                <div className='ag-theme-quartz' style={{ height: 400, width: '100%' }}>
                    <AgGridReact
                        rowData={rowData}
                        rowDragManaged={true}
                        suppressMoveWhenRowDragging={true}
                        onRowDragEnd={onReorderPriorityRowDragEnd}
                        animateRows={true}
                        onGridReady={onReorderPriorityGridReady}
                        enableRangeSelection={true}
                        getRowId={getReorderPriorityRowNodeId}
                        columnDefs={reorderPriorityColumnDefs}
                        ref={gridRef}
                    />
                </div>
            </Container>
            <ModalFooter style={{ border: 0 }}>
                <MlabButton
                    access={true}
                    label='Save'
                    style={ElementStyle.primary}
                    type={'button'}
                    weight={'solid'}
                    size={'sm'}
                    loading={loading}
                    loadingTitle={'Please wait...'}
                    onClick={confirmSaveReorderPriority}
                    disabled={loading || !userAccess.includes(USER_CLAIMS.RemAutoDistributionSettingWrite)}
                />
                <MlabButton
                    access={true}
                    size={'sm'}
                    label={'Close'}
                    additionalClassStyle={{ marginRight: 0 }}
                    style={ElementStyle.secondary}
                    type={'button'}
                    weight={'solid'}
                    disabled={loading}
                    onClick={() => {
                        onCloseModal();
                    }}
                />
            </ModalFooter>
        </FormModal>
    );
};

export default ReorderConfigDistributionPriorityModal;
