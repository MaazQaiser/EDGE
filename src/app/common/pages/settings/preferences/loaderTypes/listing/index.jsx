import React from 'react';

import { preferencesType } from '../../../constants';
import Type from '../../components/type';

const columns = [
  { id: 'title', label: 'Report', sortable: true },
  { id: 'createdOn', label: 'Created On', sortable: true },
  { id: 'associatedSites', label: 'Associated Sites' },
];

const LoaderTypes = () => {
  return (
    <>
      <Type columns={columns} listType={preferencesType.LOAD_TYPE} />
    </>
  );
};

export default LoaderTypes;
