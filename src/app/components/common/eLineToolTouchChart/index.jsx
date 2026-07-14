import ReactECharts from 'echarts-for-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { capitalizeFirstLetter } from 'src/utils/string/common';

const LineToolTouchChart = ({ colors, style, data, dataLabels = [], dataZoom = null }) => {
  // const displayDataLabels = dataLabels.map((str) => str.charAt(0).toUpperCase() + str.slice(1));
  const [maxWidth, setMaxWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setMaxWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getAxisInterval = () => {
    if (maxWidth <= 1280) {
      return 2;
    } else if (maxWidth >= 1280 && maxWidth <= 1680) {
      return 1;
    } else {
      return 0;
    }
  };

  const options = {
    textStyle: {
      fontSize: 10,
      color: '#86868B',
      fontWeight: 500,
    },
    tooltip: {
      trigger: 'axis',
      // formatter: '{b0}: {c0}<br />{b1}: {c1}',
      // position: function (pt) {
      //   return [pt[0], 130];
      // },
      // formatter: function (params) {
      //   return params.map((param) => `${param.axisValue}: ${param.value[1]}`).join('<br>');
      // },
      // Formatter function to customize tooltip text.
      formatter: function (params) {
        const tooltipContent = params
          .map(function (item) {
            const colorCircle = `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${item.color}"></span>`;
            return `${colorCircle} ${capitalizeFirstLetter(item.seriesName) + ': ' + item.value[1]}`;
          })
          .join('<br>');
        return params[0].axisValueLabel + '<br>' + tooltipContent;
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

    xAxis: {
      type: 'category',
      // data: dataLabels,
      axisPointer: {
        type: 'none',
      },
      axisLabel: {
        interval: getAxisInterval(),
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
          lineStyle: {
            color: '#E6E6E7',
          },
        },
        axisLabel: {
          fontSize: 10,
          fontWeight: 500,
        },
      },
    ],
    grid: {
      top: 15,
      left: 40,
      right: 10,
      bottom: 40,
    },
    dataZoom:
      dataZoom === 'disabled'
        ? null
        : [
            {
              type: 'inside',
              throttle: 5,
            },
          ],

    series:
      !isObjectEmpty(data) &&
      Object.keys(data)?.map((key) => ({
        name: key,
        type: 'line',
        smooth: true,
        symbol: 'none',
        symbolSize: 5,
        sampling: 'average',
        itemStyle: {
          color: colors[key][0],
        },
        emphasis: false,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 1,
                color: colors[key][1],
              },
              {
                offset: 1,
                color: colors[key][1],
              },
            ],
          },
        },
        data: dataLabels?.map((label, index) => [label, data[key][index]]),
      })),
  };

  return (
    <>
      <ReactECharts opts={{ renderer: 'svg' }} option={options} style={style} />
    </>
  );
};

LineToolTouchChart.defaultProps = {
  style: { height: '100%', width: '100%' },
  dataLabels: [],
};

LineToolTouchChart.propTypes = {
  heading: PropTypes.string,
  colors: PropTypes.object,
  data: PropTypes.object,
  ChartInnerWrapperClass: PropTypes.string,
  style: PropTypes.object,
  stats: PropTypes.object,
  dataLabels: PropTypes.array,
  dataZoom: PropTypes.string,
};

export default LineToolTouchChart;
