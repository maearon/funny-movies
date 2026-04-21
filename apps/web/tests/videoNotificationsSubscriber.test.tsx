import { render } from '@testing-library/react'
import { vi } from 'vitest'
import VideoNotificationsSubscriber from '@/components/notifications/VideoNotificationsSubscriber'
import { useAppSelector } from '@/redux/hooks'
import { getAccessToken } from '@/lib/token'
import { createCableConsumer } from '@/lib/actionCable'
import flashMessage from '@/components/shared/flashMessages'

// mocks
vi.mock('@/redux/hooks')
vi.mock('@/lib/token')
vi.mock('@/lib/actionCable')
vi.mock('@/components/shared/flashMessages')

describe('VideoNotificationsSubscriber', () => {
  let mockReceived: any
  let mockUnsubscribe = vi.fn()
  let mockDisconnect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    mockReceived = null
    mockUnsubscribe = vi.fn()
    mockDisconnect = vi.fn()

    ;(createCableConsumer as any).mockReturnValue({
      subscriptions: {
        create: (_channel: any, callbacks: any) => {
          mockReceived = callbacks.received
          return {
            unsubscribe: mockUnsubscribe,
          }
        },
      },
      disconnect: mockDisconnect,
    })
  })

  // ========================
  // 1. Không subscribe nếu chưa login
  // ========================
  it('does not subscribe if no user', () => {
    ;(useAppSelector as any).mockReturnValue({ value: null })
    ;(getAccessToken as any).mockReturnValue('token')

    render(<VideoNotificationsSubscriber />)

    expect(createCableConsumer).not.toHaveBeenCalled()
  })

  // ========================
  // 2. Không subscribe nếu không có token
  // ========================
  it('does not subscribe if no token', () => {
    ;(useAppSelector as any).mockReturnValue({
      value: { id: 1, email: 'test@gmail.com' },
    })
    ;(getAccessToken as any).mockReturnValue(null)

    render(<VideoNotificationsSubscriber />)

    expect(createCableConsumer).not.toHaveBeenCalled()
  })

  // ========================
  // 3. Subscribe thành công
  // ========================
  it('subscribes when user and token exist', () => {
    ;(useAppSelector as any).mockReturnValue({
      value: { id: 1, email: 'test@gmail.com' },
    })
    ;(getAccessToken as any).mockReturnValue('token')

    render(<VideoNotificationsSubscriber />)

    expect(createCableConsumer).toHaveBeenCalledWith('token')
  })

  // ========================
  // 4. Nhận notification hợp lệ
  // ========================
  it('shows flash message when receiving VIDEO_SHARED', () => {
    ;(useAppSelector as any).mockReturnValue({
      value: { id: 1, email: 'test@gmail.com' },
    })
    ;(getAccessToken as any).mockReturnValue('token')

    render(<VideoNotificationsSubscriber />)

    mockReceived({
      type: 'VIDEO_SHARED',
      sharer_name: 'Alice',
      video_title: 'Funny Video',
      sharer_id: 2,
    })

    expect(flashMessage).toHaveBeenCalledWith(
      'info',
      'Alice shared a video: Funny Video',
    )
  })

  // ========================
  // 5. Ignore nếu chính mình share
  // ========================
  it('does not notify if user is sharer', () => {
    ;(useAppSelector as any).mockReturnValue({
      value: { id: 1, email: 'test@gmail.com' },
    })
    ;(getAccessToken as any).mockReturnValue('token')

    render(<VideoNotificationsSubscriber />)

    mockReceived({
      type: 'VIDEO_SHARED',
      sharer_name: 'Me',
      video_title: 'My Video',
      sharer_id: 1,
    })

    expect(flashMessage).not.toHaveBeenCalled()
  })

  // ========================
  // 6. Ignore type khác
  // ========================
  it('ignores non VIDEO_SHARED events', () => {
    ;(useAppSelector as any).mockReturnValue({
      value: { id: 1, email: 'test@gmail.com' },
    })
    ;(getAccessToken as any).mockReturnValue('token')

    render(<VideoNotificationsSubscriber />)

    mockReceived({
      type: 'OTHER_EVENT',
    })

    expect(flashMessage).not.toHaveBeenCalled()
  })

  // ========================
  // 7. Cleanup khi unmount
  // ========================
  it('cleans up subscription on unmount', () => {
    ;(useAppSelector as any).mockReturnValue({
      value: { id: 1, email: 'test@gmail.com' },
    })
    ;(getAccessToken as any).mockReturnValue('token')

    const { unmount } = render(<VideoNotificationsSubscriber />)

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
    expect(mockDisconnect).toHaveBeenCalled()
  })
})