"use client";
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { MutableRefObject, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { fetchUser, selectUser, User } from '../../redux/session/sessionSlice'
import sessionApi, { Response } from '../../components/shared/api/sessionApi'
import flashMessage from '../../components/shared/flashMessages'
import { ErrorMessage, Field, Form, Formik, FormikProps, useFormik, withFormik } from 'formik'
import * as Yup from 'yup'
// import TextError from '../../components/shared/TextError'
import ShowErrors, { ErrorMessageType } from '@/components/shared/errorMessages';
import { useAppSelector } from '@/redux/hooks';

const initialValues = {
  email: '',
  password: '',
  rememberMe: '1',
  errors: [] as string[],
}

interface MyFormValues {
  email: string
  password: string
  rememberMe: string
  errors: string[]
}

const New: NextPage = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberme] = useState(true)
  const inputEl = useRef(null) as MutableRefObject<HTMLInputElement>
  const [errors, setErrors] = useState<ErrorMessageType>({});
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const userData = useAppSelector(selectUser)
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        await dispatch(fetchUser());
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
        if (userData?.value?.email) {
          router.push("/");
        }
      }
    };

    fetchUserData();
  }, [dispatch, router, userData?.value?.email]);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email format')
      .required('Required'),
    password: Yup.string().required('Required')
  })

  const onSubmit = (values: MyFormValues) => {
    flashMessage("error", "User or password incorrect")
    sessionApi.create(
      {
        session: {
          email: values.email,
          password: values.password,
          remember_me: values.rememberMe ? "1" : "1"
        }
      }
    )
    .then(response => {
      if (response.user) {
        inputEl.current.blur()
        if (rememberMe) {
          localStorage.setItem("token", response.tokens.access.token)
          localStorage.setItem("remember_token", response.tokens.access.token)
        } else {
          sessionStorage.setItem("token", response.tokens.access.token)
          sessionStorage.setItem("remember_token", response.tokens.access.token)
        }
        dispatch(fetchUser())
        router.push("/")
      }
      if (response.flash) {
        flashMessage(...response.flash)
      }
      if (response.status === 401) {
        setErrors(response.errors)
        console.log('error1', response.errors)
      }
    })
    .catch(error => {
      flashMessage("error", error.toString())
      setErrors({email: ["or password incorrect"]})
      console.log('error2', error)
    })
  }

  return loading ? (
    <>
    <div>Loading...</div>
    </>
  ) : userData.error ? (
    <h2>{userData.error}</h2>
  ) : userData.value.email ? (
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
