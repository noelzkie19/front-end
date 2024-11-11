import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import {ExportDataModel} from "../models/ExportDataModel";

const ExportData = (FilterData: any, Summary: any, Detail: any, _ShowLabel: boolean, format: string, reportTitle: string) => {
        if (format === 'csv') {
            JSONToCSVConvertor(FilterData, Summary, Detail, reportTitle, true)
        } else {
            JSONToExcelConvertor(JSON.stringify(FilterData), JSON.stringify(Summary), JSON.stringify(Detail), reportTitle, true)
        }
}

function appendDataToExcelExport(CSV: string, ShowLabel: boolean, data: any): string {

    const arrData = typeof data !== "object" ? JSON.parse(data) : data;

    //This condition will generate the Label/Header
    if (ShowLabel) {
        let row = "";
        for (let index in arrData[0]) {
            row += index[0].toUpperCase() + index.slice(1) + "|";
        }

        let newSlicedRow = row.slice(0, -1);
        CSV += newSlicedRow + "\r\n";
    }

    for (const rowData of arrData) {
        let row = "";
      
        // Extract each column and convert it to a string, comma-separated
        for (const value of Object.values(rowData)) {
          row += value + '|';
        }
      
        let slicedRow = row.slice(0, row.length - 1);
        CSV += slicedRow + "\r\n";
      }
      
    return CSV

}

const JSONToCSVConvertor = (FilterData: any, Summary: any, Detail: any, ReportTitle: string, _ShowLabel: boolean) => {
    let CSV = "";
    const fileType = "text/csv; charset=utf-18"
    const fileExtension = ".csv"

    const filterData = XLSX.utils.json_to_sheet(FilterData)
    CSV +=  XLSX.utils.sheet_to_csv(filterData) + "\r\n";

    const summaryData = XLSX.utils.json_to_sheet(Summary)
    CSV +=  XLSX.utils.sheet_to_csv(summaryData) + "\r\n";

    const detailData = XLSX.utils.json_to_sheet(Detail)
    CSV +=  XLSX.utils.sheet_to_csv(detailData)

    FileSaver.saveAs(new Blob(["\uFEFF"+CSV], { type: fileType }), ReportTitle + fileExtension);
}

const JSONToExcelConvertor = (FilterData: any, Summary: any, Detail: any, ReportTitle: string, ShowLabel: boolean) => {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object

    let CSV = "";
    console.log(FilterData)

    CSV = appendDataToExcelExport(CSV, ShowLabel, FilterData)
    CSV = appendDataToExcelExport(CSV, ShowLabel, Summary)
    CSV = appendDataToExcelExport(CSV, ShowLabel, Detail)

    if (CSV === "") {
        alert("Invalid data");
        return;
    }
    const arrayOfArrayCsv = CSV.split("\n").map((row: string) => {
        return row.split("|")
    });

    const fileType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const wsSummary = XLSX.utils.aoa_to_sheet(arrayOfArrayCsv);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSummary, "Data");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, ReportTitle + fileExtension);

}

export function  ExportExcelMultiSheet   (Detail: Array<ExportDataModel>, ReportTitle: string, ShowLabel: boolean)   {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object

    const wb = XLSX.utils.book_new();
    Detail.forEach((p : ExportDataModel) => {

        let CSV = "";
        if (p.detail != null){
            CSV = appendDataToExcelExport(CSV , ShowLabel, p.detail)
        }
        const arrayOfArrayCsv = CSV.split("\n").map((row: string) => {
            return row.split("|")
        });

        const wsSummary = XLSX.utils.aoa_to_sheet(arrayOfArrayCsv);

        XLSX.utils.book_append_sheet(wb, wsSummary, p.sheetName);

    });  

    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, ReportTitle + fileExtension);

};

export default ExportData
