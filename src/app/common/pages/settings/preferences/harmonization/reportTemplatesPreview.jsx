/**
 * DEMO — a still of the Report Templates screen, for the Settings preview route.
 *
 * The real screen (`homeOffice/pages/settings/templates`) paginates, searches and exports
 * against `getTemplates`, so it cannot render on a route with no session. This reproduces
 * what it looks like with data in it, so the preview shows a populated first tab instead of
 * a placeholder telling the reviewer what they are not seeing.
 *
 * Every colour is a brand token, so it follows the tenant the way the real screen does —
 * green on Filter Go — rather than the blue in the reference captures, which came from a
 * session whose theme had resolved to Signal.
 *
 * It is a still, deliberately: the controls are inert. Wiring search and pagination to fake
 * data would invite the reviewer to test behaviour that the real screen already owns.
 *
 * Delete with the rest of the preview scaffolding once the ACL is fixed.
 */
import {
  Box,
  Button,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import { ArrowDownIcon, DownloadCloudIcon, MoreVert, Search } from 'src/assets/svg';

const ROWS = [
  { name: 'Incident Report', createdOn: '2025-12-27', type: 'Incident Report' },
  { name: '🚗 Vehicle Inspection Report', createdOn: '2025-12-27', type: 'Vehicle Inspection' },
];

const COLUMNS = ['Report', 'Created On', 'Template Type'];

const ReportTemplatesPreview = () => (
  <Box sx={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <TextField
        placeholder="Search"
        sx={{ '& .MuiInputBase-root': { width: '244px', minWidth: '244px', height: '40px' } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />
      <Box sx={{ flex: 1 }} />
      <Button variant="secondary" startIcon={<DownloadCloudIcon />}>
        Export
      </Button>
      <Button variant="primary">+ Add Report Template</Button>
    </Box>

    <Table>
      <TableHead>
        <TableRow>
          {COLUMNS.map((column) => (
            <TableCell key={column}>
              <Typography variant="subtitle3">{column}</Typography>
            </TableCell>
          ))}
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.name}>
            <TableCell>
              <Typography variant="subtitle2">{row.name}</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">{row.createdOn}</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">{row.type}</Typography>
            </TableCell>
            <TableCell align="right">
              <MoreVert />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>

    {/* The page controls are drawn rather than driven: two rows of fixed data have no second
        page, and a working pager here would be behaviour the real screen already owns. They
        are present because the reviewer is checking the shape of the screen, and a table
        footer missing its controls reads as an unfinished design rather than a still. */}
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '24px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Typography variant="body2" sx={{ color: 'textSecondary2' }}>
          Rows per page:
        </Typography>
        <Typography variant="body2">10</Typography>
        <ArrowDownIcon />
      </Box>
      <Typography variant="body2">1–2 of 2</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {[0, 1].map((side) => (
          <Box
            key={side}
            sx={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: (theme) => `1px solid ${theme.palette.borderSubtle1}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: side === 0 ? 'rotate(90deg)' : 'rotate(-90deg)',
              opacity: 0.45,
            }}
          >
            <ArrowDownIcon />
          </Box>
        ))}
      </Box>
    </Box>
  </Box>
);

export default ReportTemplatesPreview;
