import React, { useState, useEffect, useMemo } from 'react';
import {
  ColorSwatch,
  Input,
  Flex,
  Title,
  Box,
  Skeleton,
  Text,
  Badge,
  ActionIcon,
} from '@mantine/core';
import { useDebounceValue } from 'usehooks-ts';
import { FaHockeyPuck, FaBasketballBall, FaFootballBall } from 'react-icons/fa';
import { CiBaseball } from 'react-icons/ci';
import { PiBoxingGloveFill } from 'react-icons/pi';
import { MdOutlineRemove } from 'react-icons/md';
import { CellContext } from '@tanstack/react-table';
import { matchSorter } from 'match-sorter';

import { Table, createColumnHelper } from './components/Table';

type Arbitrage = {
  market: string;
  is_live: boolean;
  game_id: string;
  sport: string;
  league: string;
  home_team: string;
  away_team: string;
  start_date: string;
  best_price_home_name: string;
  best_price_home_odd: number;
  best_price_home_odd_books: string[];
  best_price_away_name: string;
  best_price_away_odd: number;
  best_price_away_odd_books: string[];
  oddsjam_price_home_odd: number | null;
  oddsjam_price_away_odd: number | null;
  type: string;
  arb_percent: number;
  bet_placed: boolean;
  should_blur_text: boolean;
};

type ArbitrageData = {
  arbitrage_data: Arbitrage[];
  live_total: number;
  prematch_total: number;
  total: number;
};

const sportsMapping: Record<string, React.ReactElement> = {
  hockey: <FaHockeyPuck size="2em" title="Hockey" color="#5d5b5c" />,
  baseball: <CiBaseball size="2em" title="Baseball" />,
  basketball: <FaBasketballBall size="2em" title="Basketball" color="#e54e09" />,
  football: <FaFootballBall size="2em" title="Football" color="#651410" />,
  boxing: <PiBoxingGloveFill size="2em" title="Boxing" color="#dc0807" />,
};

const columnHelper = createColumnHelper<Arbitrage>();

export const Arbitrages = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [arbs, setArbs] = useState<ArbitrageData | null>(null);
  const [removed, setRemoved] = useState<Arbitrage[]>([]);
  const [search, setSearch] = useDebounceValue('', 500);
  const filteredData = useMemo(() => {
    let filtered = arbs?.arbitrage_data.filter((arb) => !removed.includes(arb)) || [];

    if (search !== '') {
      filtered = matchSorter(filtered, search, {
        keys: ['market', 'home_team', 'away_team', 'league'],
      });
    }

    return {
      ...arbs,
      arbitrage_data: filtered || [],
      total: filtered?.length || 0,
      live_total: filtered?.filter((arb) => arb.is_live).length || 0,
      prematch_total: filtered?.filter((arb) => !arb.is_live).length || 0,
    };
  }, [arbs, removed, search]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('sport', {
        cell: (info) => {
          const sport = info.getValue().toLowerCase();
          return sportsMapping[sport];
        },
        header: () => 'Sport',
      }),
      columnHelper.accessor('league', {
        cell: (info) => info.getValue(),
        header: () => 'League',
      }),
      columnHelper.accessor('market', {
        cell: (info) => info.getValue(),
        header: () => 'Market',
      }),
      columnHelper.accessor('home_team', {
        cell: (info) => (
          <Flex direction="column">
            <Box>{info.getValue()}</Box>
            <Text c={info.row.original.best_price_home_odd < 0 ? 'red' : 'green'}>
              {info.row.original.best_price_home_odd}
            </Text>
            <Flex wrap="wrap" gap={3}>
              {info.row.original.best_price_home_odd_books.map((book) => (
                <Badge key={book}>{book}</Badge>
              ))}
            </Flex>
          </Flex>
        ),
        header: () => 'Home Team',
      }),
      columnHelper.accessor('away_team', {
        cell: (info) => (
          <Flex direction="column">
            <Box>{info.getValue()}</Box>
            <Text c={info.row.original.best_price_away_odd < 0 ? 'red' : 'green'}>
              {info.row.original.best_price_away_odd}
            </Text>
            <Flex wrap="wrap" gap={3}>
              {info.row.original.best_price_away_odd_books.map((book) => (
                <Badge key={book}>{book}</Badge>
              ))}
            </Flex>
          </Flex>
        ),
        header: () => 'Away Team',
      }),
      columnHelper.accessor('is_live', {
        cell: (info) => <ColorSwatch size="15" color={info.getValue() ? 'green' : 'red'} />,
        header: () => 'Live',
      }),
      {
        id: 'delete_row',
        cell: (info: CellContext<Arbitrage, boolean>) => (
          <ActionIcon
            variant="outline"
            color="red"
            aria-label="Remove row"
            onClick={() => {
              setRemoved((old) => [...old, info.row.original]);
            }}
          >
            <MdOutlineRemove />
          </ActionIcon>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    const fetchArbs = async () => {
      const response = await fetch('/arbs.json');
      const data = await response.json();
      setArbs(data);
      setIsLoading(false);
    };

    fetchArbs();
  }, []);

  return (
    <Box>
      <Title order={1}>Arbitrages</Title>
      <Flex direction="row" justify="space-between" my="md" align="center">
        <Box>
          <Input
            placeholder="Search..."
            onChange={(e) => {
              setSearch(e.currentTarget.value);
            }}
          />
        </Box>
        <Flex align="center">
          <Skeleton visible={isLoading}>
            <strong>Total:</strong> {filteredData?.total} - <strong>Live:</strong>{' '}
            {filteredData?.live_total}
          </Skeleton>
        </Flex>
      </Flex>
      {!isLoading ? (
        <Table<Arbitrage> data={filteredData.arbitrage_data} columns={columns} />
      ) : (
        <Skeleton height={50} />
      )}
    </Box>
  );
};
