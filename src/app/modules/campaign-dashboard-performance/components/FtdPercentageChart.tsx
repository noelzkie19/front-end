import ApexCharts, {ApexOptions} from 'apexcharts'
import React, {useEffect, useRef} from 'react'
import {FtdPercentageResponseModel} from '../models/response/FtdPercentageResponseModel'


function getChartOptions(data: ChartDataProps): ApexOptions {
    return {
        series: [{
            name: 'FTD Percentage',
            data: data.data.map(i => Number(i.ftdPercentage))
        }],
        labels: data.data.map(i => i.currency),
        chart: {
            type: 'bar',
            height: 350,
            stacked: false,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: true
            }
        },
        responsive: [{
            breakpoint: 480,
            options: {
                legend: {
                    position: 'bottom',
                    offsetX: -10,
                    offsetY: 0
                }
            }
        }],
        plotOptions: {
            bar: {
                horizontal: false,
                borderRadius: 10
            },
        },
        legend: {
            position: 'bottom',
            offsetY: 40
        },
        fill: {
            opacity: 1
        }

    }
}



type ChartDataProps = {
    data: Array<FtdPercentageResponseModel>,
    title: string
}

const SurveyAndFeedbackChart: React.FC<ChartDataProps> = (props: ChartDataProps) => {
    const chartRefFtd = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!chartRefFtd.current) {
            return
        }

        const chart = new ApexCharts(chartRefFtd.current, getChartOptions(props))
        if (chart) {
            chart.render()
        }

        return () => {
            if (chart) {
                chart.destroy()
            }
        }
    }, [props.data])


    return (
        <div className={`card card-custom ftd-percent`}>
            {/* begin::Header */}
            <div className='card-header border-0 pt-5'>
                {/* begin::Title */}
                <h3 className='card-title align-items-start flex-column'>
                    <span className='card-label fw-bolder fs-3 mb-1'>{props.title}</span>
                    <span className='fs-6 mb-1 fw-light mt-0'>FTD(Yes)  / Call List By Currency</span>
                </h3>

                {/* end::Title */}
            </div>
            {/* end::Header */}

            {/* begin::Body */}
            <div className='card-body'>
                {/* begin::Chart */}
                <div ref={chartRefFtd} id='kt_charts_widget_1_chart' style={{ height: '350px' }} />
                {/* end::Chart */}
            </div>
            {/* end::Body */}
        </div>
    )
}

export default SurveyAndFeedbackChart

