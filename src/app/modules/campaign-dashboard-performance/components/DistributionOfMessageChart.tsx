import ApexCharts, {ApexOptions} from 'apexcharts'
import React, {useEffect, useRef} from 'react'
import {DistributionOfMessagePerCurrencyResponseModel} from '../models/response/DistributionOfMessagePerCurrencyResponseModel'


function getChartOptions(data: ChartDataProps): ApexOptions {
    return {
        series: [{
            name: 'Contactable',
            data: data.data.map(i => Number(i.totalContactableCount))
        }, {
            name: 'Uncontactable',
            data: data.data.map(i => Number(i.totalUncontactableCount))
        }, {
            name: 'InvalidNumber',
            data: data.data.map(i => Number(i.totalInvalidNumberCount))
        }],
        labels: data.data.map(i => i.currency),
        chart: {
            type: 'bar',
            height: 350,
            stacked: true,
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
            position: 'right',
            offsetY: 40
        },
        fill: {
            opacity: 1
        }

    }
}



type ChartDataProps = {
    data: Array<DistributionOfMessagePerCurrencyResponseModel>,
    title: string
}

const DistributionOfMessageChart: React.FC<ChartDataProps> = (props: ChartDataProps) => {
    const chartRefDistribution = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!chartRefDistribution.current) {
            return
        }

        const chart = new ApexCharts(chartRefDistribution.current, getChartOptions(props))
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
        <div className={`card card-custom distri-chart`}>
            {/* begin::Header */}
            <div className='card-header border-0 pt-5'>
                {/* begin::Title */}
                <h3 className='card-title align-items-start flex-column'>
                    <span className='card-label fw-bolder fs-3 mb-1'>{props.title}</span>
                </h3>
                {/* end::Title */}
            </div>
            {/* end::Header */}

            {/* begin::Body */}
            <div className='card-body'>
                {/* begin::Chart */}
                <div ref={chartRefDistribution} id='kt_charts_widget_1_chart' style={{ height: '350px' }} />
                {/* end::Chart */}
            </div>
            {/* end::Body */}
        </div>
    )
}

export default DistributionOfMessageChart

