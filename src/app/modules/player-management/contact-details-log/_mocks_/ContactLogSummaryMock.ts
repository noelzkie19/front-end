import { ContactLogTeamModel } from './../models/ContactLogTeamModel';
import { ContactLogSummaryModel } from "../models/ContactLogSummaryModel";
import { ContactLogUserModel } from '../models/ContactLogUserModel';


export class ContactLogSummaryMock {
    public static summary : Array<ContactLogSummaryModel> = [
        {
            srcType:'team',
            teamId: 1,
            teamName: 'team1',
            totalUniqueUserCount: 3,
            totalUniquePlayerCount: 5,
        },
        {
            srcType:'team',
            teamId: 2,
            teamName: 'team2',
            totalUniqueUserCount: 2,
            totalUniquePlayerCount: 3,
        },
        {

            srcType:'team',

            teamId: 3,
            teamName: 'team3',
            totalUniqueUserCount: 1,
            totalUniquePlayerCount: 1,
        },
        {
            srcType:'team',

            teamId: 4,
            teamName: 'team5',
            totalUniqueUserCount: 7,
            totalUniquePlayerCount: 9,
        },
        {
            srcType:'team',

            teamId: 5,
            teamName: 'team7',
            totalUniqueUserCount: 13,
            totalUniquePlayerCount: 35,
        },
        {
            srcType:'team',

            teamId: 6,
            teamName: 'team78',
            totalUniqueUserCount: 3,
            totalUniquePlayerCount: 5,
        },
        {
            srcType:'team',

            teamId: 7,
            teamName: 'team1',
            totalUniqueUserCount: 3,
            totalUniquePlayerCount: 5,
        },
        {
            srcType:'team',

            teamId: 8,
            teamName: 'team51',
            totalUniqueUserCount: 3,
            totalUniquePlayerCount: 5,
        },
        
    ]
    public static team : Array<ContactLogTeamModel> = [
        {
            teamId: 1,
            srcType:'user',
            userId: 1,
            userFullName: 'Leo Modino',
            totalClickMobileCount: 3,
            totalClickEmailCount: 3,
            totalUniquePlayerCount: 2,
        },
        {
            teamId: 1,
            srcType:'user',
            userId: 2,
            userFullName: 'Jhon Agapito',
            totalClickMobileCount: 3,
            totalClickEmailCount: 3,
            totalUniquePlayerCount: 2,
        },
        {

            teamId: 2,
            srcType:'user',
            userId: 3,
            userFullName: 'Rolando Cedron',
            totalClickMobileCount: 3,
            totalClickEmailCount: 3,
            totalUniquePlayerCount: 2,
        },
        {
            teamId: 2,
            srcType:'user',
            userId: 4,
            userFullName: 'Kenneth Canet',
            totalClickMobileCount: 3,
            totalClickEmailCount: 3,
            totalUniquePlayerCount: 2,
        },
        {
            teamId: 4,
            srcType:'user',
            userId: 5,
            userFullName: 'Kenneth Montevirgen',
            totalClickMobileCount: 3,
            totalClickEmailCount: 3,
            totalUniquePlayerCount: 2,
        },
        {
            teamId: 6,
            srcType:'user',
            userId: 6,
            userFullName: 'Cess Santillan',
            totalClickMobileCount: 3,
            totalClickEmailCount: 3,
            totalUniquePlayerCount: 2,
        },
        {
            teamId: 4,
            srcType:'user',
            userId: 7,
            userFullName: 'Jerryson Lascon',
            totalClickMobileCount: 3,
            totalClickEmailCount: 3,
            totalUniquePlayerCount: 2,
        },
        {
            teamId: 7,
            srcType:'user',
            userId: 8,
            userFullName: 'Roland Ventanilla',
            totalClickMobileCount: 3,
            totalClickEmailCount: 3,
            totalUniquePlayerCount: 2,
        },
        
    ]
    public static user : Array<ContactLogUserModel> = [
        {
            userId: 1,
            userFullName: 'Ready Player One',
            userName: '',
            brand: '',
            currency: '',
            vipLevel: '',
            actionDate: '',
            viewData: ''
        },
        {
            userId: 1,
            userFullName: 'Ready Player Two',
            userName: '',
            brand: '',
            currency: '',
            vipLevel: '',
            actionDate: '',
            viewData: ''
        },
        {
            userId: 1,
            userFullName: 'Ready Player Three',
            userName: '',
            brand: '',
            currency: '',
            vipLevel: '',
            actionDate: '',
            viewData: ''
        },
        {
            userId: 4,
            userFullName: 'Ready Player Four',
            userName: '',
            brand: '',
            currency: '',
            vipLevel: '',
            actionDate: '',
            viewData: ''
        },
        {
            userId: 2,
            userFullName: 'Ready Player Five',
            userName: '',
            brand: '',
            currency: '',
            vipLevel: '',
            actionDate: '',
            viewData: ''
        },
        {
            userId: 4,
            userFullName: 'Ready Player Six',
            userName: '',
            brand: '',
            currency: '',
            vipLevel: '',
            actionDate: '',
            viewData: ''
        },
        {
            userId: 3,
            userFullName: 'Ready Player Seven',
            userName: '',
            brand: '',
            currency: '',
            vipLevel: '',
            actionDate: '',
            viewData: ''
        },
        {
            userId: 5,
            userFullName: 'Ready Player Eight',
            userName: '',
            brand: '',
            currency: '',
            vipLevel: '',
            actionDate: '',
            viewData: ''
        },
        
    ]
}
