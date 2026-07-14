import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import LoaderComponent from 'src/app/components/common/loader';
import { HO_SETTINGS } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { getTemplate } from 'src/services/template.services';

import PreviewTemplate from '../components/previewTemplate';

const index = () => {
  const [template, setTemplate] = useState({});
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const getTemplateDetails = async () => {
    try {
      const res = await getTemplate(id);
      setTemplate(res?.data?.template);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      history.push(HO_SETTINGS);
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
    return <PreviewTemplate template={template} />;
  };
  return renderPreviewPage();
};

export default index;
