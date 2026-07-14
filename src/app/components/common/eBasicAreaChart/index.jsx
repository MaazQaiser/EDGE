import ReactECharts from 'echarts-for-react';
import PropTypes from 'prop-types';
const BasicAreaChart = ({
  style,
  series,
  xAxisData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
}) => {
  const options = {
    grid: {
      left: '32px',
      top: '10px',
    },
    tooltip: {
      backgroundColor: '#000',
      borderRadius: 8,
      borderColor: '#000',
      textStyle: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 500,
      },
      trigger: 'axis',
      function(name) {
        if (!!legedFormatter) {
          return `${name}`;
        }
      },
    },

    legend: {
      show: false,
      top: 'bottom',
      left: 'left',
      textStyle: {
        color: '#86868B',
        fontStyle: 'normal',
        fontWeight: '400',
        fontFamily: 'Arial, sans-serif',
        fontSize: 12,
      },
      icon: 'rect',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 32,
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisPointer: {
        type: 'none',
      },
      axisLabel: {
        interval: 0,
        margin: 10,
        fontSize: 10,
        fontWeight: 500,
        // formatter: (value, index) => displayDataLabels[index],
      },
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
    yAxis: [
      {
        type: 'value',
        splitLine: {
          show: true,
        },
      },
    ],

    series: series,
  };

  return <ReactECharts opts={{ renderer: 'svg' }} option={options} style={style} />;
};

BasicAreaChart.defaultProps = {
  style: { height: '100%', width: '100%' },
};

BasicAreaChart.propTypes = {
  // heading: PropTypes.string.isRequired,
  // salesClass: PropTypes.string,
  // formatterSymbol: PropTypes.string,
  // colors: PropTypes.array.isRequired,
  className: PropTypes.string,
  series: PropTypes.array,
  style: PropTypes.object.isRequired,
  xAxisData: PropTypes.array,
  // data: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  // stats: PropTypes.object.isRequired,
};

export default BasicAreaChart;
