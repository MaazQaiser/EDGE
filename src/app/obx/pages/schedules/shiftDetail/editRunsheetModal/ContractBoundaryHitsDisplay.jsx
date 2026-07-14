import { ExpandMore } from '@mui/icons-material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum } from 'src/utils/constants';

import { dayjsWithStandardOffset } from '../../helper';

const normalizeHits = (hits) => {
  if (!Array.isArray(hits) || !hits.length) return [];
  return hits.map((h, i) => ({
    hitId: h?.hitId || h?.id,
    name: h?.name,
    siteName: h?.siteName || h?.site?.name,
    siteId: h?.siteId,
    startsAt: h?.startsAt || h?.startTime,
    endsAt: h?.endsAt || h?.endTime,
    index: i + 1,
  }));
};

const groupHitsBySite = (hits) => {
  const groups = {};
  hits.forEach((hit) => {
    const key = hit.siteName || (hit.siteId != null ? `Site ${hit.siteId}` : hit.name || 'Unknown');
    if (!groups[key]) groups[key] = [];
    groups[key].push(hit);
  });
  return Object.entries(groups).map(([groupKey, siteHits]) => ({
    groupKey,
    hits: siteHits,
    count: siteHits.length,
  }));
};

const ContractBoundaryHitsDisplay = ({ hits, classes }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const { formatDayjsDateTime } = useDateTime();

  const normalized = normalizeHits(hits);
  const grouped = groupHitsBySite(normalized);

  if (!grouped.length) return null;

  const hitLabel = getLabel('terms', 'hit', t);

  return (
    <Box className={classes?.hitsAccordion}>
      {grouped.map(({ groupKey, hits: siteHits, count }) => (
        <Accordion key={groupKey} defaultExpanded disableGutters>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2">
              {groupKey} • {count} {hitLabel}(s)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {siteHits.map((hit, idx) => {
                const startStr = hit.startsAt
                  ? formatDayjsDateTime({
                      value: dayjsWithStandardOffset(hit.startsAt),
                      formatType: dayjsFormatsEnum.time,
                    })
                  : '—';
                const endStr = hit.endsAt
                  ? formatDayjsDateTime({
                      value: dayjsWithStandardOffset(hit.endsAt),
                      formatType: dayjsFormatsEnum.time,
                    })
                  : '—';
                const timeRange = `${startStr} - ${endStr}`;
                const hitName = hit.name || `${hitLabel} ${hit.index || idx + 1}`;
                return (
                  <Box
                    key={hit.hitId || `${groupKey}-hit-${hit.index}`}
                    className={classes?.hitItem}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {hitName} • {timeRange}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

ContractBoundaryHitsDisplay.propTypes = {
  classes: PropTypes.object,
  hits: PropTypes.arrayOf(
    PropTypes.shape({
      siteName: PropTypes.string,
      site: PropTypes.object,
      startsAt: PropTypes.string,
      endsAt: PropTypes.string,
      startTime: PropTypes.string,
      endTime: PropTypes.string,
    }),
  ),
};

ContractBoundaryHitsDisplay.defaultProps = {
  classes: {},
  hits: [],
};

export default ContractBoundaryHitsDisplay;
