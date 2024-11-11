import { compressToBase64 } from "lz-string"
import { useEffect, useState } from "react"
import { getSystemLookups } from "../modules/system/redux/SystemService"

const refreshCommonLookUp = () => {

    let isSuccess = false
    //console.log('getSystemLookups')

    getSystemLookups()
      .then((response) => {
        if (response.status === 200) {
          let compressedSystemLookups = compressToBase64(JSON.stringify(response.data))
          localStorage.setItem('systemLookups', compressedSystemLookups)
          isSuccess = (true)
        }
      })
      .catch((ex) => {
        console.log('Error GetSystemLookups: ' + ex)
        isSuccess = (false)
      })
      return isSuccess;
}
export default refreshCommonLookUp;