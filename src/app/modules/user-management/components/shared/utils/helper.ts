import { MainModuleModel } from '../../../models/MainModuleModel';
import {
	homeClaims,
	playerClaims,
	userManagementClaims,
	systemClaims,
	caseCommClaims,
	campaignClaims,
	campaignWorkSpaceClaims,
	campaignDashBoardClaims,
	relationshipManagementClaims,
	caseManagementClaims,
	communicationReviewClaims,
	ticketsClaims,
} from './claims/MainModuleClaims';
import { TeamModel } from '../../../models/TeamModel';
interface TeamOption {
	value: string;
	label: string;
}
export const buildSecurableObjects = (userAccessId: number): Array<MainModuleModel> => {
	let _homeClaims: MainModuleModel = homeClaims(userAccessId);
	let _playerClaims: MainModuleModel = playerClaims(userAccessId);
	let _userManagementClaims: MainModuleModel = userManagementClaims(userAccessId);
	let _systemClaims: MainModuleModel = systemClaims(userAccessId);
	let _caseCommClaims: MainModuleModel = caseCommClaims(userAccessId);
	let _campaignClaims: MainModuleModel = campaignClaims(userAccessId);
	let _campaignWorkSpaceClaims: MainModuleModel = campaignWorkSpaceClaims(userAccessId);
	let _campaignDashBoardClaims: MainModuleModel = campaignDashBoardClaims(userAccessId);
	let _relationshipManagementClaims: MainModuleModel = relationshipManagementClaims(userAccessId);
	let _caseManagementClaims: MainModuleModel = caseManagementClaims(userAccessId);
	let _communicationReviewClaims: MainModuleModel = communicationReviewClaims(userAccessId);
	let _ticketsClaims: MainModuleModel = ticketsClaims(userAccessId);

	let securableItems: Array<MainModuleModel> = [
		_homeClaims,
		_playerClaims,
		_userManagementClaims,
		_systemClaims,
		_caseCommClaims,
		_campaignClaims,
		_campaignWorkSpaceClaims,
		_campaignDashBoardClaims,
		_relationshipManagementClaims,
		_caseManagementClaims,
		_communicationReviewClaims,
		_ticketsClaims,
	];
	return securableItems;
};



export function BuildTeamElements(selectedOptions: Array<TeamOption>, detailList: Array<TeamModel>) {
	const container = document.getElementById('tblAccordion');

	if (container) {
		container.innerHTML = '';
	}
	
	selectedOptions.forEach((option, i) => {
		let selectedOperators = detailList.filter((thing, i, arr) => arr.findIndex((t) => t.id === option.value) === i);
		let listOfSelectedTeams = selectedOperators.filter((thing, i, arr) => arr.findIndex((t) => t.id === thing.id) === i);
		listOfSelectedTeams.forEach((element) => {
			let nameId = element.name.replace(/ /g, '');

			let currencyListDisplay: string = element.currencies.reduce((acc, curr) => {
				if (acc.indexOf(curr.currencyName!) === -1) {
					acc += curr.currencyName + ',';
				}
				return acc;
			}, '').slice(0, -1);
			
			let roleListDisplay: string = element.roles.reduce((acc, curr) => {
				if (currencyListDisplay.indexOf(curr.roleName) === -1) {
					acc += curr.roleName + ',';
				}
				return acc;
			}, '').slice(0, -1);

			let operatorListDisplay: string = element.operators.reduce((acc, curr) => {
				if (currencyListDisplay.indexOf(curr.operatorName) === -1) {
					acc += curr.operatorName + ',';
				}
				return acc;
			}, '').slice(0, -1);

			let brandListDisplay: string = element.brands.reduce((acc, curr) => {
				if (currencyListDisplay.indexOf(curr.brandName!) === -1) {
					acc += curr.brandName + ',';
				}
				return acc;
			}, '').slice(0, -1);

			const content =
				`
                <div class"accordion-item">
                                    <h2 class="accordion-header" id="headingOne" style={CardHeaderStyles}>
                                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#` +
				nameId +
				`" aria-expanded="true" aria-controls="collapseOne">
                                            ${element.name}
                                        </button>
                                    </h2>
                                    <div id="` +
				nameId +
				`" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                        <div class="accordion-body" >
                                            <ul class="list-group">
                                                <li class="list-group-item">
                                                    <label class="form-label-sm fw-bold">Operators:</label>
                                                    <label class="form-label-sm ">${operatorListDisplay} </label>
                                                </li>
                                                <li class="list-group-item">
                                                    <label class="form-label-sm fw-bold">Brands:</label>
                                                    <label class="form-label-sm ">${brandListDisplay}</label>
                                                </li>
                                                <li class="list-group-item">
                                                    <label class="form-label-sm fw-bold">Currencies:</label>
                                                    <label class="form-label-sm ">${currencyListDisplay}</label>
                                                </li>
                                                <li class="list-group-item">
                                                    <label class="form-label-sm fw-bold">Roles:</label>
                                                    <label class="form-label-sm ">${roleListDisplay}</label>
                                                </li>
                                            </ul>
                                            <br />
                                        </div>
                                    </div>
                                </div>`;

			if (container) {
				container.innerHTML += content;
			}
		})
	});
}