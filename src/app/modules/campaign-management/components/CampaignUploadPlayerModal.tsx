import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { left, right } from '@popperjs/core'
import { useFormik } from 'formik'
import { Guid } from 'guid-typescript'
import { compressToBase64 } from 'lz-string'
import { useEffect, useState } from 'react'
import { ModalFooter } from 'react-bootstrap-v5'
import { CSVLink } from 'react-csv'
import { shallowEqual, useSelector } from 'react-redux'
import swal from 'sweetalert'
import { RootState } from '../../../../setup'
import * as hubConnection from '../../../../setup/hub/MessagingHub'
import { ElementStyle } from '../../../constants/Constants'
import useConstant from '../../../constants/useConstant'
import {
  ContentContainer,
  DefaultFileInput,
  FieldContainer,
  FormContainer,
  FormModal,
  MainContainer,
  MlabButton
} from '../../../custom-components'
import AlertLabel from '../../../custom-components/labels/AlertLabel'
import { AlertLabelModel } from '../../../custom-components/models/AlertLabelModel'
import { CampaignImportPlayerModel } from '../models/request/CampaignImportPlayerModel'
import { CampaignImportPlayerRequestModel } from '../models/request/CampaignImportPlayerRequestModel'
import { CampaignModel } from '../models/request/CampaignModel'
import { ValidatedImportPlayer } from '../models/request/ValidatedImportPlayer'
import { getvalidateImportPlayersResult, processImportPlayer, processImportPlayerResult, validateImportPlayers } from '../redux/CampaignManagementService'

interface Props {
  showForm: boolean
  closeModal: () => void,
  onHide?: () => void
  tempCampaignGuid: string,
  successUpload: () => void
}
let csvData: any = []
const csvHeader = 
[
  {label: 'Player Id', key: 'playerId'},
  {label: 'Username', key: 'userName'},
  {label: 'Brand', key: 'brand'}
]

export const CampaignUploadPlayerModal = (props: Props) => {
  const [showResults, setShowResults] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<AlertLabelModel>()
  const [loading, setLoading] = useState<boolean>(false)
  const [fileName, setFileName] = useState<string>('')
  const [requestImportPlayer, setRequestImportPlayer] = useState<any>()
  const [validPlayers, setValidPlayers] = useState<number>(0)
  const [invalidPlayers, setInvalidPlayers] = useState<number>(0)
  const [duplicatePlayers, setDuplicatePlayers] = useState<number>(0)
  const [disableSubmit, setDisableSubmit] = useState<boolean>(true)
  const campaignState = useSelector<RootState>(({campaign}) => campaign.campaign,shallowEqual) as CampaignModel
  const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number
  let alertLabel: AlertLabelModel
	const {HubConnected,successResponse} = useConstant();

  const initialValues = {
    //fileInput: '',
  }
  const fileType = 'text/csv'
  // -----------------------------------------------------------------
  // FORMIK FORM POST
  // -----------------------------------------------------------------
  const formik = useFormik({
    initialValues,
    onSubmit: (values, {setSubmitting, resetForm}) => {},
  })
  const onChangeSelectedFile = async (val: any) => {
    //initialize
    setLoading(true)
    resetCount()
    alertLabel = {hasAlert: false, message: '', status: ''}
    setAlertMessage(alertLabel)
    // clearData()

    //validate the file
    await validate(val)
  }
  useEffect(() => {
    resetCount()
  }, [])
  async function validate(val: any) {
    //First: validate the file - size && fileType
    let isValidFile = true

    if (val != null) {
      const selFile = val.target.files[0]
      const selFileSize = selFile?.size / (1024 * 1024) //bytesToMegaBytes

      setFileName(selFile.name)

      if (val.target.accept != fileType)  {
        alertLabel = {hasAlert: true, message: 'Invalid file format, please upload in a CSV file with the following details: Player ID, Username, Brand', status: 'danger'}
        setAlertMessage(alertLabel)
        isValidFile = false
      } else if (selFileSize >= 2) {
        alertLabel = {
          hasAlert: true,
          message: 'File size exceeds the allowable (2MB) limit',
          status: 'danger',
        }
        setAlertMessage(alertLabel)
        isValidFile = false
      }
    } else {
      alertLabel = {hasAlert: true, message: 'PlayerList CSV File is required', status: 'danger'}
      setAlertMessage(alertLabel)
      isValidFile = false
    }

    //Second: check if valid playerlist XML
    if (isValidFile) {
      await validatePlayerCSV(val)
    }
    else setLoading(false)
  }
  async function validatePlayerCSV(val: any) {
    setDisableSubmit(true)
    let reader = new FileReader()
    reader.readAsText(val.target.files[0])
    reader.onload = async (e: any) => {
      //Split the data
      const linesArray = e.target.result.split('\n')
      let result = []
      let expectedHeader = ['username', 'playerid','brand'];
      //Get the Header
      let headers = linesArray[0].toLowerCase().replace(/\s/g, '').replace(/['"]+/g, '').split(',')
      //Validate headers
      let isValidHeader = validateCSVHeader(headers,expectedHeader);
      if(!isValidHeader) return false
      //Loop through the data
      for (let i = 1; i < linesArray.length; i++) {
        let obj = Object.assign({})
        let currentline = linesArray[i].split(',')
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[j]?.trim().replace(/['"]+/g, '')
        }
        result.push(obj)
      }

      let playerList = result.filter(a=> ((a.brand != '' && a.brand != undefined) 
                      || (a.playerid != '' && a.playerid != undefined) 
                      || (a.username !='' && a.username != undefined)));
                      
    
      const campaignImportPlayerModel: CampaignImportPlayerModel = {
        campaignCSVPlayerListModel: playerList, // compressToBase64(JSON.stringify(playerList)),
        campaignId: campaignState.campaignId,
        guidId: campaignState.campaignId  <= 0 ?  campaignState.campaignGuid  : "" ,
        queueId: Guid.create().toString(),
        userId: userAccessId.toString()
      }
      validatePlayerDetails(campaignImportPlayerModel);
    }
  }
  function validateCSVHeader(headers : any, expectedHeader: any) {
    let status = true;
    headers.forEach((element: any) => {
      let _header = element != "" ? expectedHeader.find((p: any) => p == element): ""
      if (_header == undefined) {
        alertLabel = { hasAlert: true, message: 'Invalid file format, please upload in a CSV file with the following details: Player ID, Username, Brand', status: 'danger' }
        setAlertMessage(alertLabel)
        status = false
        setDisableSubmit(true)
        setLoading(false)
      }
    })
    return status
  }
  const resetCount = () => {
    setValidPlayers(0)
    setDuplicatePlayers(0)
    setInvalidPlayers(0)
    setFileName('')
    setShowResults(false)
  }
  const campaignImportRequest = (players: CampaignImportPlayerModel) => {
   const request : CampaignImportPlayerRequestModel = {
      players: compressToBase64(JSON.stringify(players)),
      queueId:  Guid.create().toString(),
      userId: userAccessId.toString(),
    }
    return request;
  }
  const valitdateImportPlayerResult = (resultData : ValidatedImportPlayer) => {
    setShowResults(true)
    if (resultData.validatedPlayerList.invalidPlayerCount > 0) {
      csvData = resultData.campaignCSVPlayerList;
      alertLabel = { hasAlert: true, message: 'CSV Player list has (' + resultData.validatedPlayerList.invalidPlayerCount + ') invalid players.', status: 'warning' }
      setAlertMessage(alertLabel);
      setInvalidPlayers(resultData.validatedPlayerList.invalidPlayerCount)
    }

    if (resultData.validatedPlayerList.validPlayerCount > 0)
      setDisableSubmit(false)

    setValidPlayers(resultData.validatedPlayerList.validPlayerCount)
    setDuplicatePlayers(resultData.validatedPlayerList.duplicatePlayerCount)
    setLoading(false)
  }
  async function validatePlayerDetails(players: CampaignImportPlayerModel) {

    const request = campaignImportRequest(players)
    setRequestImportPlayer(request);
    setTimeout(() => {
      const messagingHub = hubConnection.createHubConnenction()
      messagingHub.start().then(() => {
        if (messagingHub.state !== HubConnected) {
          return
        }
        validateImportPlayers(request).then((response) => {
          if (response.status !== successResponse) {
            return
          }
          messagingHub.on(request.queueId.toString(), (message) => {
            // CALLBACK API
            getvalidateImportPlayersResult(message.cacheId)
              .then((result) => {
                let resultData = Object.assign({}, result.data)
                valitdateImportPlayerResult(resultData);
              })
              .catch(() => {
                setLoading(false)
              })
            messagingHub.off(request.queueId.toString())
            messagingHub.stop()
          })
        })
      })
    })
  };
  const processImportSuccess= () => {
    setLoading(false)
    setDisableSubmit(false)
    successUpload();
    swal("Success", "Transaction successfully submitted", "success")
  }
  const onSubmit = () => {
    if (processImportPlayer == undefined) {
      return
    }
    setLoading(true)
    setDisableSubmit(true)
    setTimeout(() => {
      const messagingHub = hubConnection.createHubConnenction()
      messagingHub.start().then(() => {
        if (messagingHub.state !== HubConnected) {
          return
        }
        processImportPlayer(requestImportPlayer).then((response: any) => {
          if (response.status === successResponse) {
            messagingHub.on(requestImportPlayer.queueId.toString(), (message) => {
              // CALLBACK API
              processImportPlayerResult(message.cacheId)
                .then((result) => {
                  if (result.data.status === successResponse) {
                    processImportSuccess();
                  }
                })
                .catch(() => {
                  setLoading(false)
                  setDisableSubmit(false)
                })
              messagingHub.off(requestImportPlayer.queueId.toString())
              messagingHub.stop()
            })
          }
        })
      })
    })
  }
  const closeModalForm = () => {
    resetCount()
    setLoading(false)
    alertLabel = { hasAlert: false, message: '' , status: 'warning'}
    setAlertMessage(alertLabel);
    props.closeModal()
  }
  const successUpload = () => {
    closeModalForm();
    props.successUpload();
  }
  return (
    <FormModal headerTitle={'Add Players'} haveFooter={false} show={props.showForm}  onHide ={closeModalForm}>
      <FormContainer onSubmit={formik.handleSubmit}>
        <MainContainer>
          <ContentContainer>
            <FieldContainer>
            <AlertLabel alert={alertMessage} />
              <DefaultFileInput
                accept={fileType}
                onChange={onChangeSelectedFile}
                disabled={loading}
              />
            </FieldContainer>
            {showResults ? (
              <>
                <FieldContainer>
                  <div className='col-sm-12'>
                    <label className='form-label-sm'>File name:&nbsp;</label>
                    <b>{fileName}</b>
                  </div>
                </FieldContainer>
                <FieldContainer>
                  <div className='col-sm-12'>
                    <label className='form-label-sm '>Valid Player count:&nbsp;</label>
                    <span className="text-success label label-lg label-light-success label-inline"><b>{validPlayers}</b></span>
                  </div>
                </FieldContainer>
                <FieldContainer>
                  <div className='col-sm-12'>
                    <label className='form-label-sm'>Invalid Player count:&nbsp;</label>
                    {invalidPlayers > 0 ? (
                      <>
                        <b>
                          <CSVLink filename='Invalid_Players.csv' data={csvData} headers={csvHeader}>
                            {invalidPlayers}
                          </CSVLink>
                        </b>
                      </>
                    ) : (
                      <>
                        <b>{invalidPlayers}</b>
                      </>
                    )}
                  </div>
                </FieldContainer>
                <FieldContainer>
                  <div className='col-sm-12'>
                    <label className='form-label-sm'>Duplicate records to current list:&nbsp;</label>
                    <b>{duplicatePlayers}</b>
                  </div>
                </FieldContainer>
              </>
            ) : (
              ''
            )}
          </ContentContainer>
        </MainContainer>
        <FieldContainer>
          <div className="col-sm-8" style={{paddingLeft: 3 + 'rem', fontWeight: 'bold'}}>
            <p style={{float: left}}> Input file must be a CSV file format with the following <br/> columns in sequence (Player ID, Username, Brand). <br/> Click this to download sample file for fill-out </p>
            <span style={{position: 'absolute', float: right, paddingLeft: 15}}> 
              <CSVLink filename='Import_Reference.csv' data={csvData} headers={csvHeader}>
                <FontAwesomeIcon icon={faFileCsv} size='4x' color='green'/>
              </CSVLink>
            </span>
             
          </div>
        </FieldContainer>
        <ModalFooter style={{border: 0}}>
         <>
         {invalidPlayers >  0 && validPlayers !== 0
          ? 
          <CSVLink filename='Invalid_Players.csv' data={csvData} headers={csvHeader}>
            <MlabButton
                    label={'Submit'}
                    loading={loading}
                    disabled={disableSubmit}
                    loadingTitle={'Please wait ...'}
                    onClick= {onSubmit}       
                    style={ElementStyle.primary}
                    type={'button'}
                    weight={'solid'}
                    size={'sm'}
                    access={true}
                  />
          </CSVLink> :
                <MlabButton
                label={'Submit'}
                loading={loading}
                disabled={disableSubmit}
                loadingTitle={'Please wait ...'}
                onClick= {onSubmit}       
                style={ElementStyle.primary}
                type={'button'}
                weight={'solid'}
                size={'sm'}
                access={true}
              />
         }
         </>
          <button type='button' className='btn btn-secondary btn-sm me-2' onClick={closeModalForm}>
            Close
          </button>
        </ModalFooter>
      </FormContainer>
    </FormModal>
  )
}
