import React from 'react';

import { preferencesType } from '../../../constants';
import Type from '../../components/type';

const columns = [
  { id: 'title', label: 'Visitor Type', sortable: true },
  { id: 'createdOn', label: 'Created On', sortable: true },
  { id: 'associatedSites', label: 'Associated Sites' },
];

const VisitorTypes = () => {
  return (
    <>
      <Type columns={columns} listType={preferencesType.VISITOR_TYPE} />
    </>
  );
};

export default VisitorTypes;
