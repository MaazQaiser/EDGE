import { ReactComponent as Connected } from 'assets/svg/connected.svg?react';
import { ReactComponent as Leads } from 'assets/svg/Leads.svg?react';
// import { ReactComponent as Nurturing } from 'assets/svg/nurturing.svg';
import { ReactComponent as Qualified } from 'assets/svg/qualified.svg?react';
import { ReactComponent as Working } from 'assets/svg/working.svg?react';

/**
 * stages values for backend
 */
export const stageValues = {
  WORKING: 'working',
  NURTURING: 'nurturing',
  QUALIFIED: 'qualified',
  UNQUALIFIED: 'unqualified',
  NEW_LOCATION: 'open_location',
};

/**
 * stages
 */
export const stageName = {
  newLocation: 'New Location',
  WORKING: 'Working',
  NURTURING: 'Nurturing',
  QUALIFIED: 'Qualified',
};

/**
 * Location stages
 */
export const stepperDefaultStage = [
  {
    name: 'Open Location',
    tooltipContent: 'Collect vital information and assign the lead to a sales representative.',
    dialogContent: 'Collect vital information and assign the lead to a sales representative.',
    icon: <Leads />,
  },
  {
    name: 'Working',
    tooltipContent:
      'Gather contact details and establish a connection through routinely appointments.',
    dialogContent:
      'Gather contact details and establish a connection through routinely appointments.',
    icon: <Working />,
  },
  {
    name: 'Connected',
    tooltipContent:
      'Strategise how to attract the prospective buyers & make them interested in services.',
    dialogContent:
      'Strategise how to attract the prospective buyers & make them interested in services.',
    icon: <Connected />,
  },
  {
    name: 'Qualified',
    tooltipContent:
      ' Convert promising locations into a deal based on their responses and past activity.',
    dialogContent:
      ' Convert promising locations into a deal based on their responses and past activity.',
    icon: <Qualified />,
  },
  {
    name: 'Unqualified',
    tooltipContent: '',
    dialogContent: '',
    icon: <Qualified />,
  },
  // Add more button data here
];
