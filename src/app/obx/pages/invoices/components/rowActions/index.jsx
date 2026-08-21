import { Box, Button, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import { ReactComponent as MoreIcon } from 'assets/svg/more-vertical.svg?react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from './rowActions.styles';

/**
 * Row actions: the two everyone uses stay inline, the rest go behind `⋯`.
 *
 * Four persistent icon buttons needed 152px in a 95px cell, so the fourth rendered
 * outside the table card altogether. Capping the inline set is also the convention —
 * Stripe, Xero and QuickBooks all put row actions behind an overflow menu — and it
 * gives the destructive one a label instead of leaving it as an unnamed red glyph.
 *
 * Every action carries a `label`, which becomes the button's accessible name. Icon
 * buttons wrapped in a bare `Tooltip` announced as "button" to a screen reader,
 * because the tooltip's title landed on the wrapping span rather than the control.
 */
const MAX_INLINE = 2;

const RowActions = ({ actions }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState(null);

  const available = actions.filter(Boolean);
  const inline = available.filter((action) => action.primary).slice(0, MAX_INLINE);
  const overflow = available.filter((action) => !inline.includes(action));

  return (
    <Box className={classes.actions}>
      {inline.map((action) => (
        <Tooltip key={action.key} title={action.label} arrow placement="top">
          <span>
            <Button
              disableRipple
              aria-label={action.label}
              className={action.disabled ? classes.iconButtonMuted : classes.iconButton}
              variant="text"
              onClick={action.onClick}
              disabled={action.disabled}
              startIcon={action.icon}
            />
          </span>
        </Tooltip>
      ))}

      {overflow.length > 0 && (
        <>
          <Tooltip title={t('obx.invoice.actions.more')} arrow placement="top">
            <Button
              disableRipple
              aria-label={t('obx.invoice.actions.more')}
              className={classes.moreButton}
              variant="text"
              onClick={(event) => setAnchor(event.currentTarget)}
              startIcon={<MoreIcon />}
            />
          </Tooltip>
          <Menu
            open={!!anchor}
            anchorEl={anchor}
            onClose={() => setAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            className={classes.menu}
          >
            {overflow.map((action) => (
              <MenuItem
                key={action.key}
                disabled={action.disabled}
                className={action.destructive ? classes.destructive : ''}
                onClick={() => {
                  setAnchor(null);
                  action.onClick?.();
                }}
              >
                <ListItemIcon className={classes.menuIcon}>{action.icon}</ListItemIcon>
                <ListItemText>{action.label}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </Box>
  );
};

RowActions.propTypes = {
  actions: PropTypes.array,
};

RowActions.defaultProps = {
  actions: [],
};

export default RowActions;
