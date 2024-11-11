import ApexCharts from 'apexcharts'
import React, {useEffect, useRef} from 'react'
import {LookupModel} from '../../../shared-models/LookupModel'

function getChartOptions(data: ChartDataProps): any {
    return {
        series: data.data.map(i => Number(i.value)),
        chart: {
            width: 450,
            type: 'pie',
        },
        labels: data.data.map(i => i.label),
        legend: {
            position: 'bottom',
            horizontalAlign: 'left',
            formatter: function(seriesName: any, opts: any) {
                return seriesName + " - " + opts.w.globals.series[opts.seriesIndex]
            },
        }
        
    }
}

type ChartDataProps = {
    data: Array<LookupModel>,
    title: string
}

const SurveyAndFeedbackChart: React.FC<ChartDataProps> = (props: ChartDataProps) => {
    const chartRefSurveyAndFeedback = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!chartRefSurveyAndFeedback.current) {
            return
        }

        const chart = new ApexCharts(chartRefSurveyAndFeedback.current, getChartOptions(props))
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
        <div className={`card card-custom survey-feedback-chart`}>
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
            <div ref={chartRefSurveyAndFeedback} id='kt_charts_widget_1_chart' style={{height: '450px'}} />
            {/* end::Chart */}
        </div>
        {/* end::Body */}
        </div>
    )
}

export default SurveyAndFeedbackChart

