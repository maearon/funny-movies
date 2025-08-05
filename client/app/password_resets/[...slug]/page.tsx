"use client";
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import flashMessage from '../../../components/shared/flashMessages'
import passwordResetApi from '../../../components/shared/api/passwordResetApi'
import { MutableRefObject, useRef, useState, use } from 'react';
// import errorMessage from '../../components/shared/errorMessages'

const initialState = {
  password: '',
  password_confirmation: '',
  errorMessage: [] as string[],
};

const Edit = (props: {params: Promise<{slug: string[]}>}) => {
  const params = use(props.params);
  const router = useRouter()
  const [state, setState] = useState(initialState)
  const { reset_token, email } = 
  params.slug.length === 2 ? 
  // { reset_token: params.slug[0], email: params.slug[1] } 
  { reset_token: params.slug[0], email: decodeURIComponent(params.slug[1]) } 
  : { reset_token: '', email: '' };
  const dispatch = useDispatch()
  const myRef = useRef(undefined) as MutableRefObject<HTMLInputElement>

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
    const { password, password_confirmation } = state

    passwordResetApi.update(reset_token as string,
      {
        email: email as string,
        user: {
          password: password,
          password_confirmation: password_confirmation,
        }
      }
    ).then(response => {
      if (response.flash?.[0] === "danger") { // Case (1)
        flashMessage(...response.flash as [message_type: string, message: string])
      }
      if (response.error) { // Case (2+3)
        myRef.current.blur()
        setState({
          ...state,
          errorMessage: response.error,
        });
      }
      if (response.flash?.[0] === "success") { // Case (4)
        flashMessage(...response.flash as [message_type: string, message: string])
        router.push("/users/"+response.user_id)
      }
      flashMessage('success', 'The password reset successfully, please try log in again')
    })
    .catch(error => {
      console.log(error)
    })
    e.preventDefault()
  }

  return (
      <>
      <h1>Reset password</h1>
      <div className="row">
        <div className="col-md-6 col-md-offset-3">
          <form 
          action="/password_resets/-5_dEDShHqeo6El2uBrhew" 
          acceptCharset="UTF-8" method="post"
          onSubmit={handleSubmit}
          >
            {/* { state.errorMessage.length !== 0 &&
              errorMessage(state.errorMessage)
            } */}

            <input type="hidden" name="_method" value="patch"/><input type="hidden" name="authenticity_token" value="lzHcRJF-71OD3aFOiOtSPMemxmMm8m0FEhV8XDOwm6gTWYM0AbhPpRVbWl9-Q-7j6dM0qVMI7AQVDXHL8gm-Tg"/>
            <input type="hidden" name="email" id="email" value="manhng132@gmail.com"/>
            <div className="field_with_errors"><label htmlFor="user_password">Password</label></div>
            {/* <div className="field_with_errors"> */}
              <input 
              className="form-control" 
              type="password" 
              name="user[password]" 
              id="user_password"
              value={state.password}
              onChange={handleChange}
              />
            {/* </div> */}
            <div className="field_with_errors"><label htmlFor="user_password_confirmation">Confirmation</label></div>
            {/* <div className="field_with_errors"> */}
              <input 
              className="form-control" 
              type="password" 
              name="user[password_confirmation]" 
              id="user_password_confirmation"
              value={state.password_confirmation}
              onChange={handleChange}
              />
            {/* </div> */}
            <input ref={myRef} type="submit" name="commit" value="Update password" className="btn btn-primary" data-disable-with="Update password"/>
          </form>  
        </div>
      </div>
      {/* <h1>Account Activationing ...</h1>
      <h1>{email}</h1>
      <h1>{slug?.[0]}</h1> */}
      </>
  )
}

export default Edit
