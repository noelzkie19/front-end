import { useSelector, shallowEqual } from "react-redux"
import { Switch, Route, useHistory, Redirect } from "react-router-dom"
import { RootState } from "../../../setup"
import swal from 'sweetalert';
import { PageLink, PageTitle } from "../../../_metronic/layout/core"
import { USER_CLAIMS } from "../user-management/components/constants/UserClaims"
import { SurveyAndFeedbackDashboard } from "../campaign-dashboard-survey-feedback/components"
import CampaignPerformance from "../campaign-dashboard-performance/components/CampaignPerformance"

const accountBreadCrumbs: Array<PageLink> = [
    {
        title: 'Campaign Dashboard',
        path: '/campaign-dashboard',
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

const CampaignDashboardPage: React.FC = () => {

    const expiresIn = useSelector<RootState>(({ auth }) => auth.expiresIn, shallowEqual) as string
    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number
    const userAccess = useSelector<RootState>(({ auth }) => auth.access, shallowEqual) as string
    const history = useHistory();

    const expiration = new Date(expiresIn)
    const today = new Date();

    if (!(userAccessId != 0 && !(userAccess.includes(USER_CLAIMS.AdminRead) === true || userAccess.includes(USER_CLAIMS.AdminWrite) === true))) {
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
    }

    return (
        <>
            <Switch>
                <Route path='/campaign-dashboard/survey-and-feedback'>
                    <PageTitle breadcrumbs={accountBreadCrumbs}>Survey and Feedback</PageTitle>
                    <SurveyAndFeedbackDashboard />
                </Route>
                <Route path='/campaign-dashboard/campaign-performance'>
                    <PageTitle breadcrumbs={accountBreadCrumbs}>Campaign Performance</PageTitle>
                    <CampaignPerformance />
                </Route>
                <Redirect to='/campaign-dashboard' />
            </Switch>
        </>
    )
}

export default CampaignDashboardPage