import filterGoLogoFull from 'src/assets/images/filterGoLogoFull.svg';
import signalLogoShort from 'src/assets/images/signalLogoShort.svg';
import signalLogoFull from 'src/assets/images/signlaLogoFull.svg';

import { FilterGoLoader } from './tenantLoaders/filterGoLoader';
import { SignalLoader } from './tenantLoaders/signalLoader';

/**
 * Which services a tenant sells. These drive the schedule tabs, overview
 * sections, legend indicators and footer stats — a service that is off shows
 * nowhere in the scheduler.
 *
 * They also act as the fallback when no tenantConfiguration is present, which
 * mergeTenantBranding relies on. Without them the schedule resolves to no tabs
 * and no grid sections and renders empty.
 */
const SIGNAL_SERVICES = {
  patrol: true,
  dedicated: true,
  dispatch: true,
  extra: true,
  runsheets: true,
};

/** Filter Go sells one service: filter replacement, which runs on the patrol model. */
const FILTER_GO_SERVICES = {
  patrol: true,
  dedicated: false,
  dispatch: false,
  extra: false,
  runsheets: true,
};

const signalInformation = {
  name: 'Signal',
  brandColor: '#146DFF',
  services: SIGNAL_SERVICES,
  logo: signalLogoFull,
  logoShort: signalLogoShort,
  images: {
    logo1: signalLogoFull,
    logoShort: signalLogoShort,
  },
  loader: SignalLoader,
  showFaq: true,
  sliderData: [
    {
      id: 1,
      imageUrl: 'https://signalassets.blob.core.windows.net/signal/assets/Mask-group.png',
      title: 'Take control of your sales team',
      desc: 'Gain complete control and visibility over your Sales Managers and interns within the web portal.',
    },
    {
      id: 2,
      imageUrl: 'https://signalassets.blob.core.windows.net/signal/assets/signal2-1.png',
      title: 'Manage tasks with efficiency',
      desc: 'Assign leads in bulk to the sales people who meet the necessary job requirements, and view their activity.',
    },
    {
      id: 3,
      imageUrl: 'https://signalassets.blob.core.windows.net/signal/assets/signal1-1.png',
      title: 'Real-time insights and analytics',
      desc: 'Real-time statistics, empowering you to identify status, optimize operations, and drive sales rationally.',
    },
  ],
};

export default {
  'filter-go.com': {
    name: 'Filter Go',
    brandColor: '#2DA551',
    services: FILTER_GO_SERVICES,
    /* Local SVG rather than the Azure-hosted PNG these used to point at. The nav
       renders `images.logo1` expanded and `logoShort` collapsed, so the wordmark was
       a remote raster request on every load — blurry on a 2× display, and blank
       whenever the demo runs without network. Its green is #2DA551, the same
       `brandColor` above, so the mark and the theme cannot drift. */
    logo: filterGoLogoFull,
    /* The same wordmark in the collapsed rail, on purpose. Filter Go's brand asset is
       a wordmark only — no monogram or icon exists — so both nav states show it and it
       just scales down. Signal's `logoShort` is a separate square glyph, which is why
       the rail's img is sized by max-width/max-height rather than a fixed width: the
       slot has to fit either aspect ratio (see sideBar.js `signalLogoShortIcon`). */
    logoShort: filterGoLogoFull,
    images: {
      logo1: filterGoLogoFull,
      logoShort: filterGoLogoFull,
    },
    loader: FilterGoLoader,
    showFaq: false,
    sliderData: [
      {
        id: 1,
        imageUrl: 'https://signalassets.blob.core.windows.net/filtergo/filter-go-slide1.png',
        title: 'Take control of your team',
        desc: 'Keep your team connected, organized, and productive on the go.',
      },
      {
        id: 2,
        imageUrl: 'https://signalassets.blob.core.windows.net/filtergo/filter-go-slide2.png',
        title: 'Take control of your team',
        desc: 'Gain complete control and visibility over your Sales Managers and interns within the web portal.',
      },
      {
        id: 3,
        imageUrl: 'https://signalassets.blob.core.windows.net/filtergo/filter-go-slide3.png',
        title: 'Manage tasks with efficiency',
        desc: 'Improve productivity with efficient task management and streamlined workflows.',
      },
    ],
  },
  'teamsignal.com': {
    ...signalInformation,
  },
  'teamsignal.au': {
    ...signalInformation,
  },
  'teamsignal.eu': {
    ...signalInformation,
  },
};
