import { useState } from 'react'
import { getRoleById, getRoleByIdInfo, updateRole, sendGetRoleList, GetRoleList, addRole } from '../../../redux/UserManagementService'
import * as hubConnection from '../../../../../../setup/hub/MessagingHub';
import { RoleIdRequestModel } from '../../../models/RoleIdRequestModel';
import { RoleRequestModel } from '../../../models/RoleRequestModel';
import { RoleModel } from '../../../models/RoleModel';
import { RoleFilterModel } from '../../../models/RoleFilterModel';
import { HttpStatusCodeEnum } from '../../../../../constants/Constants';
import swal from 'sweetalert';
import { disableSplashScreen } from '../../../../../utils/helper';
import useConstant from '../../../../../constants/useConstant';

export const UseUserRoleHooks = () => {
    const [roleById, setRoleById] = useState<any>()
    const [roleMasterList, setRoleMasterList] = useState<Array<RoleModel>>([])
    const [completed, setCompleted] = useState<boolean>(false)
    const [isSuccess, setIsSuccess] = useState<boolean>(false)
    const { HubConnected } = useConstant();
    const getUserRoleById = async (requestRole: RoleIdRequestModel) => {
        try {
            const messagingHub = hubConnection.createHubConnenction();

            await messagingHub.start();
            if (messagingHub.state === HubConnected) {
                const response = await getRoleById(requestRole);
                if (response.data.status === HttpStatusCodeEnum.Ok) {
                    await new Promise(() => {
                        const onMessage = (message: any) => {
                            getRoleByIdInfo(message.cacheId)
                                .then(({ data }) => {
                                    setRoleById(data)
                                })
                                .catch((ex) => {
                                    console.log('Problem in getting record of the role selected');
                                })
                                .finally(() => {
                                    messagingHub.off(requestRole.queueId.toString());
                                    messagingHub.stop();
                                    disableSplashScreen();
                                });
                        };

                        messagingHub.on(requestRole.queueId.toString(), onMessage);

                        setTimeout(() => {
                            if (messagingHub.state === HubConnected) {
                                messagingHub.stop();
                                disableSplashScreen();
                            }
                        }, 30000);
                    });
                } else {
                    messagingHub.stop();
                    disableSplashScreen();
                    swal('Failed', response.data.message, 'error');
                }
            } else {
                messagingHub.stop();
                disableSplashScreen();
                swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
            }
        } catch (err) {
            console.log('Error while starting connection: ' + err);
            disableSplashScreen();
        }
    };

    const updateUserRole = async (requestRole: RoleRequestModel, setSubmitting: any, messagingHub: any) => {
        setCompleted(false)
        try {
            if (messagingHub.state === HubConnected) {
                const response = await updateRole(requestRole);
                if (response.data.status === HttpStatusCodeEnum.Ok) {
                    messagingHub.on(requestRole.queueId.toString(), (message: any) => {
                        let resultData = JSON.parse(message.remarks);
                        if (resultData.Status !== HttpStatusCodeEnum.Ok) {
                            swal('Failed', resultData.Message, 'error');
                            setSubmitting(false);
                        } else {
                            swal('Successful!', 'The data has been submitted', 'success');
                            setSubmitting(false);
                        }
                        messagingHub.off(requestRole.queueId.toString());
                        messagingHub.stop();
                        setCompleted(true)
                        setSubmitting(false);
                    });

                    setTimeout(() => {
                        if (messagingHub.state === HubConnected) {
                            messagingHub.stop();
                            setSubmitting(false);
                            setCompleted(true)
                        }
                    }, 30000);
                } else {
                    messagingHub.stop();
                    swal('Failed', 'Problem connecting to the server, Please refresh', 'error');
                }
            }
        } catch (err) {
            console.log('Error while starting connection: ' + err);
            disableSplashScreen();
        }
    }

    const addUserRole = async (requestRole: RoleRequestModel, setSubmitting: any, messagingHub: any, resetForm: any, history: any) => {
        setCompleted(false)
        setIsSuccess(false)
        try {
            const messagingHub = hubConnection.createHubConnenction();
            await messagingHub.start();

            if (messagingHub.state === HubConnected) {

                console.log('request');
                console.log(JSON.stringify(requestRole));

                const response = await addRole(requestRole);

                console.log('response');
                console.log(response);

                if (response.status === 200) {
                    messagingHub.on(requestRole.queueId.toString(), (message: any) => {
                        let resultData = JSON.parse(message.remarks);
                        if (resultData.Status !== HttpStatusCodeEnum.Ok) {
                            swal('Failed', resultData.Message, 'error');
                            setSubmitting(false);
                        } else {
                            swal("Successful!", "The data has been submitted", "success").then((onSuccess) => {
								if (onSuccess) {
									history.push(`/user-management/role-list`);
									setSubmitting(false);
                                    resetForm({});
                                    setIsSuccess(true)
								}
							});
                            
                        }
                        messagingHub.off(requestRole.queueId.toString());
                        messagingHub.stop();
                        setCompleted(true)
                        setSubmitting(false);
                    });

                    setTimeout(() => {
                        if (messagingHub.state === HubConnected) {
                            messagingHub.stop();
                            setSubmitting(false);
                            setCompleted(true)
                        }
                    }, 30000);
                } else {
                    swal('Failed', response.data.message, 'error');

                }
            } else {
                messagingHub.stop();
                swal('Failed', 'Problem connecting to the server, Please refresh', 'error');

            }
        } catch (err) {
            console.log('Error while starting connection: ' + err);
        }
    }

    const getRoleMasterList = async (requestRole: RoleFilterModel) => {
        try {
            const messagingHub = hubConnection.createHubConnenction();
            await messagingHub.start();
            if (messagingHub.state === HubConnected) {
                const response = await sendGetRoleList(requestRole);
                if (response.data.status === HttpStatusCodeEnum.Ok) {
                    await new Promise((resolve, reject) => {
                        const messageHandler = (message: any) => {
                            GetRoleList(message.cacheId)
                                .then(({ data }) => {
                                    console.log(data);
                                    let resultData = Object.assign(new Array<RoleModel>(), data);
                                    setRoleMasterList(resultData);
                                    console.log('resultData');
                                    console.log(resultData);
                                })
                                .catch(() => {

                                })
                                .finally(() => {
                                    messagingHub.off(requestRole.queueId.toString());
                                    messagingHub.stop();
                                });
                        };

                        messagingHub.on(requestRole.queueId.toString(), messageHandler);

                        setTimeout(() => {
                            if (messagingHub.state === 'Connected') {
                                messagingHub.stop();
                            }
                        }, 30000);
                    });
                } else {
                    messagingHub.stop();
                    swal("Failed", response.data.message, "error");
                }
            } else {
                messagingHub.stop();
                swal("Failed", "Problem connecting to the server, Please refresh", "error");
            }

        } catch (err) {
            console.log('Error while starting connection: ' + err);
            disableSplashScreen();
        }

    }



    return {
        roleById,
        getUserRoleById,
        roleMasterList,
        getRoleMasterList,
        updateUserRole,
        addUserRole,
        completed,
        isSuccess
    }
}