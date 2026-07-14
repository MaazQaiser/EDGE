export function queryParameterDateFormatter(date) {
  return `${date['$M'] + 1}-${date['$D']}-${date['$y']}`;
}
