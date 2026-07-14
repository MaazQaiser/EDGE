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

import { useStyles } from './faqMobile.styles';

const FAQMobile = () => {
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
              <Tab label="Dedicated Duty Execution" {...a11yProps(0)} />
              <Tab label="Emergencies" {...a11yProps(1)} />
              {/* <Tab label="Route Creation" {...a11yProps(2)} /> */}
              <Tab label="Attendance and Time Off" {...a11yProps(2)} />
              <Tab label="Supervisor" {...a11yProps(3)} />
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
                        How can officers see their schedules?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Officers can see their schedules on the Schedule Module that is accessible
                          via the bottom navigation bar. Shifts can be filtered on various
                          attributes like date, sites and status.
                        </Typography>
                      </Box>

                      <img
                        src={
                          'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image1.png'
                        }
                        className={classNames(classes.faqAccordionAnswerImage, classes.faqMb)}
                      />
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can officers execute shifts assigned to them?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <ol className={classes.numberList}>
                        <li>
                          Officers will be able to see their upcoming shift in the officer dashboard
                          as shown below.
                        </li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image18.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start={'2'}>
                        <li>
                          The Officer will Tap on “Start Shift” when Officer wants to clock in.
                        </li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image22.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start={'3'}>
                        <li>
                          After Starting a Shift, an Equipment Inspection report must be completed.
                        </li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image30.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />

                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image28.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start={'4'}>
                        <li>
                          After submitting the Equipment Inspection report, the timer for the shift
                          will start.
                        </li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image25.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
                      <ol className={classes.numberList} start={'5'}>
                        <li>
                          Tapping on Tours will show a list of all the Tours the Officer must
                          complete for that Shift.
                          <br />
                          Each tour shows the:
                          <ol className={classes.listStyle}>
                            <li>Number of checkpoints</li>
                            <li>Start time of the tour</li>
                            <li>A “Start Tour” button will be displayed on the upcoming tour. </li>
                          </ol>
                        </li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image31.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
                      <ol className={classes.numberList} start={'6'}>
                        <li>
                          Once a tour is started, it will show the count and a list of all the
                          checkpoints that need to be completed. The target time will indicate when
                          the tour should be completed. Officers can look at “Elapsed Time” to
                          monitor their own progress.
                        </li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image14.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start={'7'}>
                        <li>
                          Checkpoints will include tasks that need to be completed at certain site
                          locations. For example, the Officer must scan a QR Code to complete a
                          checkpoint.
                        </li>

                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image27.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image23.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />

                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image14.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start={'8'}>
                        <li>
                          Once all checkpoints have been completed, a tour report must be submitted.
                        </li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image24.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image13.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        When can an Officer clock out?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          An Officer should preferably clock out after their tours are completed.
                          <br /> To clock out:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Tap on the “clock” icon</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image12.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start={'2'}>
                        <li>Select “End Shift”</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image15.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start={'3'}>
                        <li>Confirm clock out</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image5.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start={'4'}>
                        <li>Complete shift end report</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image17.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start={'5'}>
                        <li>View Shift summary and tap to Clock out</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image7.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        Where can Officers see Site Instructions?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Site Instructions are important to review. These can be accessed by:
                        </Typography>
                      </Box>
                      <ol className={classes.numberList}>
                        <li>Taping on “Site Instructions” on the home page.</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image2.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start={'2'}>
                        <li>Site instructions will be shown as below.</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image20.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can Officers take a break during their shift?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <ol className={classes.numberList}>
                        <li>Tap on “clock” icon</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image12.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start={'2'}>
                        <li>Select Break option</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image3.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol className={classes.numberList} start={'3'}>
                        <li>Tap on resume shift once the break ends</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image8.png'
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
                        What can be done incase of a Panic Situation?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Incase of a panic situation:
                        </Typography>
                      </Box>

                      <ol className={classes.numberList}>
                        <li>Tap on the Panic button.</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image9.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol start={'2'} className={classes.numberList}>
                        <li>
                          The request can be immediately sent to the Supervisor by tapping on
                          “Notify Now”, otherwise it will be sent after a few seconds.
                        </li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image4.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol start={'3'} className={classes.numberList}>
                        <li>
                          Officers can reach out to their supervisor by tapping on the Phone Number
                          provided
                        </li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image14-a.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How can an Officer report an Incident?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Officers can report any incident at their site.
                          <br />
                          To report an incident:
                        </Typography>
                      </Box>

                      <ol className={classes.numberList}>
                        <li>Tap on the Report Incident.</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image29.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol start={'2'} className={classes.numberList}>
                        <li>Fill out the form</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image19.png'
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
                        How to check attendance?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          Attendance can be checked within the attendance module.
                        </Typography>
                      </Box>

                      <ol className={classes.numberList}>
                        <li>Tap on More → Attendance</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image6.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol start={'2'} className={classes.numberList}>
                        <li>
                          There are 3 statuses regarding attendance:
                          <ol className={classes.listStyle}>
                            <li>
                              <b>Present: </b>
                              When officer/supervisor has clocked in
                            </li>
                            <li>
                              <b>Absent:</b> When officer did not clock in of the assigned shift OR
                              when supervisor did not clock in on a particular day
                            </li>
                            <li>
                              <b>Time off:</b> When officer/supervisor is on approved time off
                            </li>
                          </ol>
                        </li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image10.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
                    </Box>
                  </FAQAccordion>

                  <FAQAccordion
                    header={
                      <Typography variant="subtitle2" className={classes.faqAccordionTitle}>
                        How to apply for time off?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <Box className={classes.faqAccordionAnswerBox}>
                        <Typography variant="subtitle1" className={classes.faqAccordionAnswerText}>
                          In the Attendance module:
                        </Typography>
                      </Box>

                      <ol className={classes.numberList}>
                        <li>Tap on Pending Time Off Requests</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image26.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol start={'2'} className={classes.numberList}>
                        <li>Tap on “Apply Time Off” button</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image11.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>

                      <ol start={'3'} className={classes.numberList}>
                        <li>Add time off duration and Reason</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image16.png'
                          }
                          className={classNames(classes.faqAccordionAnswerImage, classes.listImage)}
                        />
                      </ol>
                    </Box>
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
                        How can a supervisor switch to officer mode?
                      </Typography>
                    }
                  >
                    <Box className={classes.faqAccordionAnswer}>
                      <ol className={classes.numberList}>
                        <li>Tap on “More” and Swipe to change role</li>
                        <img
                          src={
                            'https://newuatsignalassets.blob.core.windows.net/faq/faqMobileImages/image21.png'
                          }
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

export default FAQMobile;

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
