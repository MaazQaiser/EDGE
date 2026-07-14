import MuiAccordion from './muiAccordion';
import MuiButton from './muiButton';
import MuiCheckbox from './muiCheckbox';
import MuiChip from './muiChip';
import MuiInputLabel from './muiInputLabel';
import MuiList from './muiList';
import MuiMenuItem from './muiMenuItem';
import MuiLinearProgress from './muiProgressBar';
import MuiRadio from './muiRadio';
import MuiSelect from './muiSelect';
import MuiSkeleton from './muiSkeleton';
import MuiSwitch from './muiSwitch';
import MuiTableCell from './muiTableCell';
import MuiTextField from './muiTextField';
import MuiTooltip from './muiTooltip';
const overrides = ({ palette }) => ({
  MuiButton: MuiButton({ palette }),
  MuiTextField: MuiTextField({ palette }),
  MuiSwitch: MuiSwitch({ palette }),
  MuiRadio: MuiRadio({ palette }),
  MuiCheckbox: MuiCheckbox({ palette }),
  MuiInputLabel: MuiInputLabel({ palette }),
  MuiTableCell: MuiTableCell({ palette }),
  MuiChip: MuiChip({ palette }),
  MuiSelect: MuiSelect({ palette }),
  MuiMenuItem: MuiMenuItem({ palette }),
  MuiTooltip: MuiTooltip({ palette }),
  MuiAccordion: MuiAccordion({ palette }),
  MuiSkeleton: MuiSkeleton({ palette }),
  MuiList: MuiList([palette]),
  MuiLinearProgress: MuiLinearProgress({ palette }),
});

export default overrides;
