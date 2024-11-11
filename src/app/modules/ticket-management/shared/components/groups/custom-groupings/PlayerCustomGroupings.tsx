import { useState, useEffect, useContext } from 'react'
import { Col } from 'react-bootstrap-v5'
import TicketManagementContainer from '../../TicketManagementContainer'
import { useSelector, shallowEqual } from 'react-redux';
import { RootState } from '../../../../../../../setup';
import { useSystemOptionHooks } from '../../../../../system/shared';
import { SelectFilter } from '../../../../../relationship-management/shared/components';
import { LookupModel } from '../../../../../../shared-models/LookupModel';
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { TicketContext } from '../../../../context/TicketContext';
import { TicketPlayerRequestModel } from '../../../../models/request/TicketPlayerRequestModel';
import { BRAND_PLATFORM } from '../../../../../system/components/constants/Brand';

interface SectionProps {
  isColored?: string
  verifiedPlayerId?: any
  viewOnly?: boolean
}

const PlayerCustomGroupings = ({ isColored = "transparent", verifiedPlayerId, viewOnly = false }: SectionProps) => {
  const { selectedPlayer, getPlayerInfoByFilterAsync , isFetchedPlayer , selectedTicketInformation , ticketInformation } = useContext(TicketContext);
  const { getBrandOptions, brandOptionList } = useSystemOptionHooks();
  const userAccessId = useSelector<RootState>(({ auth }) => auth.userId, shallowEqual) as number;

  const [selectedBrand, setSelectedBrand] = useState<LookupModel>({ value: "", label: "" });
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const onPlayerSearch = (id: string, username: string) => {
    if (isDisabled) return    
    setIsSearching(true)
    getPlayer(selectedBrand.value, id, username)
  }

  const onChangePlayer = (currValue: any) => {
    selectedPlayer.playerId = currValue;
  }
  const onChangeUsername = (currValue: any) => {
    selectedPlayer.username = currValue;
  }


  useEffect(() => {
    getBrandOptions(userAccessId, BRAND_PLATFORM.Icore)
    return () => { }
  }, [])

  useEffect(() => {
    setIsDisabled(viewOnly)
    return () => { }
  }, [viewOnly])

  useEffect(()=>{
    if(selectedTicketInformation && selectedTicketInformation.ticketId > 0){
      setIsDisabled(true)
    }

  },[selectedTicketInformation])


  useEffect(() => {
    if(isFetchedPlayer) {
      setIsSearching(false)
      if (selectedTicketInformation.ticketId !== 0) { // must not disable on add ticket form
        setIsDisabled(true)
      }
      if (!viewOnly) { // No need to verify player on view page
        verifiedPlayerId(selectedPlayer.playerId, selectedPlayer.mlabPlayerId)
      }
    }
   
    return () => { }
  }, [isFetchedPlayer])


  useEffect(() => {
    if (ticketInformation.ticketPlayerIds.length === 0) return
    if(brandOptionList.length > 0 && ticketInformation.ticketId > 0) {
      const getBrandofPlayer = brandOptionList.find((brand: any) => brand.value === ticketInformation.ticketPlayerIds[0].brandID.toString())
      setSelectedBrand({ value: (getBrandofPlayer?.value ?? '0').toString(), label: (getBrandofPlayer?.label ?? '')?.toString() })
    }
    
  }, [brandOptionList , ticketInformation])

  const getPlayer =(brand: any, playerId: any, username: any) => {
    const request: TicketPlayerRequestModel = {
      BrandId: brand !== "" ? brand : 0,
      PlayerId: playerId,
      PlayerUsername: username
    }
    getPlayerInfoByFilterAsync(request)
  }


  return (
    <TicketManagementContainer color={isColored}>
      <div className='p-4'>
        <Col sm={12}>
          <p className='fw-bolder'>Player</p>
        </Col>
        <div className='d-flex'>
          <div className='col-lg-12' style={{ paddingRight: '1rem' }}>
            <div className={`col-form-label col-sm required`}>Brand</div>
            <SelectFilter
              isMulti={false}
              options={brandOptionList}
              isRequired={true}
              label=''
              onChange={(selected: LookupModel) => { setSelectedBrand(selected) }}
              value={selectedBrand}
              isDisabled={isDisabled}
            />
          </div>
        </div>
        <div className='d-flex align-items-center'>
          <div className=' col-form-label col-sm required ' >Player ID</div>
          {isSearching && <div style={{ fontStyle: 'italic' }}>Searching for Player</div>}
        </div>
        <div className='' style={{ position: 'relative' }}>
          <input
            type='text'
            className='form-control form-control-sm w-100'
            style={{
              paddingTop: '0'
            }}
            onChange={(e: any) => { onChangePlayer(e.currentTarget.value); verifiedPlayerId('', 0) }}
            value={selectedPlayer.playerId}
            disabled={isDisabled}
          />
          {isSearching ?
            <div
              style={{
                position: 'absolute',
                right: '10px',
                bottom: '10px'
              }}
              className='spinner-border spinner-border-sm align-middle ms-2'></div> :
            <button onClick={() => { if (selectedPlayer.playerId) return onPlayerSearch(selectedPlayer.playerId, "") }}>
              <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', top: '10', right: '10', padding: 0 }} size="lg" />
            </button>
          }
        </div>
        <div className='d-flex align-items-center'>
          <div className=' col-form-label col-sm required ' style={{ paddingTop: 0 }}>Player Username</div>
          {isSearching && <div style={{ fontStyle: 'italic' }}>Searching for Player</div>}
        </div>
        <div className='' style={{ position: 'relative' }}>
          <input
            type='text'
            className='form-control form-control-sm w-100'
            style={{
              paddingTop: '0'
            }}
            onChange={(e: any) => { onChangeUsername(e.currentTarget.value); verifiedPlayerId(0) }}
            value={selectedPlayer.username}
            disabled={isDisabled}
          />
          {isSearching ?
            <div
              style={{
                position: 'absolute',
                right: '10px',
                bottom: '10px'
              }}
              className='spinner-border spinner-border-sm align-middle ms-2'></div> :
            <button onClick={() => { if (selectedPlayer.username) return onPlayerSearch('', selectedPlayer.username) }}>
              <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', top: '10', right: '10', padding: 0 }} size="lg" />
            </button>
          }
        </div>
        <div className='d-flex m-2'>
          <div>Currency : </div>
          <div style={{ paddingLeft: '0.5rem' }}>{selectedPlayer.currencyCode}</div>
        </div>
        <div className='d-flex m-2'>
          <div>Country : </div>
          <div style={{ paddingLeft: '0.5rem' }}>{selectedPlayer.countryName}</div>
        </div>
        <div className='d-flex m-2'>
          <div>VIP Level : </div>
          <div style={{ paddingLeft: '0.5rem' }}>{selectedPlayer.vipLevel}</div>
        </div>
      </div>
    </TicketManagementContainer>
  )
}

export default PlayerCustomGroupings