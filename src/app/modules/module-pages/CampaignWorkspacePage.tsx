import React, {Suspense, lazy} from 'react'
import {shallowEqual, useSelector} from 'react-redux'
import {Redirect, Route, Switch, useHistory} from 'react-router-dom'
import swal from 'sweetalert'
import {PageLink, PageTitle} from '../../../_metronic/layout/core'
import {RootState} from '../../../setup'
import {AgentWorkspace} from '../campaign-agent-workspace/components'
import {AddCommunication, CreateCaseCommunication, EditCase, EditCommunication, ViewCase, ViewCommunication} from '../case-communication/components'
// import { CallListValidation } from '../campaign-call-list-validation/components/index'
// import { AgentMonitoring } from '../campaign-agent-monitoring/components/index'


const CallListValidation = lazy(() => import('../campaign-call-list-validation/components/CallListValidation'));
const AgentMonitoring = lazy(() => import('../campaign-agent-monitoring/components/AgentMonitoring'));

// const CallListValidation = Loadable({
//     loader: () => import('../campaign-call-list-validation/components/CallListValidation'),
//     loading: <div>loading ...</div>,
// });

const accountBreadCrumbs: Array<PageLink> = [
    {
        title: 'Campaign Workspace',
        path: '/campaign-workspace/agent-workspace',
        isSeparator: false,
        isActive: false,
    },
    {
        title: '',
        path: '',
        isSeparator: true,
        isActive: false,
    },
]

const CampaignWorkspacePage: React.FC = () => {

    const expiresIn = useSelector<RootState>(({ auth }) => auth.expiresIn, shallowEqual) as string
    const history = useHistory();

    const expiration = new Date(expiresIn)
    var today = new Date();

    if (expiration <= today) {
        swal({
            title: "Expired Session Detected",
            text: "You are about to logout, Please click OK to proceed.",
            icon: "warning",
            dangerMode: true,
        })
            .then((willLogout) => {
                if (willLogout) {
                    history.push("/logout");
                }
            });
    }

    return (
        <>
            <Switch>

                <Route path='/campaign-workspace/create-case/:paramPlayerId/:paramCampaignId/:paramBrand'>
                    <PageTitle breadcrumbs={accountBreadCrumbs}>Create Case</PageTitle>
                    <CreateCaseCommunication />
                </Route>

                <Route path='/campaign-workspace/view-case/:caseId'>
                    <PageTitle breadcrumbs={accountBreadCrumbs}>View Case</PageTitle>
                    <ViewCase />
                </Route>
                <Route path='/campaign-workspace/agent-workspace'>
                    <PageTitle breadcrumbs={accountBreadCrumbs}>Agent Workspace</PageTitle>
                    <AgentWorkspace />
                </Route>
                <Route path='/campaign-workspace/call-list-validation'>
                    <PageTitle breadcrumbs={accountBreadCrumbs}>Call List Validation</PageTitle>

                    <Suspense fallback={<div>Please wait...</div>}>
                        <CallListValidation />
                    </Suspense>
                </Route>
                <Route path='/campaign-workspace/agent-monitoring'>
                    <PageTitle breadcrumbs={accountBreadCrumbs}>Agent Monitoring</PageTitle>
                    <AgentMonitoring />
                </Route>


                <Route path='/campaign-workspace/edit-case'>
                    <PageTitle breadcrumbs={accountBreadCrumbs}>Edit Case</PageTitle>
                    <EditCase />
                </Route>

                <Route path='/campaign-workspace/add-communication/:caseId'>
                    <PageTitle breadcrumbs={accountBreadCrumbs}>Add Communication</PageTitle>
                    <AddCommunication />
                </Route>

                <Route path='/campaign-workspace/edit-communication/:communicationId'>
                    <PageTitle breadcrumbs={accountBreadCrumbs}>Edit Communication</PageTitle>
                    <EditCommunication />
                </Route>

                <Route path='/campaign-workspace/view-communication'>
                    <PageTitle breadcrumbs={accountBreadCrumbs}>View Communication</PageTitle>
                    <ViewCommunication />
                </Route>


                <Route path='/campaign-workspace/agent-monitoring'>
                    <PageTitle breadcrumbs={accountBreadCrumbs}>Agent Monitoring</PageTitle>
                    <Suspense fallback={<div>Please wait...</div>}>
                        <AgentMonitoring />
                    </Suspense>
                </Route>

                <Redirect from='/campaign-workspace' exact={true} to='/campaign/agent-workspace' />
                <Redirect to='/campaign-workspace/agent-workspace' />
            </Switch>
        </>
    )
}

export default CampaignWorkspacePage
