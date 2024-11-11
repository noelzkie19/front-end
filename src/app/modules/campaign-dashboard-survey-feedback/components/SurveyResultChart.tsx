/* eslint-disable jsx-a11y/anchor-is-valid */
import ApexCharts, {ApexOptions} from 'apexcharts'
import React, {useEffect, useRef} from 'react'
import {getCSSVariableValue} from '../../../../_metronic/assets/ts/_utils'
import {SurveyResultChartModel} from '../models'



type SurveyResultChartProps = {
    data: SurveyResultChartModel
}

const SurveyResultChart: React.FC<SurveyResultChartProps> = (props: SurveyResultChartProps) => {
  const chartRef = useRef<HTMLDivElement | null>(null)


  useEffect(() => {
    if (!chartRef.current) {
        return
      }
  
      const chart = new ApexCharts(chartRef.current, getChartOptions(props.data))
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
    <div className={`card card-custom`}>
      {/* begin::Header */}
      <div className='card-header border-0 pt-5'>
        {/* begin::Title */}
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bolder fs-3 mb-1'>Survey Answer</span>

        </h3>
        {/* end::Title */}
      </div>
      {/* end::Header */}

      {/* begin::Body */}
      <div className='card-body'>
        {/* begin::Chart */}
        <div ref={chartRef} id='kt_charts_widget_1_chart' style={{height: '350px'}} />
        {/* end::Chart */}
      </div>
      {/* end::Body */}
    </div>
  )
}

export default SurveyResultChart

function getChartOptions(data: SurveyResultChartModel): ApexOptions {
  const labelColorDisplay = getCSSVariableValue('--bs-gray-500')
  const borderColor = getCSSVariableValue('--bs-gray-200')
  const primaryColor = getCSSVariableValue('--bs-primary')
  const warningColor = getCSSVariableValue('--bs-warning')

  return {
    series: [
      {
        name: 'Deposited',
        data: data.data1,
      },
      {
        name: 'Count',
        data: data.data2,
      },
    ],
    chart: {
      fontFamily: 'inherit',
      type: 'bar',
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: '30%',
        borderRadius: 5,
      },
    },
    legend: {
      show: true,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: data.category,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: labelColorDisplay,
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: labelColorDisplay,
          fontSize: '12px',
        },
      },
    },
    fill: {
      opacity: 1,
    },
    states: {
      normal: {
        filter: {
          type: 'none',
          value: 0,
        },
      },
      hover: {
        filter: {
          type: 'none',
          value: 0,
        },
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: 'none',
          value: 0,
        },
      },
    },
    tooltip: {
      style: {
        fontSize: '12px',
      }
    },
    colors: [warningColor, primaryColor],
    grid: {
      borderColor: borderColor,
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
  }
}
