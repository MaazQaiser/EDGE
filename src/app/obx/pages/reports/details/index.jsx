import DynamicTemplateRender from 'commonComponents/dynamicFormRender';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import LoaderComponent from 'src/app/components/common/loader';
import { OBX_REPORTS } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { generateInitialValues, isObjectEmpty } from 'src/helper/utilityFunctions';
import useFormHook from 'src/hooks/useFormHook';
import { getReportDetails } from 'src/services/reports.services';

import ReportPreview from '../components/preview';

const enumDynamicForm = {
  dynamicFormField: 'dynamicFormField',
};
const index = () => {
  const [template, setTemplate] = useState({});
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const { handleInputChange, errorMessages, setErrorMessages, removeError, setFormData } =
    useFormHook({
      defaultFormData: {},
    });

  const getTemplateDetails = async () => {
    try {
      const res = await getReportDetails(id);

      const hardCopy = JSON.parse(JSON.stringify(res?.data));

      const { initialValues } = generateInitialValues(hardCopy?.sectionsAttributes);

      setFormData(initialValues);

      setTemplate({ ...res?.data });

      setLoading(false);
    } catch (error) {
      console.error({ error });
      setLoading(false);
      history.push(OBX_REPORTS);
    }
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      getTemplateDetails();
    }
  }, [id]);

  const renderPreviewPage = () => {
    if (loading) return <LoaderComponent size={50} />;

    if (!isObjectEmpty(template)) {
      return (
        <DynamicTemplateRender
          template={template}
          handleChange={handleInputChange}
          errorMessages={errorMessages}
          fieldName={enumDynamicForm.dynamicFormField}
          removeError={removeError}
          setErrorMessages={setErrorMessages}
        />
      );
    }

    return <ReportPreview template={{}} setLoading={setLoading} fetchReport={getTemplateDetails} />;
  };
  return renderPreviewPage();
};

export default index;
