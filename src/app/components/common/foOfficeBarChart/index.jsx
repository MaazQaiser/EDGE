import ReactECharts from 'echarts-for-react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { useTenantLabel } from '../../../../helper/utilityHooks';

const LineBarChart = ({ style, data }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const options = {
    grid: {
      top: '32px',
      height: '63%',
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#000',
      borderRadius: 8,
      borderColor: '#000',
      textStyle: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 500,
      },
    },
    legend: {
      show: true,
      data: [
        `Completed ${getLabel('terms', 'dedicated', t)}`,
        `Completed ${getLabel('terms', 'patrol', t)}`,
      ],
      itemStyle: {
        borderRadius: 15,
        padding: 5,
      },
      textStyle: {
        padding: [2, 10],
      },
      icon: 'roundRect',
    },
    xAxis: [
      {
        type: 'category',
        data: [`${getLabel('terms', 'extra', t)} Job`, getLabel('terms', 'dispatch', t)],
        axisTick: {
          alignWithLabel: false,
          show: false,
        },
        axisLine: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
    ],

    yAxis: [
      {
        type: 'value',
        axisTick: {
          alignWithLabel: false,
          show: false,
        },
        axisLine: {
          show: false,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#E6E6E7',
          },
        },
        min: 0,
        max: 50,
        interval: 25,
        axisLabel: {
          formatter: '{value}',
        },
      },
    ],

    series: [
      {
        name: 'Completed',
        type: 'bar',
        barWidth: '24px',
        itemStyle: {
          normal: {
            barBorderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            barBorderRadius: [4, 4, 0, 0],
          },
        },
        tooltip: {
          valueFormatter: function (value) {
            return value;
          },
        },
        data: data,
      },
    ],
  };

  return <ReactECharts opts={{ renderer: 'svg' }} option={options} style={style} />;
};

LineBarChart.defaultProps = {
  style: { height: '100%', width: '100%' },
};

LineBarChart.propTypes = {
  className: PropTypes.string,
  data: PropTypes.array,
  style: PropTypes.object.isRequired,
};

export default LineBarChart;
