import ReactECharts from 'echarts-for-react';
import PropTypes from 'prop-types';
import { capitalizeFirstLetter } from 'src/utils/string/common';

const BarYChart = ({ colors, dataLabels, series, style }) => {
  const options = {
    legend: {
      bottom: '0',
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
      formatter: function (name) {
        // Capitalize the first letter of each lgened name and display value.
        return `${capitalizeFirstLetter(name)}`;
      },
    },
    color: colors,
    textStyle: {
      fontSize: 12,
      color: '#86868B',
      fontWeight: '800 !important',
      display: 'flex',
      gap: '16px',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'none',
      },
      // Formatter function to customize tooltip text.
      formatter: function (params) {
        // Capitalize the first letter of each series name and display value
        const tooltipContent = params
          .map(function (item) {
            const colorCircle = `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${item.color}"></span>`;
            return `${colorCircle} ${capitalizeFirstLetter(item.seriesName) + ': ' + item.value}`;
          })
          .join('<br>');
        return tooltipContent;
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
    grid: {
      left: '50',
      right: '20',
      bottom: '40',
      top: '10',
      containLabel: true,
    },
    xAxis: {
      type: 'value',

      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
        },
      },
      axisLine: {
        show: true, // Display the bottom axis line
        lineStyle: {
          color: '#E6E6E7', // Change the color here
        },
      },
    },
    yAxis: {
      inverse: true,
      type: 'category',
      data: dataLabels,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
      },
      axisLabel: {
        formatter: function (value, index) {
          const splits = value.split('-');
          if (index === 0) {
            return (
              '{emoji|' +
              '🥇' +
              '}' +
              '\xa0\xa0' +
              '{value|' +
              `${splits[0] ? `${splits[0]}` : 'N/A'}` +
              '}' +
              '\n' +
              '{index|' +
              `${splits[1] ? splits[1] : 0}` +
              '}'
            );
          } else if (index === 1) {
            return (
              '{emoji|' +
              '🥈' +
              '}' +
              '\xa0\xa0' +
              '{value|' +
              `${splits[0] ? splits[0] : 'N/A'}` +
              '}' +
              '\n' +
              '{index|' +
              `${splits[1] ? splits[1] : 0}` +
              '}'
            );
          } else if (index === 2) {
            return (
              '{emoji|' +
              '🥉' +
              '}' +
              '\xa0\xa0' +
              '{value|' +
              `${splits[0] ? splits[0] : 'N/A'}` +
              '}' +
              '\n' +
              '{index|' +
              `${splits[1] ? splits[1] : 0}` +
              '}'
            );
          } else {
            return (
              '{value|' +
              `${splits[0] ? splits[0] : 'N/A'}` +
              '}' +
              '\n' +
              '{index|' +
              `${splits[1] ? splits[1] : 0}` +
              '}'
            );
            // return (
            //   '{emoji|' +
            //   '🏅' +
            //   '}' +
            //   '\xa0\xa0' +
            //   '{value|' +
            //   `${splits[0] ? splits[0] : 'N/A'}` +
            //   '}' +
            //   '\n' +
            //   '{index|' +
            //   `${splits[1] ? splits[1] : 0}` +
            //   '}'
            // );
            // return '{' + 'Sunny' + '| }\xa0\xa0\xa0\xa0{value|' + value + '}';
          }
          // return (
          //   '{emoji|' +
          //   '🏅' +
          //   '}' +
          //   '{value|' +
          //   `${splits[0] ? splits[0] : ''}` +
          //   '}' +
          //   '\n' +
          //   '{index|' +
          //   `${splits[1] ? splits[1] : ''}` +
          //   '}'
          // );
        },
        align: 'right',
        margin: 32,
        textStyle: {
          color: '#86868B',
          fontStyle: 'normal',
          fontWeight: '400',
          fontSize: 12,
        },
        // You can add more properties as needed
        rich: {
          emoji: {
            fontWeight: 400,
            fontSize: 32,
            align: 'right',
            right: 0,
          },
          value: {
            fontSize: 12,
            lineHeight: 16,
            align: 'left',
            fontWeight: 400,
            color: '#86868B',
          },
          index: {
            lineHeight: 16,
            align: 'right',
            color: '#262527',
            fontStyle: 'normal',
            fontWeight: '400',
            fontSize: 12,
          },
        },
      },
    },
    series: Object.keys(series)?.map((key) => ({
      name: key.replace(/([A-Z])/g, ' $1').trim(),
      type: 'bar',
      data: series[key],
      barWidth: 12,
      barGap: '0%',
      itemStyle: {
        borderRadius: [0, 8, 8, 0],
      },
    })),
  };

  return <ReactECharts opts={{ renderer: 'svg' }} option={options} style={style} />;
};

BarYChart.defaultProps = {
  style: { height: '100%', width: '100%' },
};

BarYChart.propTypes = {
  heading: PropTypes.string.isRequired,
  colors: PropTypes.array.isRequired,
  className: PropTypes.string,
  dataLabels: PropTypes.array.isRequired,
  series: PropTypes.object.isRequired,
  style: PropTypes.object,
};

export default BarYChart;
