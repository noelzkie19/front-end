import React from 'react'
import {Chart} from 'react-google-charts'
import {LookupModel} from '../../../shared-models/LookupModel'

type FeedbackResultChartProps = {
  title: string
  reportData: Array<LookupModel>
}

const FeedbackResultChart: React.FC<FeedbackResultChartProps> = ({
  title,
  reportData,
}: FeedbackResultChartProps) => {
  const data = [['Label', 'Value'], ...reportData.map((i) => [i.label + ' - ' + i.value, i.value])]

  const options = {
    legend: {
      position: 'right',
      alignment: 'top',
    },
    colors: [
      '#009ef6',
      '#6610f2',
      '#6f42c1',
      '#d63384',
      '#fd7e14',
      '#ffc107',
      '#198754',
      '#20c997',
      '#0dcaf0',
    ],
  }

  return (
    <div className={`card card-custom`}>
      <div className='card-header border-0 pt-5'>
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bolder fs-3 mb-1'>{title}</span>
        </h3>
      </div>
      <div className={'card-body p-0'} style={{position: 'relative'}}>
        {reportData && reportData.length > 0 && (
          <p
            id='feedback-chart-legend-header'
            style={{
              position: 'absolute',
              zIndex: 1,
              left: '285px',
              top: '40px',
              fontSize: '8pt',
              fontWeight: 'bold',
            }}
          >
            Feedback Response Count
          </p>
        )}
        <Chart
          chartType='PieChart'
          data={data}
          options={options}
          width={'500px'}
          height={'350px'}
        />
      </div>
    </div>
  )
}

export default FeedbackResultChart
