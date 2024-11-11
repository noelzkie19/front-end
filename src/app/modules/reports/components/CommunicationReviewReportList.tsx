import {MainContainer} from '../../../custom-components';
import CommunicationReviewReportFilter from './CommunicationReviewReportFilter';
import {useState} from 'react';
import {enableSplashScreen, disableSplashScreen} from '../../../utils/helper';
import {GenerateCommunicationReviewList} from '../services/CommunicationReviewReportApi';
import swal from 'sweetalert';
import CommunicationReviewIndividualList from './CommunicationReviewIndividualList';
import CommunicationReviewGroupList from './CommunicationReviewGroupList';
import {CommunicationReviewAccordionModel} from './models/CommunicationReviewAccordionModel';
import {Max_Open_Accordion} from '../constants/ReportConstants';
import {USER_CLAIMS} from '../../user-management/components/constants/UserClaims';
import {shallowEqual, useSelector} from 'react-redux';
import {RootState} from '../../../../setup';
import {useHistory} from 'react-router-dom';

export const CommunicationReviewReportList = () => {
	const [reportListing, setReportListing] = useState<CommunicationReviewAccordionModel[]>([]);
	const [paramBundle, setParamBundle] = useState<any>();
	const [selectedGrouping, setSelectedGrouping] = useState<string | number | null>(null); // The value will be from CommunicationReviewFilter
	const userAccess = useSelector<RootState>(({auth}) => auth.access, shallowEqual) as string;
	const history = useHistory();
	
		if (userAccess.includes(USER_CLAIMS.CommunicationReviewReportRead) === false && userAccess.includes(USER_CLAIMS.CommunicationReviewReportWrite) === false) {
			history.push('/error/401');
			disableSplashScreen();
		}

	const onClickSearch = async (request: any) => {
		if (!request) return;
		setSelectedGrouping(request.displayType);
		enableSplashScreen();
		setParamBundle(request);
		GenerateCommunicationReviewList(request)
			.then(({data}) => {
				let result: CommunicationReviewAccordionModel[] = data.reduce((acc: any, curr: any) => {
					acc.push({
						accordionIndex: acc.length,
						headerId: curr.id,
						header: curr.name,
						recordCount: curr.recordCount,
						isOpen: false,
					});
					return acc;
				}, []);
				setReportListing(result);
				setParamBundle(request);
				disableSplashScreen();
			})
			.catch((err) => {
				swal('Failed', 'Problem in exporting list', 'error');
				disableSplashScreen();
			});
	};

	const handleOpenAccordion = (accordionIndex: number, accordionStatus: boolean) => {
		if (accordionStatus) {
			defaultAccordionAction(accordionIndex);
			return;
		}
		const validateIfMaxOpenAccordion = reportListing.filter((reviewee: any) => reviewee.isOpen === true);

		if (validateIfMaxOpenAccordion.length === Max_Open_Accordion) {
			const findAccordiontoClose: CommunicationReviewAccordionModel = validateIfMaxOpenAccordion.reduce((acc: any, curr: any) => {
				return acc.accordionIndex < curr.accordionIndex ? acc : curr;
			});
			modifiedAccortionAction(findAccordiontoClose, accordionIndex);
		} else {
			defaultAccordionAction(accordionIndex);
		}
	};

	const modifiedAccortionAction = (findAccordiontoClose: CommunicationReviewAccordionModel, accordionIndex: number) => {
		const updateAccordion = reportListing.map((accordion: CommunicationReviewAccordionModel, idx: number) => {
			if (accordion === findAccordiontoClose) {
				return {...accordion, isOpen: false};
			}
			if (idx === accordionIndex) {
				return {...accordion, isOpen: true};
			} else return accordion;
		});
		setReportListing(updateAccordion);
	};

	const defaultAccordionAction = (accordionIndex: number) => {
		const updateAccordion = reportListing.map((accordion: CommunicationReviewAccordionModel, idx: number) => {
			if (idx === accordionIndex) {
				return {...accordion, isOpen: !accordion.isOpen};
			} else return accordion;
		});
		setReportListing(updateAccordion);
	};

	return (
		<MainContainer>
			<CommunicationReviewReportFilter onClickSearch={onClickSearch} />
			<div style={{margin: '20px'}}>
				{selectedGrouping === '352' ? (
					<CommunicationReviewIndividualList accordionList={reportListing} accordionToggle={handleOpenAccordion} request={paramBundle} />
				) : (
					<CommunicationReviewGroupList accordionList={reportListing} request={paramBundle} />
				)}
			</div>
		</MainContainer>
	);
};

export default CommunicationReviewReportList;
