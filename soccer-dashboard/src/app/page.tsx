'use client';

import { useState } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { apolloClient } from '@/lib/apollo-client';
import { Award, Target, Users, TrendingUp, ChevronDown } from 'lucide-react';

// -----------------------------
// TypeScript types for GraphQL
// -----------------------------
interface SeasonStats {
  goals: number;
  assists: number;
  minutes: number;
  xG: number;
}

interface TopScorer {
  name: string;
  nation: string;
  seasonStats: SeasonStats;
}

interface DashboardData {
  competitions: string[];
  seasons: number[];
  topScorers: TopScorer[];
}

// -----------------------------
// GraphQL Query (now with variables)
// -----------------------------
const GET_DASHBOARD_DATA = gql`
  query GetDashboardData($competition: String!, $seasonEndYear: Int!) {
    competitions
    seasons
    topScorers(seasonEndYear: $seasonEndYear, competition: $competition, limit: 10) {
      name
      nation
      seasonStats(seasonEndYear: $seasonEndYear, competition: $competition) {
        goals
        assists
        minutes
        xG
      }
    }
  }
`;

// -----------------------------
// League configuration
// -----------------------------
const LEAGUES = [
  { name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: 'from-purple-600 to-pink-600' },
  { name: 'La Liga', country: 'Spain', flag: '🇪🇸', color: 'from-orange-600 to-red-600' },
  { name: 'Bundesliga', country: 'Germany', flag: '🇩🇪', color: 'from-red-600 to-yellow-600' },
  { name: 'Serie A', country: 'Italy', flag: '🇮🇹', color: 'from-green-600 to-blue-600' },
  { name: 'Ligue 1', country: 'France', flag: '🇫🇷', color: 'from-blue-600 to-indigo-600' },
];

const SEASONS = [2024, 2023, 2022, 2021, 2020, 2019, 2018];

// -----------------------------
// Dashboard content component
// -----------------------------
function DashboardContent() {
  const [selectedLeague, setSelectedLeague] = useState('Premier League');
  const [selectedSeason, setSelectedSeason] = useState(2024);
  const [isLeagueDropdownOpen, setIsLeagueDropdownOpen] = useState(false);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);

  const { loading, error, data } = useQuery<DashboardData>(GET_DASHBOARD_DATA, {
    variables: {
      competition: selectedLeague,
      seasonEndYear: selectedSeason,
    },
  });

  const currentLeague = LEAGUES.find((l) => l.name === selectedLeague) || LEAGUES[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading {selectedLeague} data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600 font-semibold">Error: {error.message}</p>
          <p className="text-sm text-red-500 mt-2">
            Make sure your GraphQL API is running on http://localhost:4000/graphql
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Soccer Analytics</h1>
                <p className="text-sm text-slate-400">
                  Powered by 7 years of European football data
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-medium">
                Live Data
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Competitions"
            value={data?.competitions.length ?? 0}
            subtitle="Major leagues"
            color="blue"
          />
          <StatCard
            icon={<Target className="w-6 h-6" />}
            title="Seasons"
            value={data?.seasons.length ?? 0}
            subtitle="Years of data"
            color="purple"
          />
          <StatCard
            icon={<Award className="w-6 h-6" />}
            title="Players"
            value="100K+"
            subtitle="Total records"
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Teams"
            value="500+"
            subtitle="Across leagues"
            color="orange"
          />
        </div>

        {/* League and Season Selectors */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* League Selector */}
          <div className="relative flex-1">
              <div className="flex space-x-2 overflow-x-auto pb-2 mb-6">
                {LEAGUES.map((league) => (
                  <button
                    key={league.name}
                    onClick={() => setSelectedLeague(league.name)}
                    className={`
                      px-4 py-2 rounded-lg whitespace-nowrap transition-all flex items-center space-x-2
                      ${
                        selectedLeague === league.name
                          ? `bg-gradient-to-r ${league.color} text-white`
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }
                    `}
                  >
                    <span>{league.flag}</span>
                    <span className="font-medium">{league.name}</span>
                  </button>
                ))}
              </div>
          </div>

          {/* Season Selector */}
          <div className="relative sm:w-48">
            <button
              onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
              className="w-full flex items-center justify-between px-6 py-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-slate-600 transition-all"
            >
              <div className="text-left">
                <p className="text-sm text-slate-400">Season</p>
                <p className="text-white font-semibold">{selectedSeason}</p>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 transition-transform ${
                  isSeasonDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isSeasonDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-50 max-h-64 overflow-y-auto">
                {SEASONS.map((season) => (
                  <button
                    key={season}
                    onClick={() => {
                      setSelectedSeason(season);
                      setIsSeasonDropdownOpen(false);
                    }}
                    className={`w-full px-6 py-3 text-left hover:bg-slate-700/50 transition-colors ${
                      selectedSeason === season ? 'bg-slate-700/50' : ''
                    }`}
                  >
                    <p className="text-white font-medium">{season}</p>
                    {selectedSeason === season && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">{season - 1}/{season}</span>
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Scorers Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className={`px-6 py-4 border-b border-slate-700 bg-gradient-to-r ${currentLeague.color}`}>
            <h2 className="text-xl font-bold text-white flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Top Scorers - {currentLeague.name} {selectedSeason}
            </h2>
          </div>
          <div className="overflow-x-auto">
            {data?.topScorers.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-slate-400 text-lg">
                  No data available for {selectedLeague} {selectedSeason}
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Try selecting a different season or league
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Nation
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Goals
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Assists
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                      xG
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Minutes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {data?.topScorers.map((player, index) => (
                    <tr
                      key={player.name}
                      className="hover:bg-slate-700/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span
                            className={`
                              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                              ${index === 0 ? 'bg-yellow-500 text-slate-900' : ''}
                              ${index === 1 ? 'bg-slate-400 text-slate-900' : ''}
                              ${index === 2 ? 'bg-orange-600 text-white' : ''}
                              ${index > 2 ? 'bg-slate-700 text-slate-300' : ''}
                            `}
                          >
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {player.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-400">{player.nation}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-lg font-bold text-green-400">
                          {player.seasonStats.goals}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-blue-400">
                          {player.seasonStats.assists}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-purple-400">
                          {player.seasonStats.xG.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-slate-400">
                          {player.seasonStats.minutes.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Stats Footer */}
        {data && data.topScorers.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Top Scorer</p>
              <p className="text-white font-bold text-lg mt-1">
                {data.topScorers[0]?.name}
              </p>
              <p className="text-green-400 text-2xl font-bold">
                {data.topScorers[0]?.seasonStats.goals} goals
              </p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Total Goals (Top 10)</p>
              <p className="text-green-400 text-2xl font-bold">
                {data.topScorers
                  .reduce((sum, player) => sum + player.seasonStats.goals, 0)}
              </p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Average xG (Top 10)</p>
              <p className="text-purple-400 text-2xl font-bold">
                {(
                  data.topScorers.reduce((sum, player) => sum + player.seasonStats.xG, 0) /
                  data.topScorers.length
                ).toFixed(1)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------------
// StatCard component
// -----------------------------
function StatCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-colors">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      <div className="mt-4">
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

// -----------------------------
// Home page component
// -----------------------------
export default function Home() {
  return (
    <ApolloProvider client={apolloClient}>
      <DashboardContent />
    </ApolloProvider>
  );
}