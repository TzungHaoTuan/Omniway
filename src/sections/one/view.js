'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import axios from 'src/utils/axios';

import { FIGURES_API } from 'src/config-global';

import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

export default function OneView() {
  const settings = useSettingsContext();

  const [financialData, setFinancialData] = useState(null);
  const [monthPeriod, setMonthPeriod] = useState({ from: '2021-07', to: '2023-12' });
  const [totalAmount, setTotalAmount] = useState();

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const accessToken = sessionStorage.getItem('accessToken');
        if (!accessToken) {
          return;
        }
        const headers = {
          Authorization: `Bearer ${accessToken}`,
        };
        const response = await axios.get(FIGURES_API, { headers });
        setFinancialData(response.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchFinancialData();
  }, []);

  useEffect(() => {
    if (!financialData) {
      return;
    }

    const getYearAndMonth = (monthPeriodString) => {
      const [year, month] = monthPeriodString.split('-').map(Number);
      return { year, month };
    };

    const { year: fromYear, month: fromMonth } = getYearAndMonth(monthPeriod.from);
    const { year: toYear, month: toMonth } = getYearAndMonth(monthPeriod.to);

    const amount = financialData
      .filter(
        (item) =>
          (item.attributes.yearPeriod > fromYear ||
            (item.attributes.yearPeriod === fromYear &&
              item.attributes.monthPeriod >= fromMonth)) &&
          (item.attributes.yearPeriod < toYear ||
            (item.attributes.yearPeriod === toYear && item.attributes.monthPeriod <= toMonth))
      )
      .reduce((sum, item) => sum + item.attributes.totalAmount, 0);

    setTotalAmount(amount);
  }, [financialData, monthPeriod.from, monthPeriod.to]);

  const handleMonthChange = (event) => {
    setMonthPeriod({ ...monthPeriod, [event.target.name]: event.target.value });
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4"> Page One </Typography>

      <Box
        sx={{
          mt: 5,
          width: 1,
          height: 320,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label
            htmlFor="monthFrom"
            style={{ display: 'flex', width: '160px', justifyContent: 'space-between' }}
          >
            From:
            <input
              type="month"
              id="monthFrom"
              name="from"
              min="2021-07"
              max="2023-12"
              value={monthPeriod.from}
              onChange={handleMonthChange}
            />
          </label>
          <label
            htmlFor="monthTo"
            style={{ display: 'flex', width: '160px', justifyContent: 'space-between' }}
          >
            To:
            <input
              type="month"
              id="monthTo"
              name="to"
              min="2021-07"
              max="2023-12"
              value={monthPeriod.to}
              onChange={handleMonthChange}
            />
          </label>
          <div>Total Amount: {totalAmount}</div>
        </div>
      </Box>
    </Container>
  );
}
