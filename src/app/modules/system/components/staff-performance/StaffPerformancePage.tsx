import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import { PageLink, PageTitle } from '../../../../../_metronic/layout/core';
import { RootState } from '../../../../../setup';
import { checkSessionExpiry } from '../../../../utils/helper';
import { StaffPerformanceContextProvider } from './context/StaffPerformanceContext';
import ReviewPeriodList from './components/ReviewPeriodList';
import StaffPerformanceMain from './components/StaffPerformanceMain';

const accountBreadCrumbs: Array<PageLink> = [
    {
        title: 'Staff Performance Setting',
        path: '/system/staff-performance-setting/',
        isSeparator: false,
        isActive: false,
    },
    {
        title: '',
        path: '',
        isSeparator: true,
        isActive: false,
    },
];

const StaffPerformancePage: React.FC = () => {
    const expiresIn = useSelector<RootState>(({ auth }) => auth.expiresIn, shallowEqual) as string;
    const history = useHistory();
    checkSessionExpiry(history, expiresIn,)

    return (

        <Switch>
            <StaffPerformanceContextProvider>
                <Route exact path='/system/staff-performance-setting/'>
                    <PageTitle breadcrumbs={accountBreadCrumbs}>Staff Performance Setting</PageTitle>
                    <StaffPerformanceMain />
                </Route>
                <Route path='/system/staff-performance-setting/review-period'>
                <PageTitle>Communication Review Period</PageTitle>
                    <ReviewPeriodList />
                </Route>
            </StaffPerformanceContextProvider>
            <Redirect to='/system/staff-performance-setting/' />
        </Switch>
    );
};

export default StaffPerformancePage;
