"use client";
import { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import React, {  useRef, useState } from 'react'
import userApi from '../../components/shared/api/userApi'
import flashMessage from '../../components/shared/flashMessages'
import ShowErrors, { ErrorMessageType } from '@/components/shared/errorMessages';
import Link from 'next/link';

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
  const myRef = useRef<HTMLInputElement>(null)
  const [errors, setErrors] = useState<ErrorMessageType>({});

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setState({
      ...state,
      [name]: value,
    });
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    const { name, email, password, password_confirmation } = state

    userApi.create(
      {
        user: {
          name: name,
          email: email,
          password: password,
          password_confirmation: password_confirmation
        }
      }
    ).then(response => {
      if (response.user) {
        myRef.current!.blur()
        setState({
          ...state,
          errors: {},
        });
        flashMessage(...response.flash as [message_type: string, message: string])
        router.push("/")
        // window.location.assign('https://mail.google.com/mail/u/0')  
      }
      if (response.errors) {
        myRef.current!.blur()
        setState({
          ...state,
          errors: response.errors,
        });
        setErrors(response.errors)
        console.log('error1', response.errors)
      }
    })
    .catch(error => {
      flashMessage("error", error.toString())
      setErrors({
        "email": [
            "can't be blank",
            "is invalid"
        ],
        "password_confirmation": [
            "doesn't match Password"
        ]
    })
      console.log('error2', error)
    })
    e.preventDefault()
  }

  return (
    <>
    <h1>Sign up</h1>

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
            <ShowErrors errorMessage={errors} /> // Ensure errorMessage prop is correctly passed
          }

          <label htmlFor="user_name">Name</label>
          <input
          className="form-control"
          type="text"
          name="name"
          id="user_name"
          autoComplete="off"
          value={state.name}
          onChange={handleChange}
          />

          <label htmlFor="user_email">Email</label>
          <input
          className="form-control"
          type="email"
          name="email"
          id="user_email"
          value={state.email}
          onChange={handleChange}
          />

          <label htmlFor="user_password">Password</label>
          <input
          className="form-control"
          type="password"
          name="password"
          id="user_password"
          value={state.password}
          onChange={handleChange}
          />

          <label htmlFor="user_password_confirmation">Confirmation</label>
          <input
          className="form-control"
          type="password"
          name="password_confirmation"
          id="user_password_confirmation"
          value={state.password_confirmation}
          onChange={handleChange}
          />

          <input ref={myRef} type="submit" name="commit" value="Create my account" className="btn btn-primary" data-disable-with="Create my account" />
          <Link href="/account_activations/new">(resend activation email)</Link>
    </form>  </div>
    </div>
    </>
  )
}

export default New
