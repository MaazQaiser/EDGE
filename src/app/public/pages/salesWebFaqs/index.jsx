import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import FAQImage from 'assets/images/faq-image.png';
import { ReactComponent as ChevronLeftIcon } from 'assets/svg/chevron-left.svg?react';
import { ReactComponent as ChevronRightIcon } from 'assets/svg/chevron-right.svg?react';
import { ReactComponent as ChevronUpIcon } from 'assets/svg/chevron-up.svg?react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import { ROOT } from 'src/app/router/constant/ROUTE';
import { ReactComponent as SignalLogo } from 'src/assets/svg/signallogo.svg?react';

import { useStyles } from './faq.styles';

const FAQ = () => {
  const classes = useStyles();
  const { _t } = useTranslation();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  return (
    <Box className={classes.faq}>
      <Box className={classes.faqHeader}>
        <Link to={ROOT}>
          <SignalLogo />
        </Link>
        {/* <Box>
          <SearchComponent placeholder="Search" />
        </Box> */}
      </Box>
      <Box className={classes.faqHero}>
        <Box className={classes.faqHeroContent}>
          <Box className={classes.faqDesc}>
            <Typography variant="h1" className={classes.faqTitle}>
              Frequently Asked Questions
            </Typography>
            <Typography variant="body2" className={classes.faqText}>
              Choose a topic to view FAQs and get answers to your queries
            </Typography>
          </Box>
          <img src={FAQImage} className={classes.faqImage} />
        </Box>
      </Box>
      <Box className={classes.faqContent}>
        <Box className={classes.faqContentWrapper}>
          <Box className={classes.functionalDiv}>
            <Tabs
              variant="scrollable"
              scrollButtons="auto"
              value={value}
              onChange={handleChange}
              className={classes.tabContainer}
              ScrollButtonComponent={({ direction, disabled, ...props }) => {
                if (direction === 'left' && !disabled) {
                  return (
                    <Button variant="secondaryGrey" {...props}>
                      <ChevronLeftIcon />
                    </Button>
                  );
                } else if (direction === 'right' && !disabled) {
                  return (
                    <Button variant="secondaryGrey" {...props}>
                      <ChevronRightIcon />
                    </Button>
                  );
                } else {
                  return null;
                }
              }}
            >
              <Tab label="Locations" {...a11yProps(0)} />
              <Tab label="Deals" {...a11yProps(1)} />
              {/* <Tab label="Route Creation" {...a11yProps(2)} /> */}
              <Tab label="Contract Creation" {...a11yProps(2)} />
              {/* <Tab label="Scouting" {...a11yProps(4)} /> */}
            </Tabs>
          </Box>

          <Box className={classes.tabPanelBox}>
            <CustomTabPanel value={value} index={0}>
              <>
                <Box className={classes.faqAccordion}>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I create a new location that does not exist in Hubspot?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Locations created are reviewed and approved by the Home Office before they
                          can be shown in the listing. To add a location, follow the steps below:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Click on “Create Location” on the Location Listing Page.</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/CreateLocation.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start={'2'}>
                        <li> Enter the following information to create a location</li>
                        <ol className={classNames(classes.listStyle, classes.doubleList)}>
                          <li>Company</li>
                          <li>Location name</li>
                          <li>Location source</li>
                          <li>Franchise</li>
                          <li>Hubspot stage</li>
                          <li>Location address</li>
                          <li>Assignee</li>
                          <li>Contact Details</li>
                        </ol>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/CreateLocationDrawer.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
                      <ol className={classes.numberList} start={'3'}>
                        <li>
                          If a company does not exist, it can be created by clicking on “Create
                          New”.
                        </li>

                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/AddNewCompany.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        What are the different stages of the location life cycle
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <ul className={classes.numberList}>
                          <li>
                            <b>Open Location:</b> Work not started on a Location yet or it’s a new
                            location.
                          </li>
                          <li>
                            <b> Working:</b> Gathering contact details, planning to contact, or
                            attempting to arrange a meeting
                          </li>
                          <li>
                            <b> Connected:</b> Met with a point of contact or engaged in at least
                            one activity, such as a one-on-one meeting, taking notes, making a
                            physical visit, or sending an email.
                          </li>
                          <li>
                            <b>Qualified:</b> Connected with the lead and confirmed that they are
                            within a serviceable area. Additionally, the lead has expressed interest
                            or shown responsiveness to our outreach regarding physical security
                            services.
                          </li>
                          <li>
                            <b> Unqualified:</b> The lead is seeking employment, is not interested
                            in security, or is not located in a serviceable area.
                          </li>
                        </ul>
                      </Box>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I update a Location’s stage?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Stages can progress to the next stage in any order without a specific
                          sequence. However, once changed, they cannot revert to the previous stage.
                          A location’s stage also needs to be mapped to the relevant Hubspot stage.
                          There are two ways to update a location’s stage:
                        </Typography>
                      </Box>

                      <ol className={classes.numberList}>
                        <li>
                          If a company does not exist, it can be created by clicking on “Create
                          New”.
                        </li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/MarkStageAsComplete.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start={'2'}>
                        <li> Clicking on the “Stepper” will update the location to any stage.</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/Stepper.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        Why do I need to answer Questions for a Location?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Locations will be classified based on scores obtained from the questions
                          answered. It is highly recommended to complete all the questions for
                          optimized lead grading. Questions can be answered at any location stage.
                        </Typography>
                      </Box>
                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/Questions.png'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                      />
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I mark a Location as Unqualified?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          On the Location details page, click on “Close” and select the relevant
                          Hubspot Stage to mark the Location as Unqualified. Once a location has
                          been Qualified, it cannot be marked as Unqualified. To mark a Location as
                          unqualified:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li> Click on “Close” on the Location details page</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/Close.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start={'2'}>
                        <li> Select relevant Hubspot stage</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/Hubspot.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I mark a Location as Qualified?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Qualified Locations are a prerequisite for making a Deal. To mark a
                          Location as “Qualified”:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>
                          From the Location details page, click on “Qualified” on the “Stepper”.
                        </li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/Qualified.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start={'2'}>
                        <li> Select relevant Hubspot Stage</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/HubspotStage.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
                    </Box>
                  </FAQAccordion>
                </Box>
              </>
            </CustomTabPanel>

            <CustomTabPanel value={value} index={1}>
              <>
                <Box className={classes.faqAccordion}>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I create a Deal for Qualified Locations?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Deals against qualified Locations can be created from the:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li> Deal Listing Page</li>
                        <li> Qualified Location’s detail page</li>
                      </ol>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Deals Listing Page
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li> Click on “Create Deal”</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/CreateDeal.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start="2">
                        <li> Add the following information:</li>
                        <ol className={classNames(classes.listStyle, classes.doubleList)}>
                          <li>Deal Name</li>
                          <li>Deal Owner</li>
                          <li>Pipeline</li>
                          <li>Hubspot Stage</li>
                          <li>Company</li>
                          <li>Location</li>
                        </ol>
                      </ol>

                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Based on Location selected, the Location Source, Associated Franchise,
                          Contact details and Address details are auto-populated.
                        </Typography>
                      </Box>
                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/CreateDealDrawer.png'
                        }
                        className={classes.faqAccordionAnswerImage}
                      />
                      <Box className={classNames(classes.faqAccordionAnswerBox, classes.faqMt)}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Qualified Location Details Page
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>On the qualified Location’s details page, click on “Make a Deal”</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/MakeaDeal.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start="2">
                        <li>Add the following information:</li>
                        <ol className={classNames(classes.listStyle, classes.doubleList)}>
                          <li>Deal Name</li>
                          <li>Deal Owner</li>
                          <li>Pipeline</li>
                          <li>Deal Stage</li>
                        </ol>
                      </ol>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Contact and Company name will be auto-populated against the selected
                          Location.
                        </Typography>
                      </Box>
                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/ConvertToDeal.png'
                        }
                        className={classes.faqAccordionAnswerImage}
                      />
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        What are the different stages of the Deal Life Cycle?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <ul className={classes.numberList}>
                          <li>
                            <b> Proposal Created: </b> Create a proposal tailored to the
                            client&#39;s needs.
                          </li>
                          <li>
                            <b> Proposal Delivered:</b> The proposal has been created and delivered
                            to the client or ongoing negotiations are taking place
                          </li>
                          <li>
                            <b> Closed Won:</b> Deal has been successfully closed and is ready to
                            proceed with security services.
                          </li>
                          <li>
                            <b> Closed Lost:</b> A deal that was unsuccessful or where the client
                            showed no interest in taking security services.
                          </li>
                        </ul>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/DealStages.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                        />
                      </Box>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        When can a Deal be marked as Closed Lost?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          A Deal can be marked as Closed Lost at any stage before it is marked as
                          Closed Won.
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Select “Close” from the Deal details page.</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/DealClose.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start="2">
                        <li>Select “Closed Lost” and map the relevant Hubspot stage.</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/ClosedLost.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Alternatively, Deals can be marked “Closed Lost” from the Stepper.
                        </Typography>
                      </Box>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        When can a Deal be marked as Closed Won?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          A Deal can be marked as “Closed Won” when a proposal is published. The
                          relevant hubspot stage should be mapped before marking a Deal as “Closed
                          Won”.
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Publish Contract</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/ClosedWon.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start="2">
                        <li>Select Closed Won and map relevant Hubspot stage.</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/ClosedWonAndMap.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I add a follow-up against a Deal?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Follow-ups created are shown in Routes. A follow-up can be added against a
                          Deal at any stage from the Deal details page. Only one follow-up can be
                          added at a time i.e. a follow-up needs to be completed before the next one
                          can be added. To add a follow-up:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Click on the “Follow-up” button.</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/FollowUp.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start="2">
                        <li>Add follow-up details:</li>
                        <ol className={classNames(classes.listStyle, classes.doubleList)}>
                          <li>
                            <b>Follow-up reason:</b> Task details such as calling or meeting up with
                            the Decision Maker.
                          </li>
                          <li>
                            <b>Follow-up date:</b> Date of when to follow-up with the Decision
                            Maker.
                          </li>
                          <li>
                            <b> Start time and End time:</b> Time slot when the Decision Maker is
                            available.
                          </li>
                        </ol>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/FollowUpPopup.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How to complete a follow-up against a Deal?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <ol className={classes.numberList}>
                          <li>
                            On the Deal details page, click on “Mark Done” to complete a follow-up.
                          </li>
                          <img
                            src={
                              'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/MarkDone.png'
                            }
                            className={classNames(
                              classes.faqAccordionAnswerImage,
                              classes.listImage,
                            )}
                          />
                        </ol>
                      </Box>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        What happens when follow-ups are added?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Follow-ups added against locations or deals are shown on the map. The pin
                          location on the map is only shown on the day of the follow-up so that it
                          is easier for the salesperson/intern to prioritize tasks for that day.
                        </Typography>
                      </Box>
                    </Box>
                  </FAQAccordion>
                </Box>
              </>
            </CustomTabPanel>

            <CustomTabPanel value={value} index={2}>
              <>
                <Box className={classes.faqAccordion}>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How to create a Proposal?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Under the Contracts & Terms tab, a proposal is created. Only one proposal
                          can be created at a time. A proposal consists of the following details:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Name of the Proposal</li>
                        <li>Duration (Start time and End time)</li>
                        <li>Time Zone</li>
                        <li>Services</li>
                        <li>Devices</li>
                        <li>Additional On-Demand Services</li>
                        <li>Payment Terms</li>
                        <li>Description of Services</li>
                        <li>Signees</li>
                      </ol>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          The minimum details required to draft a proposal include:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Proposal name</li>
                        <li>Timezone (where job will be performed)</li>
                        <li>Duration (i.e. start date and end date)</li>
                      </ol>
                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/create-proposal-faq.png'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                      />
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        What are the types of Services that can be added to a Proposal?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          There are two types of services:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Dedicated Service</li>
                        <li>Patrol Service</li>
                      </ol>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          There is no limit to the number of services that can be added to a
                          proposal.
                        </Typography>
                      </Box>
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How to Add a Dedicated Service to a Proposal?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          On Add Services step, Select Dedicated Service, then following details
                          will be displayed:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Officer Type: Select one officer type</li>
                        <li>Officers Required: Enter number of officers required for the Job</li>
                        <li>Hourly Rate: Hourly rate ($) charged to Client</li>
                        <li>
                          Job Days: Select days on which Job has to be performed (Monday to Sunday)
                        </li>
                        <li>Start Time: Job start time</li>
                        <li>End Time: Job end time</li>
                        <li>Fuel Surcharge: Select for any fuel surcharges</li>
                        <li>
                          Instruction: Add instructions - Reflected in Description of Services
                        </li>
                        <li>
                          Additional Services: Select additional services if any, such as Visitor
                          Management or Load Management
                        </li>
                      </ol>
                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/dedicated-proposal-faq.png'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                      />
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How to add a Patrol Service to a Proposal?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          On the Add Services step, Select Patrol Service. Then its details will be
                          displayed.
                        </Typography>
                      </Box>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          There are two types of Patrol visits:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Random: Officers will visit at any time in the duration defined</li>
                        <li>Fixed: Officers will visit the site at the exact time defined</li>
                        <li>Hourly Rate: Hourly rate ($) charged to Client</li>
                      </ol>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          A single service can have both types of patrol visits.
                        </Typography>
                      </Box>
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I add a Random Visit in Patrol Service to a Proposal?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          For Random Patrol Visits define:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Officer Type: Select one officer type</li>
                        <li>Officers Required: Enter number of officers required for the Job</li>
                        <li>Price per Visit ($): Price for each visit</li>
                        <li>Visit Type: Select either Random or Fixed</li>
                        <li>Fuel Surcharge: Select for any fuel surcharges</li>
                        <li>
                          Instructions: Add Instructions - Reflected in Description of Services
                        </li>
                        <li>Duration: Start time and End time</li>
                        <li>
                          Visits per Day: Number of visits the officer will do in the defined
                          duration.
                        </li>
                        <li>Visit Days: Days on which the officer has to visit the site.</li>
                      </ol>
                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/proposal-services-faq.png'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                      />
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I add a Fixed Visit in Patrol Service to a Proposal?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          For Fixed Patrol Visits define:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Officer Type: Select one officer type</li>
                        <li>Officers Required: Enter number of officers required for the Job</li>
                        <li>Price per Visit ($): Price for each visit</li>
                        <li>Visit Type: Select either Random or Fixed</li>
                        <li>Fuel Surcharge: Select for any fuel surcharges</li>
                        <li>Instructions: Add Instructions</li>
                        <li>Duration: Start time and End time</li>
                        <li>
                          Visits per Day: Number of visits the officer will do for the exact time
                          defined.
                        </li>
                        <li>Visit Days: Days on which the officer has to visit the site</li>
                      </ol>
                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/fixed-petrol-proposal-faq.png'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                      />
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How to add Device details to a Proposal?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Device purchase is optional. The payment for Devices will be billed in the
                          first invoice only.
                        </Typography>
                      </Box>
                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/device-proposal-faq.png'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                      />
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How to add On Demand Additional Services to a Proposal?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Client rates for Additional services like Dispatch Request and Extra job
                          can be added. When a client will request for these services during their
                          contract’s duration, these prices will be applicable. Additionally, custom
                          services can be added.
                        </Typography>
                      </Box>
                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/additional-proposal-faq.png'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                      />
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        What is included in Payment Terms in a Proposal?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          There are two parts to defining payment terms:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Billing Occurrence</li>
                        <li>Define Payment Terms</li>
                      </ol>
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        What is Billing Occurrence and how to add this to a Proposal?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Payment plans are defined here consisting of line items and payment
                          schedule.
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>
                          Line Items include:
                          <ol className={classNames(classes.listStyle, classes.doubleList)}>
                            <li>Service charges (i.e. dedicated or patrol services)</li>
                            <li>Fuel charges (if added against a service)</li>
                            <li>Tax percentage (applicable on all line items)</li>
                          </ol>
                        </li>
                      </ol>
                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/proposal-bill-faq.png'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                      />

                      <ol className={classes.numberList} start={'2'}>
                        <li>
                          Payment Schedule can be set on the following basis:
                          <ol className={classNames(classes.listStyle, classes.doubleList)}>
                            <li>Monthly</li>
                            <li>Biweekly</li>
                            <li>Weekly/Event</li>
                            <li>Flat Rate</li>
                          </ol>
                        </li>
                      </ol>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          “Event” payment schedule means that the proposal for an event/special
                          occasion spans for one week only, therefore the duration (i.e. start date
                          and end date) in the proposal should not be more than 7 days.
                        </Typography>
                      </Box>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Flat rate includes price of all services and fuel surcharges (if any).
                          Only tax rate value is added onto the Flat rate amount.
                        </Typography>
                      </Box>
                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/proposal-payment-faq.png'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                      />
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How to add Payment Term details to a Proposal?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          The following details are defined:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>
                          Cycle Reference Date: First date from where billing cycle will start
                        </li>
                        <li>
                          Payment Terms: Payment to be made within “X” days from the invoice date
                        </li>
                        <li>Payment Method: Select one payment method</li>
                        <li>
                          Annual Rate increase: Percentage value added annually to the contracts
                          amount
                        </li>
                        <li>Holiday Multiplier: Add multiplier value</li>
                        <li>Billing Type: Prepaid or postpaid</li>
                        <li>
                          Officer Breaks: Define if officer breaks will be charged to the Client
                        </li>
                      </ol>
                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/proposal-payment-faq.png'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                      />
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How is the total amount calculated in a Proposal?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          The total amount is displayed at the bottom of the contract:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>
                          Service rates are calculated individually for each service (in Service
                          Module) and also added to the Total Amount
                        </li>
                        <li>
                          Device rates are calculated and billed with the first invoice only and
                          added separately to the Total Amount
                        </li>
                        <li>
                          On Demand Additional Services are not added to the Total Amount shown in
                          the proposal
                        </li>
                        <li>Tax rates and fuel charges (if added) are added to the Total Amount</li>
                      </ol>
                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/amount-proposal-faq.png'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                      />
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        What are Description of Services in a Proposal?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Description of Services outline details that are populated based on the
                          data entered in the proposal.
                        </Typography>
                      </Box>

                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/services-desc-faq.png'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                      />
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How are Signeess added to the Proposal?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <ol className="numberList">
                        <li>To add a signature, enter Signee name and title.</li>
                        <li>At least two signees are required.</li>
                      </ol>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Contracts can be published without signatures, however, it is highly
                          recommended to publish proposals with complete information.
                        </Typography>
                      </Box>
                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/proposal-signee-faq.png'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                      />
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        What happens when a proposal is published?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Contracts can be published for Deals marked as Closed Won. Once published,
                          contracts cannot be modified and contract details are reflected in OBX.
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>To add a signature, enter Signee name and title.</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/proposal-sign-faq.png'
                          }
                          className={classNames(
                            classes.faqAccordionAnswerImage,
                            classes.listImage,
                            classes.faqMb,
                          )}
                        />
                        <li>Once contracts are published, a signed copy needs to be uploaded.</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/proposal-upload-faq.png'
                          }
                          className={classNames(
                            classes.faqAccordionAnswerImage,
                            classes.listImage,
                            classes.faqMb,
                          )}
                        />
                      </ol>
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        Can contracts be terminated?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Once published, Contracts can be terminated. When Contracts are
                          terminated, signed copies of Contracts cannot be updated.
                        </Typography>
                      </Box>
                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqSalesWeb/proposal-termination-faq.png'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                      />
                    </Box>
                  </FAQAccordion>
                </Box>
              </>
            </CustomTabPanel>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FAQ;

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  const classes = useStyles();

  return (
    <Box
      role="tabpanel"
      className={classes.faqTabPanel}
      id={`simple-tabpanel-${index}`}
      hidden={value !== index}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </Box>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const FAQAccordion = ({ children, header, accordionNo }) => {
  const [accordionOpen, setAccordionOpen] = useState(false);
  return (
    <Accordion expanded={accordionOpen} defaultExpanded={accordionNo === 0 ? true : false}>
      <AccordionSummary
        expandIcon={<ChevronUpIcon />}
        onClick={() => setAccordionOpen(!accordionOpen)}
      >
        {header}
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};

FAQAccordion.propTypes = {
  children: PropTypes.node,
  header: PropTypes.string,
  accordionNo: PropTypes.number,
};
