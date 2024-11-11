import ApexCharts, {ApexOptions} from 'apexcharts'
import React, {useEffect, useRef} from 'react'
import {PeConversionDetailResponseModel} from '../models/response/PeConversionDetailResponseModel'


function getChartOptions(data: ChartDataProps): ApexOptions {
    return {
        series: [{
            name: 'Goal Reached',
            type: 'column',
            data: data.data.map(i => Number(i.goalReachedPerCurrency))
        }, {
            name: 'Call List',
            type: 'line',
            data: data.data.map(i => Number(i.totalCallListCount))
        }],
        chart: {
            height: 350,
            type: 'line',
            toolbar: {
                show: false
            }
        },
        stroke: {
            width: [0, 4]
        },
        dataLabels: {
            enabled: true,
            enabledOnSeries: [1]
        },
        labels: data.data.map(i => i.currency),
        legend: {
            position: 'bottom'
        }


    }
}



type ChartDataProps = {
    data: Array<PeConversionDetailResponseModel>,
    title: string
    titleDesc: string | undefined
}

const PeConversionGoalChart: React.FC<ChartDataProps> = (props: ChartDataProps) => {
    const chartRefPe = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!chartRefPe.current) {
            return
        }

        const chart = new ApexCharts(chartRefPe.current, getChartOptions(props))
        if (chart) {
            chart.render()
        }

        return () => {
            if (chart) {
                chart.destroy()
            }
        }
    },[props.data])


    return (
        <div className={`card card-custom pe-conversion`}>
            {/* begin::Header */}
            <div className='card-header border-0 pt-5'>
                {/* begin::Title */}
                <h3 className='card-title align-items-start flex-column'>
                    <span className='card-label fw-bolder fs-3 mb-1'>{props.title}</span>
                    <span className='fs-6 mb-1 fw-light mt-0'>{props.titleDesc}</span>
                </h3>

                {/* end::Title */}
            </div>
            {/* end::Header */}

            {/* begin::Body */}
            <div className='card-body'>
                {/* begin::Chart */}
                <div ref={chartRefPe} id='kt_charts_widget_1_chart' style={{ height: '350px' }} />
                {/* end::Chart */}
            </div>
            {/* end::Body */}
        </div>
    )
}

export default PeConversionGoalChart

