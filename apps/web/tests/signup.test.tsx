import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignupPage from '@/app/signup/page'
import { vi } from 'vitest'

// mock router
const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

// mock flashMessage
const flashMock = vi.fn()
vi.mock('@/components/shared/flashMessages', () => ({
  default: (...args: any[]) => flashMock(...args),
}))

// mock mutation
const mutateMock = vi.fn()

vi.mock('@/components/shared/api/hooks/useSignupMutation', () => ({
  useSignupMutation: () => ({
    mutate: mutateMock,
  }),
}))

describe('Signup Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ✅ 1. render form
  it('renders signup form', () => {
    render(<SignupPage />)

    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirmation')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create my account/i })).toBeInTheDocument()
  })

  // ✅ 2. validation
  it('shows validation errors when submitting empty form', async () => {
    render(<SignupPage />)

    fireEvent.click(screen.getByRole('button', { name: /create my account/i }))

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
    expect(screen.getByText('Password confirmation is required')).toBeInTheDocument()
  })

  // ✅ 3. password mismatch
  it('shows error when passwords do not match', async () => {
    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Manh' },
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@gmail.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: '123456' },
    })
    fireEvent.change(screen.getByLabelText('Confirmation'), {
      target: { value: '654321' },
    })

    fireEvent.click(screen.getByRole('button', { name: /create my account/i }))

    expect(await screen.findByText('Passwords must match')).toBeInTheDocument()
  })

  // ✅ 4. success flow
  it('calls signup mutation and redirects on success', async () => {
    mutateMock.mockImplementation((_payload, { onSuccess }) => {
      onSuccess({
        success: true,
        message: 'Signup successful',
      })
    })

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Manh' },
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@gmail.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: '123456' },
    })
    fireEvent.change(screen.getByLabelText('Confirmation'), {
      target: { value: '123456' },
    })

    fireEvent.click(screen.getByRole('button', { name: /create my account/i }))

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalled()
      expect(pushMock).toHaveBeenCalledWith('/account-login')
      expect(flashMock).toHaveBeenCalledWith('success', 'Signup successful')
    })
  })

  // ✅ 5. API response field errors
  it('shows API field errors', async () => {
    mutateMock.mockImplementation((_payload, { onSuccess }) => {
      onSuccess({
        success: false,
        errors: {
          email: ['Email already taken'],
        },
      })
    })

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Manh' },
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@gmail.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: '123456' },
    })
    fireEvent.change(screen.getByLabelText('Confirmation'), {
      target: { value: '123456' },
    })

    fireEvent.click(screen.getByRole('button', { name: /create my account/i }))

    expect(await screen.findByText('Email already taken')).toBeInTheDocument()
  })

  // ✅ 6. network error
  it('shows network error message', async () => {
    mutateMock.mockImplementation((_payload, { onError }) => {
      onError({ code: 'ERR_NETWORK' })
    })

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Manh' },
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@gmail.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: '123456' },
    })
    fireEvent.change(screen.getByLabelText('Confirmation'), {
      target: { value: '123456' },
    })

    fireEvent.click(screen.getByRole('button', { name: /create my account/i }))

    await waitFor(() => {
      expect(flashMock).toHaveBeenCalledWith(
        'error',
        'Cannot connect to the server. Please try again later.'
      )
    })
  })
})