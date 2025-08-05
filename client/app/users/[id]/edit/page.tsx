"use client";
import Image from 'next/image'
import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik'
import { useRouter } from 'next/navigation'
import React, { MutableRefObject, useCallback, useEffect, useRef, useState, use } from 'react';
import * as Yup from 'yup'
import userApi, { UserEdit } from '../../../../components/shared/api/userApi'
import errorMessage from '../../../../components/shared/errorMessages'
import flashMessage from '../../../../components/shared/flashMessages'
// import TextError from '../../../../components/shared/TextError'

const initialValues = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  errors: [] as string[],
  phNumbers: ['']
}

const savedValues = {
  name: 'Example User',
  email: 'example@railstutorial.org',
  password: 'foobar',
  password_confirmation: 'foobar',
  errors: [] as string[],
  phNumbers: ['+84912915132','+84904272299']
}

interface MyFormValues {
  name: string
  email: string
  password: string
  password_confirmation: string
  errors: string[]
}

const useSafeRouter = () => {
  try {
    return useRouter();
  } catch (error) {
    // useRouter not available
    return null;
  }
};

const Edit = (props: {params: Promise<{id: string}>}) => {
  const params = use(props.params);
  const router = useSafeRouter();
  const id = params.id
  const [user, setUser] = useState({} as UserEdit)
  const [formValues, setFormValues] = useState(Object)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password_confirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState([] as string[])
  const [gravatar, setGravatar] = useState('')
  const inputEl = useRef(undefined) as MutableRefObject<HTMLInputElement>

  const getUserInfo= useCallback(async () => { 
    userApi.edit(id as string
    ).then(response => {
      if (response.user) {
        setUser(response.user)
        initialValues.name = response.user.name
        initialValues.email = response.user.email
        setGravatar(response.gravatar)
      }
      if (response.flash) {
        flashMessage(...response.flash)
        router?.push('/')
      }
    })
    .catch(error => {
      console.log(error)
    })
  }, [id, router])

  useEffect(() => {
    getUserInfo()
  }, [getUserInfo])

  const validationSchema = Yup.object({
    name: Yup.string().required('Required'),
    email: Yup.string()
      .email('Invalid email format')
      .required('Required')
  })

  const onSubmit = (values: MyFormValues, submitProps: { setSubmitting: (arg0: boolean) => void; resetForm: () => void }) => {
    console.log('Form data', values)
    userApi.update(id as string,
      { 
        user: {
          name: values.name,
          email: values.email,
          password: values.password,
          password_confirmation: values.password_confirmation
        },
      }
    ).then(response => {
      // setTimeout(function(){
      inputEl.current!.blur()
      // console.log('Form data', values)
      // console.log('submitProps', submitProps)
      submitProps.setSubmitting(false)
      submitProps.resetForm()
      if (response.flash_success) {
        flashMessage(...response.flash_success)
        setPassword('')
        setPasswordConfirmation('')
        getUserInfo()
      }
      if (response.error) {
        setErrors(response.error)
      }
      // }, 5000)
    })
    .catch(error => {
      console.log(error)
    })
    // e.preventDefault()
  }

  return (
    <>
    <h1>Update your profile</h1>
    <div className="row">
      <div className="col-md-6 col-md-offset-3">
        <Formik
          initialValues={savedValues || initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
          // validateOnChange={false}
          // validateOnBlur={false}
          // validateOnMount
        >
        {
          formik => {
            // console.log('Formik props', formik)
            return (
        <Form>
          {/* { errors.length !== 0 &&
            errorMessage(errors)
          } */}
          <label htmlFor="user_name">Name</label>
          <Field
          className="form-control"
          type="text"
          name="name"
          id="user_name"
          />
          {/* <ErrorMessage name='name' component={TextError} /> */}

          <label htmlFor="user_email">Email</label>
          <Field
          className="form-control"
          type="email"
          name="email"
          id="user_email"
          />
          {/* <ErrorMessage name='email' component={TextError} /> */}

          <label htmlFor="user_password">Password</label>
          <Field
          className="form-control"
          type="password"
          name="password"
          id="user_password"
          />
          {/* <ErrorMessage name='password' component={TextError} /> */}

          <label htmlFor="user_password_confirmation">Confirmation</label>
          <Field
          className="form-control"
          type="password"
          name="password_confirmation"
          id="user_password_confirmation"
          />
          {/* <ErrorMessage name='password_confirmation' component={TextError} /> */}

          <label htmlFor="user_phones">List of phone numbers</label>
          <FieldArray name='phNumbers'>
            {fieldArrayProps => {
              const { push, remove, form } = fieldArrayProps
              const { values } = form
              const { phNumbers } = values
              // console.log('fieldArrayProps', fieldArrayProps)
              // console.log('Form errors', form.errors)
              return (
                <div>
                  {phNumbers.map((phNumber: string, index: number) => (
                    <div key={index}>
                      <Field name={`phNumbers[${index}]`} className="form-control" />
                      {index > 0 && (
                        <button type='button' className="btn btn-danger" onClick={() => remove(index)}>
                          REMOVE
                        </button>
                      )}
                    </div>
                  ))}
                  <button type='button' className="btn btn-success" onClick={() => push('')}>
                    ADD
                  </button>
                </div>
              )
            }}
          </FieldArray>
          <button
            type='button'
            onClick={() => formik.validateField('comments')}
          >
            Validate comments
          </button>
          <button
            type='button'
            onClick={() => formik.setFieldTouched('comments')}
          >
            Visit comments
          </button>
          <button type='button' onClick={() => formik.validateForm()}>
            Validate all
          </button>
          <button
            type='button'
            onClick={() =>
              formik.setTouched({
                name: true,
                email: true
              })
            }
          >
            Visit all
          </button>
          <button type='button' onClick={() => setFormValues(savedValues)}>
            Load saved data
          </button>
          <button type='reset'>Reset</button>
          <input ref={inputEl} type="submit" name="commit" value={formik.isSubmitting ? "Loading..." : "Save changes"} className="btn btn-primary" data-disable-with="Save changes" disabled={!formik.isValid || formik.isSubmitting} />
        </Form>
            )
          }
        }
        
        </Formik>
        <div className="gravatar_edit">
          <Image
            className={"gravatar"}
            src={"https://secure.gravatar.com/avatar/"+gravatar+"?s=80"}
            alt={user.name} 
            width={80}
            height={80}
            priority
          />
          <a href="https://gravatar.com/emails" target="_blank" rel="noopener noreferrer">change</a>
        </div>
      </div>
    </div>
    </>
  )
}

export default Edit
