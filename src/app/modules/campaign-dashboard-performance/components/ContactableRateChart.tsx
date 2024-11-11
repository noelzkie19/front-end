import ApexCharts, {ApexOptions} from 'apexcharts'
import React, {useEffect, useRef} from 'react'
import {ContactableRateResponseModel} from '../models/response/ContactableRateResponseModel'


function getChartOptions(data: ChartDataProps): ApexOptions {
    return {
        series: [{
            name: 'Contactable Percentage',
            data: data.data.map(i => Number(i.contactablePercentage))
        }],
        labels: data.data.map(i => i.currency),
        chart: {
            type: 'bar',
            height: 350,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: true
            },
            stacked: false,
        },
        responsive: [{
            breakpoint: 480,
            options: {
                legend: {
                    position: 'bottom',
                    offsetY: 0,
                    offsetX: -10
                }
            }
        }],
        plotOptions: {
            bar: {
                borderRadius: 10,
                horizontal: false
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
    data: Array<ContactableRateResponseModel>,
    title: string
}

const ContactableRateChart: React.FC<ChartDataProps> = (props: ChartDataProps) => {
    const chartRefContactable = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!chartRefContactable.current) {
            return
        }

        const chart = new ApexCharts(chartRefContactable.current, getChartOptions(props))
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
        <div className={`card card-custom`}>
            {/* begin::Header */}
            <div className='card-header border-0 pt-5'>
                {/* begin::Title */}
                <h3 className='card-title align-items-start flex-column'>
                    <span className='card-label fw-bolder fs-3 mb-1'>{props.title}</span>
                    <span className='fs-6 mb-1 fw-light mt-0'>Rate of player who got at least one contactable case / call list by currency</span>
                </h3>

                {/* end::Title */}
            </div>
            {/* end::Header */}

            {/* begin::Body */}
            <div className='card-body'>
                {/* begin::Chart */}
                <div ref={chartRefContactable} id='kt_charts_widget_1_chart' style={{ height: '350px' }} />
                {/* end::Chart */}
            </div>
            {/* end::Body */}
        </div>
    )
}

export default ContactableRateChart

