import React,{ useState,useEffect } from 'react'
import { useSelector,shallowEqual } from 'react-redux'
import { RootState } from '../../../../../setup'
import { useFormik } from 'formik'
import { ModalFooter } from 'react-bootstrap-v5'
import { ButtonsContainer, ContentContainer, DangerButton, DefaultButton, ErrorLabel, FieldContainer, FieldLabel, FormContainer, FormHeader, FormModal, LoaderButton, MainContainer, PaddedContainer, SearchTextInput, SuccesLoaderButton } from '../../../../custom-components'
import DefaultFileInput from '../../../../custom-components/file-inputs/DefaultFileInput'
import { ICorePlayerModel } from '../../models/ICorePlayerModel'
import swal from 'sweetalert'
import { GetInvalidPlayerListResult, ImportPlayers, ValidateImportPlayers } from '../../redux/PlayerManagementService'
import { ImportPlayersRequestModel } from '../../models/ImportPlayersRequestModel'
import { Guid } from 'guid-typescript'
import * as hubConnection from '../../../../../setup/hub/MessagingHub'
import AlertLabel from '../../../../custom-components/labels/AlertLabel'
import { AlertLabelModel } from '../../../../custom-components/models/AlertLabelModel'
import { CSVLink } from "react-csv";
import { compressToBase64, decompressFromBase64  } from "lz-string"
import { EILSEQ } from 'constants'
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils'
import { usePortalRedirect } from '../../../../custom-functions'

interface Props {
    showForm: boolean
    closeModal: () => void
}

const initialValues = {
    //fileInput: '',
}

const csvHeader = [
    { label: "PlayerId", key: "playerId" },
    { label: "Brand", key: "brand" },
    { label: "Username", key: "username" },
    { label: "Status", key: "status" },
    { label: "FirstName", key: "firstName" },
    { label: "LastName", key: "lastName" },
    { label: "Currency", key: "currency" },
    { label: "MarketingChannel", key: "marketingChannel" },
    { label: "MarketingSource", key: "marketingSource" },
    { label: "Address", key: "address" },
    { label: "Country", key: "country" },
    { label: "Email", key: "email" },
    { label: "VipLevel", key: "vipLevel" },
    { label: "SignupDate", key: "signupDate" },
    { label: "SignUpPortal", key: "signUpPortal" },
    { label: "Language", key: "language" },
    { label: "LastLogon", key: "lastLogon" },
    { label: "DeviceID", key: "deviceIDString" },
    { label: "CampaignName", key: "campaignName" },
    { label: "BTAG", key: "btag" }
  ];
   
  let csvData : any = []

const ImportPlayersModal: React.FC<Props> = ({ showForm, closeModal }) => {
    
    // -----------------------------------------------------------------
    // GET REDUX STORE
    // -----------------------------------------------------------------
    const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number
    const userAccess = useSelector<RootState>(({ auth }) => auth, shallowEqual)

    // -----------------------------------------------------------------
    // STATES
    // -----------------------------------------------------------------
    const [submitDisable, setSubmitDisable] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<AlertLabelModel>()
    const [validPlayers, setValidPlayers] = useState<number>(0)
    const [invalidPlayers, setInvalidPlayers] = useState<number>(0)
    const [fileName, setFileName] = useState<string>('')
    const [showResults, setShowResults] = useState<boolean>(false);
    const [importPlayers, setImportPlayers] = useState<Array<ICorePlayerModel>>();
    let alertLabel : AlertLabelModel;

    // -----------------------------------------------------------------
    // VARIABLES
    // -----------------------------------------------------------------
    const fileType = 'text/xml'   
    const fileId = 'fileInput'  
    
    // -----------------------------------------------------------------
    // WATCHER
    // -----------------------------------------------------------------
    useEffect(() => {
        
        alertLabel = { hasAlert: false, message: "", status: "" }
        setAlertMessage(alertLabel)

        setLoading(false)
        setValidPlayers(0)
        setInvalidPlayers(0)
        setImportPlayers(new Array<ICorePlayerModel>())
        setShowResults(false)

    }, [])

     // -----------------------------------------------------------------
    // FORMIK FORM POST
    // -----------------------------------------------------------------
    const formik = useFormik({
        initialValues,
        onSubmit: (values, { setSubmitting, resetForm }) => {           

            if(validPlayers > 0){
                
                setLoading(true)
                setSubmitDisable(true)
                
                const queueId = Guid.create().toString();
                const request: ImportPlayersRequestModel = {
                    id: 0,
                    name: "",
                    description: "",
                    status: 0,
                    players: compressToBase64(JSON.stringify(importPlayers)),
                    createdBy: userAccessId,
                    queueId: queueId,
                    userId: userAccessId.toString()

                }
                
                //console.log(JSON.stringify(request, null, 2))

                swal({
                    title: "Confirmation",
                    text: "This action will import all the valid players, please confirm",
                    icon: "warning",
                    buttons: ["No", "Yes"],
                    dangerMode: true
                }).then(async (willCreate) => {
                    
                    if (willCreate) {

                        await ImportPlayers(request)
                            .then((response) => {

                                if (response.status === 200) {

                                    const messagingHub = hubConnection.createHubConnenction();
                                    messagingHub
                                        .start()
                                        .then(() => {

                                            if (messagingHub.state === 'Connected') {
                                                messagingHub.on(queueId, message => {
                                                    
                                                    let resultData = JSON.parse(message.remarks);
        
                                                    if (resultData.Status === 200) {
                                                        alertLabel = { hasAlert: true, message: "Your data has been imported successfully!", status: "success" }  
                                                        setAlertMessage(alertLabel)                                                       
                                                        clearData()
                                                    } else {                                                          
                                                        alertLabel = { hasAlert: true, message: resultData.Message, status: "danger" }
                                                        setAlertMessage(alertLabel) 
                                                    }
                                                    
                                                    setLoading(false)
                                                    messagingHub.off(queueId)
                                                    messagingHub.stop()
                                                })

                                                setTimeout(() => {
                                                    if (messagingHub.state === 'Connected') {
                                                        messagingHub.stop();
                                                        setLoading(false)
                                                        swal("The server is taking too long to response.");
                                                    }
                                                }, 30000)
                                            }

                                        })    
                                }
                                else{
                                    setLoading(false)
                                    alertLabel = { hasAlert: true, message: response.statusText, status: "danger" }
                                    setAlertMessage(alertLabel)                                    
                                }

                            }).catch(err => console.log('Error while starting connection: ' + err))

                    }
                    else{
                        setLoading(false)
                        setSubmitDisable(false)
                    }
                })
            }
            else if(invalidPlayers > 0){
                alertLabel = { hasAlert: true, message: "There has no valid players to be imported.", status: "danger" }
                setAlertMessage(alertLabel)
                setLoading(false)
            }
            else{
                alertLabel = { hasAlert: true, message: "Player XML File is required", status: "danger" }
                setAlertMessage(alertLabel)
                setLoading(false)
            }
        }
    })

    // -----------------------------------------------------------------
    // METHODS
    // -----------------------------------------------------------------
    const redirectPortal = usePortalRedirect();

    const onChangeSelectedFile = async (val: any) => {
        //initialize
        setLoading(true)
        alertLabel = { hasAlert: false, message: "", status: "" }
        setAlertMessage(alertLabel)
        clearData()

        //validate the file
        await validate(val);
    }

    const clearData = () => {
        setValidPlayers(0)
        setInvalidPlayers(0)
        setFileName('')
        setShowResults(false)
        setSubmitDisable(true)        
    }

    const closeModalForm = () => {        

        if(loading == true){
            swal("You cannot close this form while a task is active");
        }
        else{

            if(validPlayers > 0){
                swal({
                    title: "Confirmation",
                    text: "Any changes will be discarded, please confirm",
                    icon: "warning",
                    buttons: ["No", "Yes"],
                    dangerMode: true
                }).then(async (willCreate) => {
                    if (willCreate) {                        
                        closeModal()                        
                        clearData()
                        alertLabel = { hasAlert: false, message: "", status: "" }  
                        setAlertMessage(alertLabel)
                    }
                    else{
                        setLoading(false)
                        setSubmitDisable(false)
                    }
                });
            }
            else{
                closeModal()                     
                clearData()
                alertLabel = { hasAlert: false, message: "", status: "" }  
                setAlertMessage(alertLabel)           
            }
            
        }
    }

    async function validate(val : any) {
        
        //First: validate the file - size && fileType
        let isValidFile = true;

        if(val != null){
            const selFile = val.target.files[0];   
            const selFileSize = selFile.size / (1024*1024) //bytesToMegaBytes
            
            setFileName(selFile.name)

            if(selFile.type != fileType)  {
                alertLabel = { hasAlert: true, message: "Invalid file type", status: "danger" }
                setAlertMessage(alertLabel)
                isValidFile = false;
            }   
            else if(selFileSize >= 2){
                alertLabel = { hasAlert: true, message: "File size exceeds the allowable (2MB) limit", status: "danger" }
                setAlertMessage(alertLabel)
                isValidFile = false;
            }            
        }
        else{
            alertLabel = { hasAlert: true, message: "PlayerList XML File is required", status: "danger" }
            setAlertMessage(alertLabel)
            isValidFile = false;
        }

        //Second: check if valid playerlist XML 
        if(isValidFile)
            await validatePlayerXML(val);
        else
            setLoading(false)
    }

    async function validatePlayerXML(val : any) {
        
        let reader = new FileReader();
        reader.readAsText(val.target.files[0]);

        reader.onload = (e : any) => {

            var parseString = require('xml2js').parseString;
            parseString(e.target.result, { mergeAttrs: true }, async function (err:any, result:any) {
                
                if(result != null && 
                    result.Report != null && 
                    result.Report.Tablix1 != null && 
                    result.Report.Tablix1[0].Details_Collection[0] != null){

                        var details = result.Report.Tablix1[0].Details_Collection[0].Details;                        
                        var itemRows : Array<ICorePlayerModel> = new Array<ICorePlayerModel> ();
                        var collections = result.Report.Tablix1[0].Details_Collection;
                        var invalidPlayerCnt = 0;
                        
                        for (let item of result.Report.Tablix1[0].Details_Collection[0].Details) {

                            const request: ICorePlayerModel = 
                                                {
                                                    playerId : item.PlayerId == '' ? '0' : item.PlayerId[0],
                                                    brand : item.Brand == undefined ? null : item.Brand[0].toString(),
                                                    username : item.Username == undefined ? null : item.Username[0].toString(),
                                                    status : item.Status == undefined ? null : item.Status[0].toString(),
                                                    firstName : item.FirstName == undefined ? null : item.FirstName[0].toString(),
                                                    lastName : item.LastName == undefined ? null : item.LastName[0].toString(),
                                                    currency : item.Currency == undefined ? null : item.Currency[0].toString(),
                                                    marketingChannel : item.MarketingChannel == undefined ? null : item.MarketingChannel[0].toString(),
                                                    marketingSource : item.MarketingSource == undefined ? null : item.MarketingSource[0].toString(),
                                                    address : item.Address == undefined ? null : item.Address[0].toString(),
                                                    country : item.Country == undefined ? null : item.Country[0].toString(),
                                                    email : item.EMail == undefined ? null : item.EMail[0].toString(),
                                                    vipLevel : item.VipLevel == undefined ? null : item.VipLevel[0].toString(),
                                                    signupDate : item.SignupDate == undefined ? null : item.SignupDate[0].toString(),
                                                    signUpPortal : item.SignUpPortal == undefined ? null : item.SignUpPortal[0].toString(),
                                                    phoneNumber : item.PhoneNumber == undefined ? null : item.PhoneNumber[0].toString(),
                                                    language : item.Language == undefined ? null : item.Language[0].toString(),
                                                    lastLogon : item.LastLogon == undefined ? null : item.LastLogon[0].toString(),
                                                    netLoss : item.NetLoss == undefined ? 0: parseFloat(item.NetLoss[0]),
                                                    deviceID : item.DeviceID == undefined ? 0 : parseFloat(item.DeviceID[0]),
                                                    btag: item.BTAG == undefined ? "" : item.BTAG[0],
                                                    campaignName: item.CampaignName == undefined ? null : item.CampaignName[0],
                                                }

                                itemRows.push(request);
                            
                        }                        

                        await validatePlayerDetails(itemRows)
                        val.target.value = null;                        
                }
                else{
                    alertLabel = { hasAlert: true, message: "Please upload valid PlayerList XML file", status: "danger" }
                    setAlertMessage(alertLabel)    
                    setLoading(false)                
                }
            });

        };        

    }

    async function validatePlayerDetails(players: Array<ICorePlayerModel>) {
        
        const queueId = Guid.create().toString();
        const request: ImportPlayersRequestModel = {
            id: 0,
            name: "",
            description: "",
            status: 0,
            players: compressToBase64(JSON.stringify(players)),
            createdBy: userAccessId,
            queueId: queueId,
            userId: userAccessId.toString()
        }

        await ValidateImportPlayers(request)
            .then((response) => {
                
                if (response.status === 200) {

                    const messagingHub = hubConnection.createHubConnenction();
                    messagingHub
                        .start()
                        .then(() => {

                            if (messagingHub.state === 'Connected') {
                                messagingHub.on(queueId, message => {
                                    
                                    let resultData = JSON.parse(message.remarks);
                                    if (resultData.Status === 200) {

                                        // console.log('queueId')
                                        // console.log(queueId)
                                        // console.log(message.cacheId)

                                        GetInvalidPlayerListResult(message.cacheId)
                                            .then((result) => {

                                                let decodedData =  decompressFromBase64(result.data) ?? "";                                                
                                                var invalidPlayersData : ICorePlayerModel[] = JSON.parse(decodedData)  
                                                let validPlayersData = new Array<ICorePlayerModel>();
                                                
                                                if(invalidPlayersData.length > 0){

                                                    players.forEach(e => {
                                                        if(!invalidPlayersData.find(i=> i.playerId === e.playerId)){
                                                            validPlayersData.push(e);
                                                        }
                                                    });

                                                    //added quote to read as string in CSV
                                                    invalidPlayersData.forEach(i=>i.username = "'" + i.username)
                                                    invalidPlayersData.forEach(i=>i.deviceIDString = "'" + i.deviceID)
                                                }   
                                                else{
                                                    validPlayersData = players;
                                                }                         
                                                
                                                csvData = invalidPlayersData;
                                                setImportPlayers(validPlayersData)
                                                setValidPlayers(validPlayersData.length)                        
                                                setInvalidPlayers(invalidPlayersData.length)
                                                setShowResults(true)
                                                setLoading(false)

                                                if(invalidPlayersData.length > 0){
                                                    alertLabel = { hasAlert: true, message: "XML Player list has  (" + invalidPlayersData.length + ") invalid players.", status: "warning" }
                                                    setAlertMessage(alertLabel)
                                                }

                                                if(validPlayersData.length > 0){
                                                    setSubmitDisable(false)
                                                }

                                            })
                                            .catch(() => {
                                                swal("Problem in getting response from player list");
                                                setLoading(false)
                                            });
                                            
                                    } else {                                                          
                                        console.log('Error connection in callback.')   
                                        setLoading(false)                                     
                                    }
                                    
                                    messagingHub.off(queueId)
                                    messagingHub.stop()
                                })

                                setTimeout(() => {
                                    if (messagingHub.state === 'Connected') {
                                        messagingHub.stop();
                                        setLoading(false)
                                        swal("The server is taking too long to response.");
                                    }
                                }, 100000)
                            }

                        })    
                }
                else{
                    console.log('Error connection in gateway')   
                }

            }).catch(err => console.log('Error while starting connection: ' + err))

    }
    
    return(
        <FormModal headerTitle={'Import Players'} haveFooter={false} show={showForm}>
        <FormContainer onSubmit={formik.handleSubmit}>
            <MainContainer>
                <ContentContainer>
                    <AlertLabel alert={alertMessage}  />
                    <FieldContainer>
                        <DefaultFileInput accept={fileType} onChange={onChangeSelectedFile} disabled={loading} />
                    </FieldContainer>
                    {
                        showResults?
                            <><FieldContainer>
                                <div className="col-sm-12">
                                    <label className="form-label-sm">File name:&nbsp;</label>
                                    <b>{fileName}</b>
                                </div>
                            </FieldContainer>
                            <FieldContainer>
                                <div className="col-sm-12">
                                    <label className="form-label-sm">Valid Player count:&nbsp;</label>
                                    <b>{validPlayers}</b>
                                </div>
                            </FieldContainer>
                            <FieldContainer>
                                <div className="col-sm-12">
                                    <label className="form-label-sm">Invalid Player count:&nbsp;</label>
                                    {                                        
                                        invalidPlayers > 0 ?
                                        <><b><CSVLink data={csvData} headers={csvHeader}>{invalidPlayers}</CSVLink></b></>
                                        :
                                        <><b>{invalidPlayers}</b></>
                                    }
                                </div>
                            </FieldContainer>
                            </> 
                        :
                        ""
                    }                                      

                </ContentContainer>
            </MainContainer>
            <FieldContainer>
                <div className="col-sm-8" style={{paddingLeft: 3 + 'rem', fontWeight: 'bold'}}>
                    <p> Input file must be an XML file downloaded from MCore system <br/> in the same environment with current MLAB system opened.</p>
                    Click <a href={redirectPortal} target="_blank">here </a>
                </div>
            </FieldContainer>
            <ModalFooter style={{border:0}}>
                <SuccesLoaderButton title={'Submit'} loading={loading} disabled={submitDisable} loadingTitle={'Please wait ...'}/>
                <button type='button' className="btn btn-secondary btn-sm me-2" onClick={closeModalForm}>Close</button>
            </ModalFooter>
        </FormContainer>
        </FormModal>
    )

}

export default ImportPlayersModal