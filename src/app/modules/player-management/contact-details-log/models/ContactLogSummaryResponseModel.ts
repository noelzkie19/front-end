import { ContactLogSummary } from './../components/contact-details-log-summary';
import { ContactLogSummaryModel } from './ContactLogSummaryModel';


export interface ContactLogSummaryResponseModel 
{
    contactLogSummaryList: Array<ContactLogSummaryModel>,
    recordCount : number
}
