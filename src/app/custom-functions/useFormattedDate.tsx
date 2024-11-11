export default function useFormattedDate (date: string) {
    if(date !== '') {
        const formattedDate = new Date(date)
        return formattedDate.getMonth()+1 + '/' + formattedDate.getDate() + '/' 
        + formattedDate.getFullYear() + ' ' + formattedDate.toLocaleTimeString()
    }
    return date
}