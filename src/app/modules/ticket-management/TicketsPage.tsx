import React, {useState} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {Redirect, Route, Switch, useHistory} from 'react-router-dom';
import {PageLink, PageTitle} from '../../../_metronic/layout/core';
import {RootState} from '../../../setup';
import {checkSessionExpiry} from '../../utils/helper';
import AddTicket from './components/AddTicket';
import EditTicket from './components/EditTicket';
import SearchTicket from './components/SearchTicket';
import ViewTicket from './components/ViewTicket';
import {TicketContextProvider} from './context/TicketContext';

const accountBreadCrumbs: Array<PageLink> = [
	{
		title: 'Ticket',
		path: '',
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

const TicketsPage: React.FC = () => {
	const expiresIn = useSelector<RootState>(({auth}) => auth.expiresIn, shallowEqual) as string;
	const history = useHistory();
	checkSessionExpiry(history, expiresIn);
	const [description, setDescription] = useState<string>('');

	const getTicketSummary = (summary: string) => {
		setDescription(summary);
	};

	return (
		<Switch>
			<TicketContextProvider>
				<Route path='/ticket-management/search-ticket/:filterId'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Search Ticket</PageTitle>
					<SearchTicket />
				</Route>
				<Route exact path='/ticket-management/search-ticket'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Search Ticket</PageTitle>
					<SearchTicket />
				</Route>
				<Route path='/ticket-management/add-ticket'>
					<PageTitle breadcrumbs={accountBreadCrumbs}>Add Ticket</PageTitle>
					<AddTicket />
				</Route>
				<Route path='/ticket-management/view-ticket/:ticketCode'>
					<PageTitle description={description} breadcrumbs={accountBreadCrumbs}>
						View Ticket
					</PageTitle>
					<ViewTicket getTicketSummary={getTicketSummary} />
				</Route>
				<Route path='/ticket-management/edit-ticket/:ticketCode'>
					<PageTitle description={description} breadcrumbs={accountBreadCrumbs}>
						Edit Ticket
					</PageTitle>
					<EditTicket getTicketSummary={getTicketSummary} />
				</Route>
			</TicketContextProvider>
			<Redirect to='/ticket-management/add-ticket' />
		</Switch>
	);
};

export default TicketsPage;
