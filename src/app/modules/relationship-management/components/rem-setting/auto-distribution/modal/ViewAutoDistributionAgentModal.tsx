import { Container, ModalFooter } from 'react-bootstrap-v5';
import { FormModal, MlabButton } from '../../../../../../custom-components';
import { useEffect, useRef, useState } from 'react';
import { ElementStyle } from '../../../../../../constants/Constants';
import { Guid } from 'guid-typescript';
import { RootState } from '../../../../../../../setup/redux/RootReducer';
import { AutoDistributionConfigurationListByAgentIdRequestModel } from '../../../../models/request/AutoDistributionConfigurationListByAgentIdRequestModel';
import { shallowEqual, useSelector } from 'react-redux';
import { GetAutoDistributionConfigurationListByAgentIdResult, SendGetAutoDistributionConfigurationListByAgentId } from '../../../../services/RemSettingApi';
import * as hubConnection from '../../../../../../../setup/hub/MessagingHub';
import useConstant from '../../../../../../constants/useConstant';
import { AutoDistributionConfigurationListByAgentIdResponseModel } from '../../../../models/response/AutoDistributionConfigurationListByAgentIdResponseModel';
import { RemProfileResponseModel } from '../../../../models/response/RemProfileResponseModel';
import { AgGridReact } from 'ag-grid-react';

interface Props {
    showForm: boolean;
    closeModal: () => void;
    selectedRow: RemProfileResponseModel;
}

const ViewAutoDistributionAgentModal: React.FC<Props> = ({ showForm, closeModal, selectedRow }) => {

    //States
    const messagingHub = hubConnection.createHubConnenction();
    const [loading, setLoading] = useState<boolean>(false);
    const gridRef: any = useRef();

    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number;
    const [selectedRemProfileName, setSelectedRemProfileName] = useState<string>('');
    const [autoConfigurationList, setAutoConfigurationList] = useState<any>();
    const [listTotalCount, setListTotalCount] = useState<any>();
    const { successResponse } = useConstant();

    //Watchers
    useEffect(() => {
        if (showForm && selectedRow) {
            setSelectedRemProfileName(selectedRow.remProfileName)
            _getDistributionConfigListByAgentId();
        }
    }, [showForm]);

    const _getDistributionConfigListByAgentId = async () => {
        await messagingHub
            .start()
            .then(() => {
                if (messagingHub.state === 'Connected') {
                    const requestObj: AutoDistributionConfigurationListByAgentIdRequestModel = {
                        remProfileId: selectedRow.remProfileId,
                        queueId: Guid.create().toString(),
                        userId: userAccessId.toString(),
                    }
                    setLoading(true);
                    SendGetAutoDistributionConfigurationListByAgentId(requestObj)
                        .then((response) => {
                            if (response.status === successResponse) {
                                messagingHub.on(requestObj.queueId.toString(), (message) => {
                                    GetAutoDistributionConfigurationListByAgentIdResult(message.cacheId)
                                        .then((data) => {
                                            let resultData = data.data as AutoDistributionConfigurationListByAgentIdResponseModel
                                            setAutoConfigurationList(resultData.configurationList);
                                            setListTotalCount(resultData.configurationNameTotalCount);
                                            messagingHub.off(requestObj.queueId.toString());
                                            messagingHub.stop();
                                            setLoading(false);
                                        })
                                        .catch(() => {
                                            setLoading(false);
                                        });
                                });

                                setTimeout(() => {
                                    if (messagingHub.state === 'Connected') {
                                        messagingHub.stop();
                                    }
                                }, 30000);
                            }
                        })
                }
            })
    }

    const onGridReadyAgentList = (params: any) => {
        params.api.sizeColumnsToFit();
    };

    const onSort = (e: any) => {

    };

    const configurationListColumnDefs = [
        {
            field: 'configurationName',
            headerName: 'Configuration Name',
            cellRenderer: (params: any) => params.data.configurationName ?? '',
            width: 400,
        },
        {
            field: 'status',
            headerName: 'Status',
            cellRenderer: (params: any) => params.data.status ? 'Active' : 'Inactive',
            width: 250,
        }
    ];

    const onCloseModal = () => {
        closeModal();
    };

    return (
        <FormModal
            headerTitle={"View Agent Auto Distribution Configuration"}
            haveFooter={false}
            show={showForm}
            customSize='lg'
        >
            <Container>
                <div className='row mb-4'>
                    <div className='col-sm-4'>
                        <label htmlFor="countField" className='form-control-label mb-2'>ReM Agent Name</label>
                    </div>
                    <div className='col-sm-6'>
                        <div className='input-group'>
                            <input
                                type='text'
                                aria-autocomplete='none'
                                autoComplete='off'
                                className='form-control form-control-sm'
                                aria-label='Configuration Name'
                                value={selectedRemProfileName}
                                disabled={true}
                            />
                        </div>
                    </div>
                </div>
                <div className='row mb-3'>
                    <div className='col-sm-12'>
                        <div className='ag-theme-quartz' style={{ height: 300, width: '100%' }}>
                            <AgGridReact
                                rowData={autoConfigurationList}
                                defaultColDef={{
                                    sortable: true,
                                    resizable: true,
                                }}
                                suppressCopyRowsToClipboard={true}
                                onGridReady={onGridReadyAgentList}
                                rowBuffer={0}
                                enableRangeSelection={true}
                                pagination={false}
                                paginationPageSize={listTotalCount}
                                columnDefs={configurationListColumnDefs}
                                onSortChanged={(e) => onSort(e)}
                                ref={gridRef}
                            />
                        </div>
                    </div>
                </div>
            </Container>
            <ModalFooter style={{ border: 0 }}>
                <MlabButton
                    access={true}
                    size={'sm'}
                    label={'Close'}
                    additionalClassStyle={{ marginRight: 0 }}
                    style={ElementStyle.secondary}
                    type={'button'}
                    weight={'solid'}
                    loadingTitle={'Please wait...'}
                    disabled={loading}
                    onClick={() => {
                        onCloseModal();
                    }}
                />
            </ModalFooter>
        </FormModal>
    );
};

export default ViewAutoDistributionAgentModal;

