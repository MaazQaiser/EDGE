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
              Frequently Asked Questions OBX web
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
              <Tab label="Franchises" {...a11yProps(0)} />
              <Tab label="Zones" {...a11yProps(1)} />
              {/* <Tab label="Route Creation" {...a11yProps(2)} /> */}
              <Tab label="Sites" {...a11yProps(2)} />
              <Tab label="Schedules" {...a11yProps(3)} />
              <Tab label="Reports" {...a11yProps(4)} />
              <Tab label="Visitors Management" {...a11yProps(5)} />
              <Tab label="Loads Management" {...a11yProps(6)} />
              <Tab label="Time Off Requests" {...a11yProps(7)} />
              <Tab label="Users" {...a11yProps(8)} />
            </Tabs>
          </Box>

          <Box className={classes.tabPanelBox}>
            <CustomTabPanel value={value} index={0}>
              <>
                <Box className={classes.faqAccordion}>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How are Franchises added to Edge 2.0?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Franchises are synced from Hubspot to Edge 2.0. Franchise details, owner
                          details, and franchise address are needed.
                        </Typography>
                      </Box>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I make a Franchise functional?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          The following details are required to make a franchise functional:
                        </Typography>
                        <ul className={classNames(classes.numberList, classes.faqMb)}>
                          <li>The Franchise Boundary</li>
                          <li>Phone Number</li>
                          <li>
                            Details of a Contact person, where one must be an emergency contact
                          </li>
                        </ul>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          * Boundaries of different Franchises cannot overlap.
                        </Typography>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image5.png'
                          }
                          className={classes.faqAccordionAnswerImage}
                        />
                      </Box>
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
                        How can I create a Zone?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Zones can be created by Franchise Owners or Supervisors.
                        </Typography>
                      </Box>

                      <ol className={classes.numberList}>
                        <li> Click on “Create Zone” in the Zone Module.</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image20.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
                      <ol className={classes.numberList} start={'2'}>
                        <li>
                          Add mandatory fields:
                          <ol className={classes.listStyle}>
                            <li>Zone Name</li>
                            <li>Supervisor</li>
                            <li>Sites (select from dropdown)</li>
                          </ol>
                        </li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image27.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I update a site’s Zone?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <ol className={classes.numberList}>
                        <li> Click on edit Zone on the Zone details page</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image38.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
                      <ol className={classes.numberList} start={'2'}>
                        <li>Click on “Change” icon</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image15.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
                      <ol className={classes.numberList} start={'3'}>
                        <li>Select new Zone from dropdown</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image19.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
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
                        How are sites added to Edge 2.0?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          When contracts made in SET are published, the Sites are synced in Edge
                          2.0.
                        </Typography>
                      </Box>
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I make a Site functional?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          A site can be made functional when the following details are added.
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Zone (site must exist within zone)</li>
                        <li>Site Boundary</li>
                        <li>Supervisor</li>
                        <li>Primary contact email</li>
                        <li>Site Image</li>
                        <li>Active Contract</li>
                      </ol>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          When all contracts against a Site are expired or terminated, the Site is
                          marked as non-functional.
                        </Typography>
                      </Box>
                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image55.png'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                      />
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        When Site marked as Non-functional?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          If all contracts against a Site are expired or terminated, the Site is
                          marked as non-functional. An email is sent to notify the supervisor when
                          any site becomes non-functional.
                        </Typography>
                      </Box>
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        What are the different statuses of a Site?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          A site has 3 statuses:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>
                          <b>Functional: </b>
                          There is an active contract and all site details are up to date.
                        </li>
                        <li>
                          <b>Requires Attention:</b> When site is added to OBX for the first time.
                        </li>
                        <li>
                          <b>Non-functional:</b> When all contracts in a site are expired or
                          terminated, or mandatory site details are not up to date.
                        </li>
                      </ol>
                      <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                        When a site becomes non-functional, then an email is sent to notify the
                        supervisor.
                      </Typography>
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        Where can I see all the contracts of a Site?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Contracts are created on SET and displayed in the “Contract” tab of the
                          Sites Module. A site can have multiple contracts. Contracts tab is visible
                          to Franchise Owner/Supervisor with the following information:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Contract name </li>
                        <li>Duration</li>
                        <li>Job type (dedicated/Patrol)</li>
                        <li>Start time of Job</li>
                        <li>End time of Job</li>
                        <li>Designation (dedicated/armed officer)</li>
                        <li>Duty days (M, T, W, T, F, S, S)</li>
                        <li>Officers count (required officers to perform that job)</li>
                        <li>Additional services (visitor/load)</li>
                      </ol>
                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image45.png'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                      />
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        What happens when a Site’s contract is Terminated?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          All future shifts are removed from the schedule and Officers are
                          unassigned. Franchise Owners and Supervisors will be informed via
                          Notifications. There will be no impact on past/ongoing shifts.
                        </Typography>
                      </Box>
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I add Site Instructions?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Instructions contain vital information and guidelines for navigating the
                          site. It is designed to assist officers and remember key points to keep in
                          mind while performing a duty. Instructions relating to a site will be
                          accessed by the officer in mobile application while performing the job.
                        </Typography>
                        <ol className={classes.numberList}>
                          <li>
                            Create Instructions:
                            <ol className={classNames(classes.listStyle)}>
                              <li className={classes.faqMt}>
                                When instructions are not added to a site yet, &apos;Add
                                instructions&apos; button will be shown.
                              </li>
                              <img
                                src={
                                  'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image34.png'
                                }
                                className={classNames(
                                  classes.faqAccordionAnswerImage,
                                  classes.faqMt,
                                )}
                              />
                              <li className={classes.faqMt}>Add instructions</li>
                              <img
                                src={
                                  'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image16.jpg'
                                }
                                className={classNames(
                                  classes.faqAccordionAnswerImage,
                                  classes.faqMt,
                                )}
                              />
                            </ol>
                          </li>
                        </ol>

                        <ol start={'2'} className={classes.numberList}>
                          <li>
                            Edit Instructions:
                            <ol className={classNames(classes.listStyle)}>
                              <li className={classes.faqMt}>
                                Instructions can be updated anytime by clicking on the &apos;Edit
                                &apos; button.
                              </li>
                              <img
                                src={
                                  'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image36.jpg'
                                }
                                className={classNames(
                                  classes.faqAccordionAnswerImage,
                                  classes.faqMt,
                                )}
                              />
                              <li className={classes.faqMt}>
                                Update content and click on &apos;Update Instruction &apos;
                              </li>
                              <img
                                src={
                                  'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image49.jpg'
                                }
                                className={classNames(
                                  classes.faqAccordionAnswerImage,
                                  classes.faqMt,
                                )}
                              />
                            </ol>
                          </li>
                        </ol>

                        <ol start={'3'} className={classes.numberList}>
                          <li>
                            Add Exceptions:
                            <ol className={classNames(classes.listStyle)}>
                              <li className={classes.faqMt}>
                                There can be certain exceptions to the instructions, for example if
                                a specific task/instruction is required to be taken care of on a
                                specific day. Once instructions are added, an &apos;Add
                                exception&apos; button will be shown:
                              </li>
                              <img
                                src={
                                  'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image22.jpg'
                                }
                                className={classNames(
                                  classes.faqAccordionAnswerImage,
                                  classes.faqMt,
                                )}
                              />
                            </ol>
                          </li>
                        </ol>

                        <ol start={'4'} className={classes.numberList}>
                          <li>
                            To add exceptions:
                            <ol className={classNames(classes.listStyle)}>
                              <li className={classes.faqMt}>
                                Click on &apos;Add Exception&apos;. Exceptional instruction editor
                                opens up. Add the exceptions, start and end date and click on
                                &apos;Add Exceptional Instructions&apos;:
                              </li>
                              <img
                                src={
                                  'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image11.jpg'
                                }
                                className={classNames(
                                  classes.faqAccordionAnswerImage,
                                  classes.faqMt,
                                )}
                              />
                              <li className={classes.faqMt}>
                                Exceptions can be seen on the main screen as follows:
                              </li>
                              <img
                                src={
                                  'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image18.jpg'
                                }
                                className={classNames(
                                  classes.faqAccordionAnswerImage,
                                  classes.faqMt,
                                )}
                              />
                            </ol>
                          </li>
                        </ol>

                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          <b>Note:</b>
                        </Typography>
                        <ol className={classes.numberList}>
                          <li>
                            Exceptions will be shown on the selected dates instead of instructions.
                          </li>
                          <li>Exceptions can be edited or deleted at any time.</li>
                        </ol>
                      </Box>
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I add Devices to a Site?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Devices are installed at certain points (checkpoints) on the sites so that
                          they can be scanned. Devices tab will show FO/Supervisor a list of all the
                          devices which have been configured for this site.
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                        Devices are configured from mobile because scanning is required to install a
                        device. All the devices configured within this site from mobile will appear
                        here.
                      </Typography>
                      <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                        There are three types of devices that can be configured at a checkpoint:
                      </Typography>
                      <ol className={classes.numberList}>
                        <li>NFC tag</li>
                        <li>Beacon</li>
                        <li>QR</li>
                      </ol>
                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image6.jpg'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                      />
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I add a Site Location?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Locations tab is a listing of all the locations that will be used for
                          creating checkpoints. Examples of location can be:
                        </Typography>
                        <ol className={classes.listStyle}>
                          <li>Front gate</li>
                          <li>Back gate</li>
                          <li>Ground floor lobby</li>
                          <li>First floor meeting room, etc.</li>
                        </ol>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Note that you can create a location from the web by just adding its name
                          while its pin location on the map is added from mobile.
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>
                          Click on the Location tab in the Site module and Click on Create Location.
                        </li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image25.jpg'
                          }
                          alt=""
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol start={'2'} className={classes.numberList}>
                        <li>Enter Location name and Click on Create</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image24.jpg'
                          }
                          alt=""
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        What is a Checkpoint?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          A checkpoint is a place where a device will be placed to be scanned during
                          a tour or a visit.
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                        Checkpoints are present on a location in a site. There are two types of
                        checkpoints:
                      </Typography>
                      <ol className={classes.numberList}>
                        <li>
                          <b>Device checkpoint:</b> Where any of the devices are installed
                          (NFC/Beacon/QR). An officer will find a device and scan the device to
                          cover the checkpoint.
                        </li>
                        <li>
                          <b>GPS checkpoint:</b> Officers will have to be in a 10-50m radius of the
                          checkpoint to cover it (GPS location).
                        </li>
                      </ol>
                      <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                        {' '}
                        Location and devices are prerequisites for creating a checkpoint.
                      </Typography>
                    </Box>
                  </FAQAccordion>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I add a Checkpoint?
                      </Typography>
                    }
                  >
                    <ol className={classNames(classes.numberList, classes.faqMt)}>
                      <li>Click on &apos;Create Checkpoint&apos; button in the Checkpoint tab</li>
                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image47.jpg'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMt)}
                      />
                    </ol>

                    <ol start={'2'} className={classes.numberList}>
                      <li>
                        Click on the Location tab in the Site module and Click on Create Location.
                        <ol className={classes.listStyle}>
                          <li className={classes.faqMt}>
                            If Checkpoint type is device, then another dropdown will be populated,
                            where Device type needs to be selected
                          </li>
                          <img
                            src={
                              'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image25.jpg'
                            }
                            alt=""
                            className={classNames(
                              classes.faqAccordionAnswerImage,
                              classes.listImage,
                            )}
                          />
                          <li className={classes.faqMt}>
                            If Checkpoint type is GPS, then no device type needs to be selected
                          </li>
                          <img
                            src={
                              'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image3.jpg'
                            }
                            alt=""
                            className={classNames(
                              classes.faqAccordionAnswerImage,
                              classes.listImage,
                            )}
                          />
                        </ol>
                      </li>
                    </ol>

                    <ol start={'3'} className={classes.numberList}>
                      <li>Select Location</li>
                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image1.jpg'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMt)}
                      />
                    </ol>
                  </FAQAccordion>
                </Box>
              </>
            </CustomTabPanel>

            <CustomTabPanel value={value} index={3}>
              <>
                <Box className={classes.faqAccordion}>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How are jobs shown once a contract is published?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <ol className={classes.numberList}>
                        <li> Jobs added in a contract are reflected in:</li>
                        <ol className={classes.listStyle}>
                          <li>
                            Schedule
                            <ol className={classes.romanStyle}>
                              <li> Schedule</li>
                              <img
                                src={
                                  'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image7.png'
                                }
                                className={classNames(
                                  classes.faqAccordionAnswerImage,
                                  classes.listImage,
                                )}
                              />
                            </ol>
                            <ol start={'2'} className={classes.romanStyle}>
                              <li> Sites → Schedule</li>
                              <img
                                src={
                                  'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image48.png'
                                }
                                className={classNames(
                                  classes.faqAccordionAnswerImage,
                                  classes.listImage,
                                )}
                              />
                            </ol>
                          </li>
                          <li>
                            Jobs listing on the site module
                            <img
                              src={
                                'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image56.png'
                              }
                              className={classNames(
                                classes.faqAccordionAnswerImage,
                                classes.listImage,
                              )}
                            />
                          </li>
                        </ol>
                      </ol>

                      <ol start={'2'} className={classes.numberList}>
                        <li>
                          In the Schedule, unassigned shifts are highlighted in &apos;Red&apos; on
                          the calendar indicating &apos;Requires Attention&apos;
                          <img
                            src={
                              'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image2.png'
                            }
                            className={classNames(
                              classes.faqAccordionAnswerImage,
                              classes.listImage,
                            )}
                          />
                        </li>
                      </ol>

                      <ol start={'3'} className={classes.numberList}>
                        <li>
                          The legend highlights the shift type which includba e Dedicated, Patrol
                          and Extra Job
                          <img
                            src={
                              'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image23.png'
                            }
                            className={classNames(
                              classes.faqAccordionAnswerImage,
                              classes.listImage,
                            )}
                          />
                        </li>
                      </ol>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I update a site’s Zone?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <ol className={classes.numberList}>
                        <li>
                          Click on Shift with status, “Requires Attention”
                          <img
                            src={
                              'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image52.png'
                            }
                            className={classNames(
                              classes.faqAccordionAnswerImage,
                              classes.listImage,
                            )}
                          />
                        </li>
                      </ol>

                      <ol start={'2'} className={classes.numberList}>
                        <li>
                          Click on Shift with status, “Requires Attention”
                          <img
                            src={
                              'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image26.png'
                            }
                            className={classNames(
                              classes.faqAccordionAnswerImage,
                              classes.listImage,
                            )}
                          />
                        </li>
                      </ol>

                      <ol start={'3'} className={classes.numberList}>
                        <li>
                          Select Officer
                          <ol className={classes.listStyle}>
                            <li>Select available officers</li>
                            <li>The list will show both available and unavailable officers</li>

                            <img
                              src={
                                'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image8.png'
                              }
                              className={classNames(
                                classes.faqAccordionAnswerImage,
                                classes.listImage,
                              )}
                            />
                          </ol>
                        </li>
                      </ol>

                      <ol start={'4'} className={classes.numberList}>
                        <li>
                          Select duration for both officer and location.
                          <ol className={classes.listStyle}>
                            <li>
                              The date range selected must be within the date range defined for the
                              main shift
                            </li>
                            <li>Officer assignment cannot be done for past shifts.</li>

                            <img
                              src={
                                'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image30.png'
                              }
                              className={classNames(
                                classes.faqAccordionAnswerImage,
                                classes.listImage,
                              )}
                            />
                          </ol>
                        </li>
                      </ol>

                      <ol start={'5'} className={classes.numberList}>
                        <li>
                          Hourly rate
                          <ol className={classes.listStyle}>
                            <li>If the hourly rate for this officer’s shift needs to be updated</li>

                            <img
                              src={
                                'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image-hourly.png'
                              }
                              className={classNames(
                                classes.faqAccordionAnswerImage,
                                classes.listImage,
                              )}
                            />
                          </ol>
                        </li>
                      </ol>

                      <ol start={'6'} className={classes.numberList}>
                        <li>
                          Tours
                          <ol className={classes.listStyle}>
                            <li>Select a Tour Template or create a Tour Template on the spot</li>

                            <img
                              src={
                                'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image53.png'
                              }
                              className={classNames(
                                classes.faqAccordionAnswerImage,
                                classes.listImage,
                                classes.faqMb,
                              )}
                            />

                            <li>Add occurrences, if occurrences are more than 1 (optional)</li>

                            <img
                              src={
                                'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image17.png'
                              }
                              className={classNames(
                                classes.faqAccordionAnswerImage,
                                classes.listImage,
                              )}
                            />
                          </ol>
                        </li>
                      </ol>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        What is tour template?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Tour template is used to define the structure of tour so which can be
                          reuse in different tours within that site.
                        </Typography>
                      </Box>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I create a Tour Template?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Tour templates can be created when Assigning shifts. To create a tour
                          template, the following details are added:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Tour template name</li>
                        <li>
                          Assign Checkpoints
                          <ol className={classes.noListStyle}>
                            <li>- Multiple checkpoints can be added</li>
                          </ol>
                        </li>
                        <li>
                          Assign Report
                          <ol className={classes.noListStyle}>
                            <li>
                              - Select report template that needs to be completed for this tour
                            </li>
                          </ol>
                        </li>
                        <li>
                          Start time
                          <ol className={classes.noListStyle}>
                            <li>- When the tour needs to start</li>
                          </ol>
                        </li>
                        <li>
                          Duration
                          <ol className={classes.noListStyle}>
                            <li>- Duration within which the tour must be completed</li>
                          </ol>
                        </li>
                      </ol>

                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image51.png'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                      />
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        When do shifts need to be split?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Shifts can be split for primarily two reasons:
                        </Typography>
                      </Box>

                      <ol className={classes.listStyle}>
                        <li>Multiple officers are required for the shift</li>
                        <li>The shift duration needs to comply with State regulations</li>
                        <li>Shift duration is 24 hours</li>
                      </ol>

                      <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                        To split a shift:
                      </Typography>

                      <ol className={classes.numberList}>
                        <li>Site Module → “Job” Tab</li>
                        <li>Select shift and select the “Split” icon</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image34-a.png'
                          }
                          className={classNames(
                            classes.faqAccordionAnswerImage,
                            classes.listImage,
                            classes.faqMt,
                          )}
                        />
                      </ol>

                      <ol start={'3'} className={classes.numberList}>
                        <li>
                          The default shift option shows optimized shift splitting based on the
                          default shift hours
                          <img
                            src={
                              'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image54.png'
                            }
                            className={classNames(
                              classes.faqAccordionAnswerImage,
                              classes.listImage,
                              classes.faqMt,
                            )}
                          />
                        </li>
                      </ol>

                      <ol start={'4'} className={classes.numberList}>
                        <li>
                          The user can also select the “Custom” option
                          <ol className={classes.listStyle}>
                            <li>
                              When splitting shifts, the number of hours should be equal to the
                              total hours defined
                            </li>
                            <li>
                              In a shift, the number of days selected must be similar to the shift
                              time duration and shift days defined.
                            </li>
                          </ol>
                          <img
                            src={
                              'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image29.png'
                            }
                            className={classNames(
                              classes.faqAccordionAnswerImage,
                              classes.listImage,
                            )}
                          />
                        </li>
                      </ol>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How to reassign the ongoing job to different officer?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          For an ongoing shift, the officer can be reassigned due to any reason.
                          Changes implemented will be for the current shift only.
                        </Typography>
                      </Box>

                      <ol className={classes.numberList}>
                        <li>Click on Shift re-assignment</li>

                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image29.png'
                          }
                          className={classNames(
                            classes.faqAccordionAnswerImage,
                            classes.listImage,
                            classes.faqMt,
                          )}
                        />
                      </ol>

                      <ol start={'2'} className={classes.numberList}>
                        <li>
                          Select available officer
                          <img
                            src={
                              'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image20-a.png'
                            }
                            className={classNames(
                              classes.faqAccordionAnswerImage,
                              classes.listImage,
                              classes.faqMt,
                            )}
                          />
                        </li>
                      </ol>

                      <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                        For an ongoing shift, the officer can be reassigned due to any reason.
                        Changes implemented will be for the current shift only.
                      </Typography>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        What is an extra job and how can I create it?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Extra jobs are jobs created that are created on need basis. Extra jobs are
                          created via the Schedule. To create an extra job:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Click on “Create Extra Job” in the Schedule</li>
                        <li>
                          Select Site and Contract
                          <ol className={classes.noListStyle}>
                            <li>
                              - In rare cases, an extra job can be created against expired contracts
                            </li>
                          </ol>
                        </li>
                        <li>
                          Job duration is selected
                          <ol className={classes.noListStyle}>
                            <li>- An extra job cannot be more than 7 days</li>
                            <li>
                              - Based on the Job duration, the number of days will be displayed
                            </li>
                            <li>
                              - The specific days need to be selected for when the Extra Job is
                              required. For example, if an Extra Job is needed for 7 days, then all
                              7 days need to be selected.
                            </li>
                          </ol>
                        </li>
                        <li>
                          Select Officer Type
                          <ol className={classes.noListStyle}>
                            <li>- Only one officer type can be selected</li>
                          </ol>
                        </li>
                        <li>
                          Duration
                          <ol className={classes.noListStyle}>
                            <li>- Duration within which the tour must be completed</li>
                          </ol>
                        </li>
                        <li>
                          Start time
                          <ol className={classes.noListStyle}>
                            <li>- Start time of the Extra Job</li>
                          </ol>
                        </li>
                        <li>
                          End time
                          <ol className={classes.noListStyle}>
                            <li>- End time of the Extra Job</li>
                          </ol>
                        </li>
                        <li>
                          Officer hourly rate
                          <ol className={classes.noListStyle}>
                            <li>
                              - The officer hourly rate must be within the range defined for the
                              franchise
                            </li>
                            <li>
                              - This rate is defined in Settings → Service Rates → Operational
                              Services → Extra Job
                            </li>
                          </ol>
                        </li>
                      </ol>

                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image44-extra.png'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                      />
                    </Box>
                  </FAQAccordion>
                </Box>
              </>
            </CustomTabPanel>

            <CustomTabPanel value={value} index={4}>
              <>
                <Box className={classes.faqAccordion}>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        What are the different types of reports?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          There are 5 types of reports:
                        </Typography>
                        <ol className={classes.numberList}>
                          <li>Equipment Inspection</li>
                          <li>Vehicle Inspection</li>
                          <li>Tour Reports</li>
                          <li>Shift Day End Report</li>
                          <li>Incident Report</li>
                        </ol>
                      </Box>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I create a template for a report?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <ol className={classes.numberList}>
                          <li>Click on “Report Template” tab in Settings</li>
                          <img
                            src={
                              'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image15-report-a.png'
                            }
                            alt=""
                            className={classNames(
                              classes.faqAccordionAnswerImage,
                              classes.listImage,
                              classes.faqMb,
                            )}
                          />
                          <li>
                            Add Report Title
                            <ol className={classes.listStyle}>
                              <li>For example, Equipment Inspection Report</li>
                            </ol>
                          </li>
                          <li>Select Report Type</li>
                          <li>
                            Add Section Title
                            <ol className={classes.listStyle}>
                              <li>For example Safety Protocols and Features</li>
                              <li>Add explanatory description for the section title (optional)</li>
                            </ol>
                          </li>
                          <li>
                            Add questions in a section
                            <ol className={classes.listStyle}>
                              <li>
                                For example, Is the emergency shut off mechanism working correctly?
                              </li>
                              <li>Add explanatory description (optional)</li>
                              <li>Select answer type</li>
                              <li>Mark question as mandatory or optional</li>
                            </ol>
                          </li>
                          <img
                            src={
                              'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image53-report-a.png'
                            }
                            alt=""
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
                        What are shift reports?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          In the Shift Reports module, Shift reports will be reviewed by Supervisor
                          or Franchise Owner. The following reports will be shown in this module for
                          review:
                        </Typography>
                        <ol className={classes.numberList}>
                          <li>Equipment Inspection</li>
                          <li>Vehicle Inspection</li>
                          <li>Tour Reports</li>
                          <li>Shift Day End Report</li>
                          <li>Incident Report</li>

                          <img
                            src={
                              'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image12-report-a.png'
                            }
                            alt=""
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
                        How can I see officer payroll?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          The officer payroll can be seen in the Shift Reports tab. To view the csv
                          file:
                        </Typography>
                        <ol className={classes.numberList}>
                          <li>Click on “Download Officer Payroll”</li>
                          <img
                            src={
                              'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image38-report-a.png'
                            }
                            alt=""
                            className={classNames(
                              classes.faqAccordionAnswerImage,
                              classes.listImage,
                              classes.faqMb,
                            )}
                          />
                          <li>Select date range</li>
                          <li>Click on “Download CSV”</li>
                          <img
                            src={
                              'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image10-reprot-a.png'
                            }
                            alt=""
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
                        Are there any reports that are sent to Clients?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Reports are sent daily to the
                        </Typography>
                        <ol className={classes.numberList}>
                          <li>Checkpoint Summary Report</li>
                          <li>Daily Site Report</li>
                        </ol>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Both reports can be accessed via the Schedule Module
                        </Typography>
                      </Box>
                    </Box>
                  </FAQAccordion>
                </Box>
              </>
            </CustomTabPanel>

            <CustomTabPanel value={value} index={5}>
              <>
                <Box className={classes.faqAccordion}>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I configure Visitor Types ?{' '}
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          There are 5 types of reports:
                        </Typography>
                        <ol className={classes.numberList}>
                          <li>
                            Settings {'>'} Preferences {'>'} Visitor Type {'>'} Add Visitor Type
                          </li>
                          <img
                            src={
                              'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image43-visitors-a.png'
                            }
                            alt=""
                            className={classNames(
                              classes.faqAccordionAnswerImage,
                              classes.listImage,
                              classes.faqMb,
                            )}
                          />
                          <li>Enter Visitor Type name (e.g. Tutor)</li>
                          <li>Select associated sites where this visitor type will be used</li>
                          <li>
                            Select and enable input fields required for questions that are required
                            when a visitor is added
                          </li>
                          <img
                            src={
                              'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image60-visitors-a.png'
                            }
                            alt=""
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
                        How can I add a Visitor?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Visitors can be added by supervisors and officers from the mobile app.
                          Visitors against a Site are shown in the Visitors tab in the Sites module.
                        </Typography>
                      </Box>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I ban a visitor?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Supervisors and Franchise Officers can ban visitors. To ban a visitor:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Click on “Add banned visitor” in the Visit Module</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image23-visitors-a.png'
                          }
                          alt=""
                          className={classNames(
                            classes.faqAccordionAnswerImage,
                            classes.listImage,
                            classes.faqMb,
                          )}
                        />
                        <li>
                          Add mandatory fields; Phone number, Full name, and Reason for banning
                          visitor
                        </li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image36-visitors-a.png'
                          }
                          alt=""
                          className={classNames(
                            classes.faqAccordionAnswerImage,
                            classes.listImage,
                            classes.faqMb,
                          )}
                        />
                        <li>
                          See the image below that shows how to ban a visitor who is already added
                          to the system
                        </li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image42-visitors-a.png'
                          }
                          alt=""
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                        A ban can be removed on visitors added.
                      </Typography>
                    </Box>
                  </FAQAccordion>
                </Box>
              </>
            </CustomTabPanel>

            <CustomTabPanel value={value} index={6}>
              <>
                <Box className={classes.faqAccordion}>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I configure Load Types?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          There are 5 types of reports:
                        </Typography>
                        <ol className={classes.numberList}>
                          <li>
                            Settings {'>'} Preferences {'>'} Load Type {'>'} Add Load Type
                          </li>

                          <li>Enter Load Type name (e.g. Food Container)</li>
                          <li>Select associated sites where this load type will be used</li>
                          <li>
                            Select and enable input fields required for questions that are required
                            when a Loader is added
                          </li>
                        </ol>
                      </Box>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I add a Loader?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Vehicles can be added by supervisors and officers from the mobile app.
                          Loaders against a Site are shown in the Load tab in the Sites module.
                        </Typography>
                      </Box>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I ban a Vehicle?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Supervisors and Franchise Officers can ban Loaders. To ban:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Click on “Add banned Loader” in the Load Module</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image40-loads-a.png'
                          }
                          alt=""
                          className={classNames(
                            classes.faqAccordionAnswerImage,
                            classes.listImage,
                            classes.faqMb,
                          )}
                        />
                        <li>
                          Add mandatory fields; Vehicle Identification Number, Driver Name and
                          Reason for banning loader. Attachments are optional
                        </li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image4-loads-a.png'
                          }
                          alt=""
                          className={classNames(
                            classes.faqAccordionAnswerImage,
                            classes.listImage,
                            classes.faqMb,
                          )}
                        />
                        <li>
                          See image below that shows how to ban a loader that is already added in
                          the system
                        </li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image13-loads-a.png'
                          }
                          alt=""
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                        A ban can be removed on loaders added.
                      </Typography>
                    </Box>
                  </FAQAccordion>
                </Box>
              </>
            </CustomTabPanel>

            <CustomTabPanel value={value} index={7}>
              <>
                <Box className={classes.faqAccordion}>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How to apply for Time off?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Supervisors can apply for time off:
                        </Typography>
                        <ol className={classes.numberList}>
                          <li>Click on “Apply Time Off” from the Time Off Requests module</li>
                          <img
                            src={
                              'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image46-tor-a.png'
                            }
                            alt=""
                            className={classNames(
                              classes.faqAccordionAnswerImage,
                              classes.listImage,
                              classes.faqMb,
                            )}
                          />
                          <li>Enter Time off Duration and Reason</li>
                          <img
                            src={
                              'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image47-tor-a.png'
                            }
                            alt=""
                            className={classNames(
                              classes.faqAccordionAnswerImage,
                              classes.listImage,
                              classes.faqMb,
                            )}
                          />
                        </ol>
                      </Box>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        Who can approve Time off?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Franchise Owners can approve time off for officers and supervisors in
                          their franchise.
                        </Typography>
                        <ol className={classes.numberList}>
                          <li>Click Time off Module</li>
                          <li>Select time off request</li>
                          <li>Click on approve or reject button</li>
                          <img
                            src={
                              'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image9-tor.png'
                            }
                            alt=""
                            className={classNames(
                              classes.faqAccordionAnswerImage,
                              classes.listImage,
                              classes.faqMb,
                            )}
                          />
                        </ol>
                      </Box>
                    </Box>
                  </FAQAccordion>
                </Box>
              </>
            </CustomTabPanel>

            <CustomTabPanel value={value} index={8}>
              <>
                <Box className={classes.faqAccordion}>
                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I see the attendance of officers and supervisors
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Attendance for officers is based on shifts, whereas, attendance for
                          supervisors is logged for the day. Attendance can be seen:
                        </Typography>
                        <ol className={classes.numberList}>
                          <li>
                            At site level
                            <ol className={classes.listStyle}>
                              <li>This shows attendance against shifts for a site</li>
                              <img
                                src={
                                  'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image45-users-a.png'
                                }
                                alt=""
                                className={classNames(
                                  classes.faqAccordionAnswerImage,
                                  classes.listImage,
                                )}
                              />
                            </ol>
                          </li>
                          <li>
                            User level
                            <ol className={classes.listStyle}>
                              <li>
                                Attendance for officer or supervisor is shown in the Users Module
                              </li>
                              <img
                                src={
                                  'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image35-a.png'
                                }
                                alt=""
                                className={classNames(
                                  classes.faqAccordionAnswerImage,
                                  classes.listImage,
                                )}
                              />
                            </ol>
                          </li>
                        </ol>
                      </Box>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        What are the Attendance statuses?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          There are 3 statuses regarding attendance:
                        </Typography>
                      </Box>

                      <ol className={classes.numberList}>
                        <li>
                          <b>Present:</b> When the officer/supervisor has clocked in
                        </li>
                        <li>
                          <b>Absent:</b> When the officer did not clock in for the assigned shift OR
                          when the supervisor did not clock in
                        </li>
                        <li>
                          <b>Time off:</b> When the officer/supervisor is on time off
                        </li>
                      </ol>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can I define Officer and Supervisor’s availability hours?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Franchise Owners can define the officer and supervisor’s availability. All
                          Officers and Supervisors will have this schedule by default. Changes that
                          can be made to the availability will override the default availability
                          schedule. This can be done by:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Clicking on the Settings {'>'} Availability Tab</li>

                        <li>Define working hours for each day. “None” option indicates Day Off</li>

                        <li>
                          The “Reset Availability” button will reset the duration to 24 hours, from
                          12am to 12am each day for a specific user.
                        </li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqWebImages/image49-a.png'
                          }
                          alt=""
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
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
