import React, {useState} from "react";
import useConstant from "../../../../constants/useConstant";
import {LeadPlayersUsernameResponseModel} from "../models/LeadPlayersUsernameResponseModel";
import {GetLeadPlayersByUsername} from "../services/SearchLeadsService";

const useSearchLeadsHooks = () => {
    const { successResponse } = useConstant();

    const [usernameOptions, setUsernameOptions ] = useState<Array<LeadPlayersUsernameResponseModel>>([]);



    const getLeadPlayersByUsernameOptions = ( username: string, userId: number) => {
        GetLeadPlayersByUsername(username, userId)
        .then((response) => {
            if (response.status === successResponse){
                setUsernameOptions((response.data));
            } else {
                console.log('Problem in getting player list');
            }
        })
        .catch(() => {
            console.log('Problem in getting player list');
        });
    }


    return{
        
        usernameOptions,
        getLeadPlayersByUsernameOptions,
        setUsernameOptions,
       
    }
};

export default useSearchLeadsHooks;
