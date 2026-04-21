import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginPage from '@/app/login/page'

import { useAppSelector } from '@/redux/hooks'
import { useLoginMutation } from '@/components/shared/api/hooks/useLoginMutation'
import { useRouter } from 'next/navigation'

vi.mock('@/redux/hooks')
vi.mock('@/components/shared/api/hooks/useLoginMutation')
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

describe('Login Page', () => {
  const pushMock = vi.fn()
  const mutateMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    ;(useRouter as any).mockReturnValue({
      push: pushMock,
    })

    ;(useAppSelector as any).mockReturnValue({
      value: null,
      status: 'idle',
    })

    ;(useLoginMutation as any).mockReturnValue({
      mutate: mutateMock,
    })
  })

  it('renders login form', () => {
    render(<LoginPage />)

    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Login user email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Login user password')).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty form', async () => {
    render(<LoginPage />)

    fireEvent.click(screen.getByDisplayValue('Log in'))

    await waitFor(() => {
      expect(screen.getAllByText('Required').length).toBeGreaterThan(0)
    })
  })

  it('calls login mutation on valid submit', async () => {
    render(<LoginPage />)

    fireEvent.change(screen.getByPlaceholderText('Login user email'), {
      target: { value: 'test@gmail.com' },
    })

    fireEvent.change(screen.getByPlaceholderText('Login user password'), {
      target: { value: '123456' },
    })

    fireEvent.click(screen.getByDisplayValue('Log in'))

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalled()
    })
  })

  it('redirects on login success', async () => {
    ;(useLoginMutation as any).mockReturnValue({
      mutate: (_data: any, options: any) => {
        options.onSuccess()
      },
    })

    render(<LoginPage />)

    fireEvent.change(screen.getByPlaceholderText('Login user email'), {
      target: { value: 'test@gmail.com' },
    })

    fireEvent.change(screen.getByPlaceholderText('Login user password'), {
      target: { value: '123456' },
    })

    fireEvent.click(screen.getByDisplayValue('Log in'))

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/')
    })
  })

  it('shows loading state', () => {
    ;(useAppSelector as any).mockReturnValue({
      value: null,
      status: 'loading',
    })

    render(<LoginPage />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('redirects if already logged in', () => {
    ;(useAppSelector as any).mockReturnValue({
      value: { email: 'test@gmail.com' },
      status: 'idle',
    })

    render(<LoginPage />)

    expect(pushMock).toHaveBeenCalledWith('/')
  })
})