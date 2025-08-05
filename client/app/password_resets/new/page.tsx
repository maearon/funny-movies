"use client";
import { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import React, { MutableRefObject, useRef, useState } from 'react'
import passwordResetApi from '../../../components/shared/api/passwordResetApi';
import flashMessage from '../../../components/shared/flashMessages';

const initialState = {
  email: '',
};

const New: NextPage = () => {
  const router = useRouter()
  const [state, setState] = useState(initialState)
  const myRef = useRef(null) as MutableRefObject<HTMLInputElement>

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    const nameState = name.substring(
      name.indexOf("[") + 1, 
      name.lastIndexOf("]")
    );
    setState({
      ...state,
      [nameState]: value,
    });
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    const { email } = state

    passwordResetApi.create(
      {
        password_reset: {
          email: email,
        }
      }
    ).then(response => {
      myRef.current!.blur()
      flashMessage('success', 'The password reset email has been sent, please check your email')
      // flashMessage(...response.flash as [message_type: string, message: string])
      // if (response.flash[0] === "info") {

      //   router.push("/")
      // }
      // if (response.flash[0] === "danger") {
        
      // }
    })
    .catch(error => {
      console.log(error)
    })
    e.preventDefault()
  }
  
  return (
      <>
      <h1>Forgot password</h1>

      <div className="row">
        <div className="col-md-6 col-md-offset-3">
          <form 
          action="/password_resets" 
          acceptCharset="UTF-8" 
          method="post"
          onSubmit={handleSubmit}
          >
            <input type="hidden" name="authenticity_token" value="4bTV1IxJZ-bJ0QgrXM22oaoPBFvSVucXkkKr3EDeHjnnZQ1lkf1-9kOsMHs1uoBYYwWMs8BsBmgVvuukuvECaw" />
            <label htmlFor="password_reset_email">Email</label>
            <input 
            className="form-control" 
            type="email" 
            name="password_reset[email]" 
            id="password_reset_email" 
            value={state.email}
            onChange={handleChange}
            />

            <input ref={myRef} type="submit" name="commit" value="Submit" className="btn btn-primary" data-disable-with="Submit" />
          </form>  
        </div>
      </div>
      </>
  )
}

export default New
