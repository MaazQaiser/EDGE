import { ReactComponent as ClosedIcon } from 'assets/svg/Closed.svg?react';
// import { ReactComponent as NegotiationIcon } from 'assets/svg/Negotiation.svg';
// import { ReactComponent as ProposalIcon } from 'assets/svg/Proposal.svg';
// import { ReactComponent as QuestionsIcon } from 'assets/svg/questions.svg';
import { ReactComponent as ProposalCreation } from 'assets/svg/proposalCreation.svg?react';
import { ReactComponent as ProposalDelivered } from 'assets/svg/proposalDelivered.svg?react';

/**
 * stages values for backend
 */
export const stageValues = {
  QUESTIONS: 'questions',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  CLOSED_LOST: 'closed_lost',
  CLOSED_WON: 'closed_won',
  PROPOSAL_CREATION: 'proposal_creation',
};

/**
 * stages
 */
export const stageName = {
  CLOSED_LOST: 'Closed Lost',
  CLOSED_WON: 'Closed Won',
  CLOSED: 'Closed',
};

export const stepperDefaultStage = [
  {
    title: 'Proposal Creation',
    content:
      'Demonstrate how the prices you propose deliver more than enough value to offset the engagement cost.',
    dialogContent:
      'Demonstrate how the prices you propose deliver more than enough value to offset the engagement cost.',
    icon: <ProposalCreation />,
  },
  {
    title: 'Proposal Delivered',
    content: "Determine the customer's implmentation plan and adhere to due discount processes.",
    dialogContent:
      "Determine the customer's implmentation plan and adhere to due discount processes.",
    icon: <ProposalDelivered />,
  },
  // {
  //   title: 'Negotiation',
  //   content: `Determine the customer's implementation plan and adhere to due discount processes`,
  //   dialogContent: `Determine the customer's implementation plan and adhere to due discount processes`,
  //   icon: <NegotiationIcon />,
  // },
  {
    title: 'Closed Won',
    content: 'Finalize contract signing',
    dialogContent: 'Finalize contract signing with all involved parties to secure the deal',
    icon: <ClosedIcon />,
  },
  // Add more button data here
];
