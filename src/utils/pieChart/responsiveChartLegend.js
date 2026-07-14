import { fomatNumbersWithCommas } from '../currencyFormater';

/**
 * @description this will handle the legend format in responsive case for PIE chart grapgh
 * @param {*} data // array of label and value to view in chart
 * @param {*} name  // label of the chart
 * @param {*} maxWidth // width in number to manage responsive
 * @param {*} legedFormatter // formatter sign
 * @returns
 */
export function resonsivePieChartLegendFormat(data, name, maxWidth, legedFormatter) {
  const value = data?.find((item) => item.name === name).value;
  if (maxWidth >= 1280 && maxWidth <= 1540 && name.length > 22) {
    name = name.substring(0, 22) + '...'; // Truncate the legend label

    // if legedFormatter is value then show the value after name (label) and also localize
    if (legedFormatter === 'value') return `${name} • ${fomatNumbersWithCommas(value)}`;

    // if legedFormatter is $ then show the value after name (label). Add legedFormatter (sign) and also localize
    if (legedFormatter === '$')
      return `${name} • ${legedFormatter}${fomatNumbersWithCommas(value)}`;

    // show the legend as it is if not the match the above two conditions
    return `${value}${legedFormatter} ${name}`;
  } else if (maxWidth <= 1280 && name.length > 12) {
    name = name.substring(0, 12) + '...'; // Truncate the legend label

    // if legedFormatter is value then show the value after name (label) and also localize
    if (legedFormatter === 'value') return `${name} • ${fomatNumbersWithCommas(value)}`;

    // if legedFormatter is $ then show the value after name (label). Add legedFormatter (sign) and also localize
    if (legedFormatter === '$')
      return `${name} • ${legedFormatter}${fomatNumbersWithCommas(value)}`;
    return `${value}${legedFormatter} ${name}`;
  }
}
