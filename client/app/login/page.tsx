"use client";
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, {  useEffect, useRef, useState } from 'react'
import sessionApi, { Response } from '../../components/shared/api/sessionApi'
import flashMessage from '../../components/shared/flashMessages'
import { ErrorMessage, Field, Form, Formik, FormikProps, useFormik, withFormik } from 'formik'
import * as Yup from 'yup'
// import TextError from '../../components/shared/TextError'
import ShowErrors, { ErrorMessageType } from '@/components/shared/errorMessages';
import { useAppSelector } from '@/redux/hooks';
import { selectUser } from '@/redux/session/sessionSlice';
import { useLoginMutation } from '@/components/shared/api/hooks/useLoginMutation';
import { handleApiError } from '@/components/shared/handleApiError';

const initialValues = {
  email: '',
  password: '',
  remember_me: true,
  errors: [] as string[],
}

interface MyFormValues {
  email: string
  password: string
  remember_me: boolean
  errors: string[]
}

const New: NextPage = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberme] = useState(true)
  const inputEl = useRef<HTMLInputElement>(null)
  const [errors, setErrors] = useState<ErrorMessageType>({});
  const { value: current_user, status } = useAppSelector(selectUser)
  const loading = status === "loading"
  const [keepLoggedIn, setKeepLoggedIn] = useState(true)
  const loginMutation = useLoginMutation()
  
  useEffect(() => {
    if (!loading && current_user?.email) {
      router.push("/");
    }
  }, [loading, current_user?.email, router]);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email format')
      .required('Required'),
    password: Yup.string().required('Required'),
    remember_me: Yup.boolean()
  })

  const onSubmit = async (values: { email: string; password: string; remember_me: boolean }) => {
    setErrors({})
    setKeepLoggedIn(values.remember_me)

    const { email, password } = values

    loginMutation.mutate(
    {
      email,
      password,
      keepLoggedIn: keepLoggedIn
    },
    {
      onSuccess: () => {
        flashMessage("success", "Login successful.")
        router.push("/")
      },
      onError: (error: any) => {
        const parsed = handleApiError(error)
        setErrors(parsed)
        if (parsed?.general?.[0]) flashMessage("error", parsed.general[0])
      },
    })
  }

  return loading ? (
    <>
    <div>Loading...</div>
    </>
  ) : status === "failed" ? (
    <h2>{status} to get current_user from redux store</h2>
  ) : current_user?.email ? (
    <>
    <div>You did login, you now should in Home not Login...</div>
    </>
  ) : (
    <React.Fragment>
    <h1>Log in</h1>
    <div className="row">
      <div className="col-md-6 col-md-offset-3">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
        <Form>
          {Object.keys(errors).length !== 0 &&
            <ShowErrors errorMessage={errors} /> // Ensure errorMessage prop is correctly passed
          }

          <label htmlFor="session_email">Email</label>
          <Field
          className="form-control"
          type="email"
          name="email"
          id="session_email"
          placeholder='Login user email'
          />
          {/* <ErrorMessage name='email' component={TextError} /> */}

          <label htmlFor="session_password">Password</label>
          <Link href="/password_resets/new">(forgot password)</Link>
          <Field
          className="form-control"
          type="password"
          name="password"
          id="session_password"
          placeholder='Login user password'
          />
          <ErrorMessage name='password'>
            {error => <div className='error' style={{color : 'red'}}>{error}</div>}
          </ErrorMessage>

          <label className="checkbox inline" htmlFor="session_remember_me">
            <input
            name="remember_me"
            type="hidden"
            value="0" />
            <Field
            checked
            type="checkbox"
            name="remember_me"
            id="session_remember_me"
            />
            <span>Remember me on this computer</span>
          </label>
          <input ref={inputEl} type="submit" name="commit" value="Log in" className="btn btn-primary" data-disable-with="Log in" />
        </Form>
        </Formik>
        <p>New user? <Link href="/signup">Sign up now!</Link></p>
      </div>
    </div>
    </React.Fragment>
  )
}

export default New
