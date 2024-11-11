import { ICorePlayerModel } from "../models/ICorePlayerModel"

export const actionTypes = {
    importPlayers: 'importPlayers'
}

export const actions = {
    //**  CHECK ACTION REQUEST*/
    requestUser: () => ({
        type: actionTypes.importPlayers,
    }),

    importPlayers: (importPlayers: ICorePlayerModel) => ({ type: actionTypes.importPlayers, payload: { importPlayers } }),
}