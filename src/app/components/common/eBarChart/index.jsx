import ReactECharts from 'echarts-for-react';
import PropTypes from 'prop-types';

const BarChart = ({
  // heading,
  colors,
  // stats,
  data,
  style,
  formatterSymbol = '',
}) => {
  const { xAxis, series } = data;
  const options = {
    color: colors,
    textStyle: {
      color: '#86868B',
      fontSize: 10,
      fontWeight: 500,
      lineHeight: 14,
    },
    grid: {
      left: '10',
      right: '10',
      bottom: '20',
      top: '20',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xAxis,
      axisLabel: {
        margin: 10,
        fontSize: 10,
        color: '#86868B',
        fontWeight: 500,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'none',
      },
      formatter: function (params) {
        return params[0].name + `: ${formatterSymbol}` + params[0].value;
      },
      backgroundColor: '#000',
      borderRadius: 8,
      borderColor: '#000',
      textStyle: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 500,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10,
        color: '#86868B',
        fontWeight: 500,
        margin: 0,
        formatter: function (value) {
          return `${formatterSymbol}` + value;
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#F5F5F6',
        },
      },
    },
    series: [
      {
        type: 'bar',
        data: series,
        itemStyle: {
          borderRadius: 10,
        },
        showBackground: true,
        backgroundStyle: {
          borderRadius: 10,
          color: 'rgba(180, 180, 180, 0.2)',
        },

        barWidth: '30%',
        barCategoryGap: '50%',
        emphasis: {
          itemStyle: {
            color: 'rgba(20, 109, 255, 1)',
          },
        },
      },
    ],
  };

  return <ReactECharts opts={{ renderer: 'svg' }} option={options} style={style} />;
};

BarChart.defaultProps = {
  style: { height: '100%', width: '100%' },
};

BarChart.propTypes = {
  heading: PropTypes.string,
  salesClass: PropTypes.string,
  formatterSymbol: PropTypes.string,
  colors: PropTypes.array.isRequired,
  className: PropTypes.string,
  style: PropTypes.object.isRequired,
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  stats: PropTypes.object.isRequired,
};

export default BarChart;
