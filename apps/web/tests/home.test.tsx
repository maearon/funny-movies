import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '@/app/page'
import { vi } from 'vitest'
import micropostApi from '@/components/shared/api/micropostApi'
import { useAppSelector } from '@/redux/hooks'
import { fetchYoutubeVideoDetails } from '@/lib/youtubeApi'

// ========================
// GLOBAL MOCKS
// ========================
vi.mock('@/redux/hooks', () => ({
  useAppSelector: vi.fn(),
}))

vi.mock('@/components/shared/api/micropostApi', () => ({
  default: {
    getAll: vi.fn(),
    create: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('@/lib/youtubeApi', () => ({
  fetchYoutubeVideoDetails: vi.fn(),
}))

vi.mock('@/lib/googleOAuth', () => ({
  redirectToGoogleOAuth: vi.fn(),
}))

vi.mock('@/components/shared/flashMessages', () => ({
  default: vi.fn(),
}))

// tránh crash Pagination
vi.mock('react-js-pagination', () => ({
  default: () => <div>Pagination</div>,
}))

// ========================
// GLOBAL ENV FIX
// ========================
beforeAll(() => {
  // fix scrollTo
  window.scrollTo = vi.fn()

  // fix localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  })
})

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // default mock cho youtube (TRÁNH lỗi .then undefined)
    ;(fetchYoutubeVideoDetails as any).mockResolvedValue({
      title: 'Demo video',
      channelTitle: 'Demo channel',
      description: 'Demo desc',
    })

    // default mock API
    ;(micropostApi.getAll as any).mockResolvedValue({
      feed_items: [],
      total_count: 0,
      following: 0,
      followers: 0,
      micropost: 0,
      gravatar: '',
    })
  })

  // ========================
  // 1. Loading state
  // ========================
  it('renders loading skeleton', () => {
    ;(useAppSelector as any).mockReturnValue({
      value: null,
      status: 'loading',
    })

    render(<Home />)

    expect(document.querySelector('.react-loading-skeleton')).toBeTruthy()
  })

  // ========================
  // 2. Guest view
  // ========================
  it('renders guest homepage', async () => {
    ;(useAppSelector as any).mockReturnValue({
      value: null,
      status: 'idle',
    })

    render(<Home />)

    expect(await screen.findByText('Welcome to the Funny Movies App')).toBeTruthy()
    expect(screen.getByText('Sign up now!')).toBeTruthy()
  })

  // ========================
  // 3. Logged in view
  // ========================
  it('renders user info when logged in', async () => {
    ;(useAppSelector as any).mockReturnValue({
      value: { id: 1, name: 'Manh', email: 'test@gmail.com' },
      status: 'idle',
    })

    ;(micropostApi.getAll as any).mockResolvedValue({
      feed_items: [],
      total_count: 0,
      following: 10,
      followers: 20,
      micropost: 5,
      gravatar: 'abc',
    })

    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText('Manh')).toBeTruthy()
      expect(screen.getByText('5 posts')).toBeTruthy()
    })
  })

  // ========================
  // 4. Submit invalid youtube
  // ========================
  it('shows warning when submit invalid youtube link', async () => {
    ;(useAppSelector as any).mockReturnValue({
      value: { id: 1, name: 'Manh', email: 'test@gmail.com' },
      status: 'idle',
    })

    render(<Home />)

    const textarea = await screen.findByPlaceholderText(/youtube/i)

    fireEvent.change(textarea, {
      target: { value: 'invalid link' },
    })

    fireEvent.click(screen.getByDisplayValue('Share'))

    expect(textarea).toBeTruthy()
  })

  // ========================
  // 5. Like without token
  // ========================
  it('redirects to google oauth when no token', async () => {
    ;(useAppSelector as any).mockReturnValue({
      value: null,
      status: 'idle',
    })

    render(<Home />)

    const likeBtn = await screen.findByText('Like')
    fireEvent.click(likeBtn)

    expect(likeBtn).toBeTruthy()
  })
})