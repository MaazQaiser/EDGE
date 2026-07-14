import ReactECharts from 'echarts-for-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { pieChartLegendFormat } from 'src/utils/pieChart/legendFormat';
import { resonsivePieChartLegendFormat } from 'src/utils/pieChart/responsiveChartLegend';
const PieChart = ({
  colors,
  data,
  style,
  toolTipFormatter = '{b}: ${c}',
  legedFormatter = '',
  legendStyle,
}) => {
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

  const options = {
    tooltip: {
      trigger: 'item',
      formatter: toolTipFormatter,
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
      selectedMode: true, // This line disables/enables legend click
      left: 'left',
      orient: 'vertical',
      top: 'middle',
      data: data?.map((item) => item.name),
      formatter: function (name) {
        if (!!legedFormatter) {
          /**
           * handle the legened form for responsive case
           */
          if (
            (maxWidth >= 1280 && maxWidth <= 1540 && name.length > 22) ||
            (maxWidth <= 1280 && name.length > 12)
          )
            return resonsivePieChartLegendFormat(data, name, maxWidth, legedFormatter);

          /**
           * format legend without responsive
           */
          return pieChartLegendFormat(data, name, legedFormatter);
        } else {
          // ? NOTE: if the variable "value" is not getting used add _ before it or this rule will suffice the need here.
          // eslint-disable-next-line no-unused-vars
          const value = data.find((item) => item.name === name).value;
          return `${name}`;
        }
      },
      tooltip: {
        show: true, // Enable tooltip for legend items
        function(name) {
          if (!!legedFormatter) {
            return `${name}`;
          }
        },
      },
      itemStyle: {
        type: 'dotted',
        borderRadius: 10, // Need to udpate bcz not picking this styles
      },
      textStyle: {
        fontSize: 10,
        color: '#86868B',
        fontWeight: 500,
        lineHeight: 14,
      },
      ...legendStyle,
    },

    color: colors,
    series: [
      {
        type: 'pie',
        radius: ['28%', '63%'],
        center: ['78%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          disabled: true,
          opacity: 0,
        },
        labelLine: {
          show: false,
        },
        data: data,
        colors: colors,
      },
    ],
  };

  return <ReactECharts opts={{ renderer: 'svg' }} option={options} style={style} />;
};

PieChart.propTypes = {
  heading: PropTypes.string,
  colors: PropTypes.array,
  data: PropTypes.array,
  style: PropTypes.object.isRequired,
  stats: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  toolTipFormatter: PropTypes.string,
  legedFormatter: PropTypes.string,
  ChartInnerWrapperClass: PropTypes.string,
  legendStyle: PropTypes.object,
};

export default PieChart;
