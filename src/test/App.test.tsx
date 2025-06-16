import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

// Mock the charts to avoid canvas issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: () => <div data-testid="bar-chart" />,
  LineChart: () => <div data-testid="line-chart" />,
  PieChart: () => <div data-testid="pie-chart" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  Bar: () => <div data-testid="bar" />,
  Line: () => <div data-testid="line" />,
  Cell: () => <div data-testid="cell" />,
}))

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    })),
  },
  getDashboardSummary: vi.fn().mockResolvedValue({}),
  getLocationDistribution: vi.fn().mockResolvedValue([]),
  getProductCategoriesSummary: vi.fn().mockResolvedValue([]),
  getBrandPerformance: vi.fn().mockResolvedValue([]),
  getHourlyTrends: vi.fn().mockResolvedValue([]),
  getDailyTrends: vi.fn().mockResolvedValue([]),
  getAgeDistribution: vi.fn().mockResolvedValue([]),
  getGenderDistribution: vi.fn().mockResolvedValue([]),
}))

function AppWrapper() {
  return (
    <MemoryRouter>
      <App />
    </MemoryRouter>
  )
}

describe('App', () => {
  it('renders without crashing', () => {
    render(<AppWrapper />)
    expect(screen.getByText('Scout Analytics')).toBeInTheDocument()
  })

  it('displays navigation menu', () => {
    render(<AppWrapper />)
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Transaction Trends')).toBeInTheDocument()
    expect(screen.getByText('Product Mix')).toBeInTheDocument()
    expect(screen.getByText('Consumer Insights')).toBeInTheDocument()
  })

  it('has accessible navigation', () => {
    render(<AppWrapper />)
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })
})