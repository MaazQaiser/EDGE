import dayjs from 'dayjs';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { getDayName, getStartEndTimeWithDesiredDate } from 'src/app/obx/pages/schedules/helper';
import { getHitsForRunSheet } from 'src/services/runsheet.services';
import { daysOfWeekWithVal, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';
const useGetHits = (state, isEdit = false) => {
  const { t } = useTranslation();
  const [hitsList, setHitsList] = useState({});
  const [totalHits, setTotalHits] = useState(0);
  const [hitsLoading, setHitsLoading] = useState(false);
  const { id } = useParams();

  const getHits = useCallback(
    async (apendRunsheetName = false, errorCallback = () => {}) => {
      setHitsLoading(true);

      try {
        let payload = {};
        if (!isEdit) {
          const finalStartDate = getStartEndTimeWithDesiredDate(
            state?.startDate,
            state?.startsAt,
            state?.endsAt,
            true,
          );

          payload = {
            windowStart: finalStartDate?.startTime.toISOString(),
            windowEnd: finalStartDate?.endTime.toISOString(),
            dutyDay: daysOfWeekWithVal(t).find(
              (data) => data?.label === getDayName(finalStartDate?.startTime.toISOString(), t),
            )?.value,
          };
        } else {
          payload = {
            windowStart: dayjs(state?.startsAt).toISOString(),
            windowEnd: dayjs(state?.endsAt).toISOString(),
            dutyDay: state?.shiftDays[0],
          };

          if (id) payload.patrolTemplateId = id;
        }

        if (apendRunsheetName) payload.runsheetName = state?.runsheetName;

        const response = await getHitsForRunSheet(payload);
        setHitsList(response);
        setTotalHits(Object.values(response)?.flat()?.length || 0);
      } catch (e) {
        toaster.error({
          text: e?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        errorCallback();
      } finally {
        setHitsLoading(false);
      }
    },
    [state],
  );

  return { hitsList, hitsLoading, getHits, setHitsList, totalHits };
};

export default useGetHits;
