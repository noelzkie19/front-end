import moment from "moment"

export function formatDate(date: any) {

    let formattedDate = date == undefined ? '' :  moment(date).format('DD/MM/YYYY HH:mm:ss').toString()
    return formattedDate
  } 