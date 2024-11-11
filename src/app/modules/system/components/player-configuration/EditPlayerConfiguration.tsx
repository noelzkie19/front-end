import 'datatables.net'
import 'datatables.net-dt'
import {Guid} from 'guid-typescript'
import $ from 'jquery'
import {useEffect, useState} from 'react'
import {Button} from 'react-bootstrap-v5'
import ReactDOM from 'react-dom'
import {shallowEqual, useSelector} from 'react-redux'
import swal from 'sweetalert'
import {RootState} from '../../../../../setup'
import * as hubConnection from '../../../../../setup/hub/MessagingHub'
import '../../../../../_metronic/assets/css/datatables.min.css'
import {
  ButtonsContainer,
  ContentContainer,
  DefaultSecondaryButton,
  FooterContainer,
  FormGroupContainer,
  FormHeader,
  MainContainer,
  PaddedContainer,
} from '../../../../custom-components'
import {disableSplashScreen} from '../../../../utils/helper'
import {ConfigurationBaseModel} from '../../models/ConfigurationBaseModel'
import {PlayerConfigMapping} from '../../models/PlayerConfigMapping'
import {PlayerConfigurationModel} from '../../models/PlayerConfigurationModel'
import {GetPlayerConfigurationByIdRequestModel} from '../../models/requests/GetPlayerConfigurationByIdRequestModel'
import {getPlayerConfigurationById, getPlayerConfigurationByIdResult} from '../../redux/SystemService'
import {PlayerConfigurationMock} from '../../_mocks_/PlayerConfigurationMock'
import {StatusCode} from '../constants/PlayerConfigEnums'
import AddEditPlayerConfigModal from './modals/AddEditPlayerConfigModal'

const EditPlayerConfiguration: React.FC = () => {
  //  States
  const [pageId, setPageId] = useState(0)
  const [configActions, setConfigActions] = useState<PlayerConfigMapping<any>>()
  const messagingHub = hubConnection.createHubConnenction()
  const userAccessId = useSelector<RootState>(({auth}) => auth.userId, shallowEqual) as number
  const [showModal, setShowModal] = useState<boolean>(false)
  const [isEditFlag, setIsEditFlag] = useState<boolean>(false)
  const [typeFlag, setTypeFlag] = useState(1) // Type 1 for Configs without code field, Type 2 for Configs with code field
  const [idFilter, setIdFilter] = useState()
  const [nameFilter, setNameFilter] = useState('')
  const [codeFilter, setCodeFilter] = useState('')
  const [columns, setColumns] = useState(columnsType1)
  const [rowData, setRowData] = useState<Array<any>>([])
  const [loading, setLoading] = useState(false)
  const [playerConfiguration, setPlayerConfiguration] = useState<PlayerConfigurationModel>(
    PlayerConfigurationMock.table[0]
  )
  const [configData, setConfigData] = useState<ConfigurationBaseModel>({
    id: 0,
    name: '',
    code: '',
    brand: [],
  })

  const playerConfigListState = useSelector<RootState>(
    ({system}) => system.playerConfigurationList,
    shallowEqual
  ) as any

  const actionColumnIndex = 3;
  let cols = columnsType1
  let colDef: any = {
    targets: [actionColumnIndex],
    createdCell: function (td: any, _cellData: any, rowData: any) {
      return ReactDOM.render(
        <div id={'config-column-' + rowData.id}>
          <a
            onClick={() => {
              handleEditRow(rowData)
            }}
            className='btn btn-outline-dark btn-sm px-4'
          >
            Edit
          </a>
        </div>,
        td
      )
    },
  }

  //  Effects
  useEffect(() => {
    const pathArray = window.location.pathname.split('/')
    let pageId: string = ''

    if (pathArray.length >= 4) {
      pageId = pathArray[3]
      setPageId(+pageId)
      getPlayerConfigInfo(+pageId)
    }
    initializeTable()
  }, [])

  useEffect(() => {
    const table = $('.table-player-config').find('table').DataTable()
    table.clear()
    table.rows.add(rowData)
    table
      .on('order.dt search.dt', function () {
        table
          .column(0, {search: 'applied', order: 'applied'})
          .nodes()
          .each(function (cell, i) {
            cell.innerHTML = i + 1
          })
      })
      .draw()
  }, [rowData])

  //  Methods
  const getPlayerConfigInfo = (id: number) => {
    const request: GetPlayerConfigurationByIdRequestModel = {
      id: id,
      userId: userAccessId.toString(),
      queueId: Guid.create().toString(),
    }

    messagingHub.start().then(() => {
      getPlayerConfigurationById(request).then((response) => {
        if (response.status === StatusCode.OK) {
          messagingHub.on(request.queueId.toString(), (message) => {
            getPlayerConfigurationByIdResult(message.cacheId)
              .then((returnData) => {
                const item = Object.assign(returnData.data)
                setPlayerConfiguration(item)

                if (item !== undefined) {
                  if (
                    item.playerConfigurationName === 'Currency' ||
                    item.playerConfigurationName === 'Country' ||
                    item.playerConfigurationName === 'Language'
                  ) {
                    setTypeFlag(2)
                    colDef.targets = [4]
                    cols = columnsType2
                    setColumns(columnsType2)
                  }
                }
                disableSplashScreen()
                messagingHub.off(request.queueId.toString())
                messagingHub.stop()
              })
              .catch(() => {
                swal('Failed', 'getPlayerConfigurationById', 'error')
                disableSplashScreen()
              })
            setLoading(false)
          })
        } else {
          swal('Failed', response.data.message, 'error')
        }
      })
    })
  }

  const initializeTable = () => {
    $('#table-player-config').DataTable({
      retrieve: true,
      dom: '<"table-player-config"tlp>',
      columns: cols,
      data: rowData,
      ordering: true,
      paging: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      order: [[1, 'asc']],
      columnDefs: [colDef],
      language: {
        emptyTable: 'No Rows To Show',
      },
    })
  }

  const handleIdFilterOnChange = (event: any) => {
    setIdFilter(event.target.value)
  }

  const handleNameFilterOnChange = (event: any) => {
    setNameFilter(event.target.value)
  }

  const handleCodeFilterOnChange = (event: any) => {
    setCodeFilter(event.target.value)
  }

  const handleShowModal = () => {
    setShowModal(!showModal)
  }

  const handleEditRow = (item: any) => {
    setIsEditFlag(true)
    setConfigData(item)
    handleShowModal()
  }

  const handleAddNew = () => {
    setIsEditFlag(false)
    setConfigData({
      id: 0,
      name: '',
      code: '',
      brand: [],
    })
    handleShowModal()
  }

  const saveNewConfiguration = () => {}

  return (
    <>
      <MainContainer>
        <FormHeader headerLabel={'Edit Player Configuration'} />
        <ContentContainer>
          <FormGroupContainer>
            <div className='col-lg-3'>
              <label>Player Configuration Name</label>
              <p className='form-control-plaintext fw-bolder'>{playerConfiguration.playerConfigurationName}</p>
            </div>
          </FormGroupContainer>
          <FormGroupContainer>
            <div className='col-lg-3'>
              <label>Created Date</label>
              <p className='form-control-plaintext fw-bolder'>{playerConfiguration.createdDate}</p>
            </div>
            <div className='col-lg-3'>
              <label>Created By</label>
              <p className='form-control-plaintext fw-bolder'>{playerConfiguration.createdByName}</p>
            </div>
            <div className='col-lg-3'>
              <label>Last Modified Date</label>
              <p className='form-control-plaintext fw-bolder'>{playerConfiguration.updatedDate}</p>
            </div>
            <div className='col-lg-3'>
              <label>Modified By</label>
              <p className='form-control-plaintext fw-bolder'>{playerConfiguration.updatedByName}</p>
            </div>
          </FormGroupContainer>
          <hr className='my-3' />
          <FormGroupContainer>
            <label className='col-lg-2 col-form-label text-lg-right'>
              {playerConfiguration.playerConfigurationName} Id
            </label>
            <div className='col-lg-2'>
              <input
                type='text'
                className='form-control form-control-sm'
                placeholder='Answer Name'
                value={idFilter}
                onChange={handleIdFilterOnChange}
              />
            </div>
            <label className='col-lg-2 col-form-label text-lg-right'>
              {playerConfiguration.playerConfigurationName} Name
            </label>
            <div className='col-lg-2'>
              <input
                type='text'
                className='form-control form-control-sm'
                placeholder='Answer Name'
                value={nameFilter}
                onChange={handleNameFilterOnChange}
              />
            </div>
            {typeFlag === 2 && (
              <>
                <label className='col-lg-2 col-form-label text-lg-right'>
                  {playerConfiguration.playerConfigurationName} Code
                </label>
                <div className='col-lg-2'>
                  <input
                    type='text'
                    className='form-control form-control-sm'
                    placeholder='Code Name'
                    value={codeFilter}
                    onChange={handleCodeFilterOnChange}
                  />
                </div>
              </>
            )}
          </FormGroupContainer>
          <FormGroupContainer>
            <ButtonsContainer>
              <Button title={'Search'} />
              <DefaultSecondaryButton access={true} title={'Add New'} onClick={handleAddNew} />
            </ButtonsContainer>
          </FormGroupContainer>
          <FormGroupContainer>
            <table
              id='table-player-config'
              className='table table-hover table-rounded table-striped border gy-3 gs-3'
            />
          </FormGroupContainer>
        </ContentContainer>
        <FooterContainer>
          <PaddedContainer>
            <button type='button' className='btn btn-primary font-weight-bold me-2'>
              Submit
            </button>
            <button type='button' className='btn btn-secondary font-weight-bold me-0'>
              Back
            </button>
          </PaddedContainer>
        </FooterContainer>
      </MainContainer>
      <AddEditPlayerConfigModal
        title={playerConfiguration.playerConfigurationName}
        configInfo={configData}
        isEditMode={isEditFlag}
        modal={showModal}
        type={typeFlag}
        toggle={handleShowModal}
        saveConfiguration={saveNewConfiguration}
      />
    </>
  )
}

export default EditPlayerConfiguration

const columnsType1 = [
  {
    title: 'ID',
    data: 'id',
    className: 'align-middle',
  },
  {
    title: 'Name',
    data: 'name',
    className: 'align-middle',
  },
  {
    title: 'Brand',
    data: 'brand',
    className: 'align-middle',
    render: function (data: any, _row: any) {
      return data.map((i: any) => i.name).join(',')
    },
  },
  {
    title: 'Action',
    data: null,
  },
]

const columnsType2 = [
  {
    title: 'ID',
    data: 'id',
    className: 'align-middle',
  },
  {
    title: 'Name',
    data: 'name',
    className: 'align-middle',
  },
  {
    title: 'Code',
    data: 'code',
    className: 'align-middle',
  },
  {
    title: 'Brand',
    data: 'brand',
    className: 'align-middle',
    render: function (data: any, _row: any) {
      return data.map((i: any) => i.name).join(',')
    },
  },
  {
    title: 'Action',
    data: null,
  },
]
