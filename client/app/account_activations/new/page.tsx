"use client";
import { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import React, { MutableRefObject, useRef, useState } from 'react'
import accountActivationApi from '../../../components/shared/api/accountActivationApi'
import flashMessage from '../../../components/shared/flashMessages'
import ShowErrors, { ErrorMessageType } from '@/components/shared/errorMessages';

const initialState = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  errors: {} as ErrorMessageType,
};

const New: NextPage = () => {
  const router = useRouter()
  const [state, setState] = useState(initialState)
  const myRef = useRef(undefined) as MutableRefObject<HTMLInputElement>
  const [errors, setErrors] = useState<ErrorMessageType>({});

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setState({
      ...state,
      [name]: value,
    });
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    const { email } = state

    accountActivationApi.create(
      {
        resend_activation_email: {
          email: email,
        }
      }
    ).then(response => {
      // if (response.user) {
      //   myRef.current.blur()
      //   setState({
      //     ...state,
      //     errors: {},
      //   });
      //   flashMessage(...response.flash as [message_type: string, message: string])
      //   router.push("/")
      //   // window.location.assign('https://mail.google.com/mail/u/0')  
      // }
      // if (response.errors) {
      //   myRef.current.blur()
      //   setState({
      //     ...state,
      //     errors: response.errors,
      //   });
      //   setErrors(response.errors)
      //   console.log('error1', response.errors)
      // }
      flashMessage('success', 'The activation email has been sent again, please check your email')
    })
    .catch(error => {
      flashMessage('info', 'Account already activated')
      // flashMessage("error", error.toString())
      // setErrors({
      //   "email": [
      //       "can't be blank",
      //       "is invalid"
      //   ],
      //   "password_confirmation": [
      //       "doesn't match Password"
      //   ]
    })
  }

  return (
    <>
    <h1>Resend Activation Email</h1>

    <div className="row">
      <div className="col-md-6 col-md-offset-3">
        <form
        className="new_user"
        id="new_user" action="/users"
        acceptCharset="UTF-8"
        method="post"
        onSubmit={handleSubmit}
        >
          {Object.keys(errors).length !== 0 &&
            <ShowErrors errorMessage={errors} />
          }

          <label htmlFor="user_email">Email</label>
          <input
          className="form-control"
          type="email"
          name="email"
          id="user_email"
          value={state.email}
          onChange={handleChange}
          />

          <input ref={myRef} type="submit" name="commit" value="Resend activation email" className="btn btn-primary" data-disable-with="Resend activation email" />
        </form>  
      </div>
    </div>
    </>
  )
}

export default New
