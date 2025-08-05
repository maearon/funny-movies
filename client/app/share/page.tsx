"use client";
import { NextPage } from 'next'
import React, { useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { CreateResponse } from '../../components/shared/api/micropostApi'
import flashMessage from '../../components/shared/flashMessages'
import { useAppSelector } from '@/redux/hooks';
import { selectUser } from '@/redux/session/sessionSlice';
import ShowErrors, { ErrorMessageType } from '@/components/shared/errorMessages'
import { useRouter } from 'next/navigation';
// Alt + Shift + O

// interface Props {
//   current_user: UserState;
// }

const Home: NextPage = () => {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [imageName, setImageName] = useState('')
  const inputEl = useRef<HTMLInputElement>(null)
  const [errors, setErrors] = useState<ErrorMessageType>({});
  const { value: current_user, status } = useAppSelector(selectUser)
  const loading = status === "loading"

  const handleContentInput = (e: any) => {
    setContent(e.target.value)
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    const formData2 = new FormData()
    formData2.append('micropost[content]', content)
    if (image) {
      formData2.append('micropost[image]', image || new Blob, imageName)
    }

    var BASE_URL = ''
    if (process.env.NODE_ENV === 'development') {
      BASE_URL = 'http://localhost:3001/api'
    } else if (process.env.NODE_ENV === 'production') {
      BASE_URL = 'https://ruby-rails-boilerplate-3s9t.onrender.com/api'
    }

    fetch(BASE_URL+`/microposts`, {
      method: "POST",
      body: formData2,
      credentials: 'include',
      headers: {
        'Authorization': localStorage.getItem('token') && localStorage.getItem('token') !== 'undefined' ?
        `Bearer ${localStorage.getItem('token')} ${localStorage.getItem('remember_token')}` :
        `Bearer ${sessionStorage.getItem('token')} ${sessionStorage.getItem('remember_token')}`
      }
    })
    .then((response: any) => response.json().then((data: CreateResponse) => {
      if (data.flash) {
        inputEl.current!.blur()
        flashMessage(...data.flash)
        setContent('')
        setImage(null)
        setErrors({})
        router.push("/")
      }
      if (data.error) {
        inputEl.current!.blur()
        setErrors(data.error)
      }
    })
    )
  }

  return loading ? (
    <>
    <Skeleton height={304} />
    <Skeleton circle={true} height={60} width={60} />
    </>
  ) : current_user?.email ? (
    <div className="row">
      <aside className="col-md-4 col-md-offset-4">
        <section className="micropost_form">
          <form
          encType="multipart/form-data"
          action="/microposts"
          acceptCharset="UTF-8"
          method="post"
          onSubmit={handleSubmit}
          >
            {Object.keys(errors).length !== 0 &&
              <ShowErrors errorMessage={errors} />
            }
            <div className="field">
                <label htmlFor="micropost[content]">Youtube URL:</label>
                <textarea
                placeholder="Compose new url https://www.youtube.com/embed/abPmZCZZrFA?si=CJdRW8sNd5laZsfJ..."
                name="micropost[content]"
                id="micropost_content"
                value={content}
                onChange={handleContentInput}
                >
                </textarea>
            </div>
            <input ref={inputEl} type="submit" name="commit" value="Share" className="btn btn-primary" data-disable-with="Post" />
          </form>
        </section>
      </aside>
  </div>
  ) : (
    <>
    </>
  )
}

export default Home
