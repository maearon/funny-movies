"use client";
import { NextPage } from 'next'
import Image from "next/image";
import styles from "../page.module.css";
import Link from 'next/link'
import React, { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'
import Pagination from 'react-js-pagination'
import Skeleton from 'react-loading-skeleton'
import micropostApi, { CreateResponse, ListResponse, Micropost } from '../../components/shared/api/micropostApi'
import errorMessage from '../../components/shared/errorMessages'
import flashMessage from '../../components/shared/flashMessages'
import { useAppSelector } from '../../redux/hooks'
import { selectUser } from '../../redux/session/sessionSlice'
// Alt + Shift + O

// interface Props {
//   userData: UserState;
// }

const Home: NextPage = () => {
  const [page, setPage] = useState(1)
  const [feed_items, setFeedItems] = useState([] as Micropost[])
  const [total_count, setTotalCount] = useState(1)
  const [following, setFollowing] = useState(Number)
  const [followers, setFollowers] = useState(Number)
  const [micropost, setMicropost] = useState(Number)
  const [gravatar, setGavatar] = useState(String)
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [imageName, setImageName] = useState('')
  const inputEl = useRef(undefined) as MutableRefObject<HTMLInputElement>
  const inputImage = useRef(undefined) as MutableRefObject<HTMLInputElement>
  const [errors, setErrors] = useState([] as string[])
  const userData = useAppSelector(selectUser)

  const extractVideoId = (youtubeUrl: string): string | null => {
    const regExp = /embed\/([^?]*)/;
    const match = youtubeUrl.match(regExp);
    return (match && match[1]) ? match[1] : null;
  };

  const fetchVideoDetails = async (videoId: string) => {
    // https://www.geeksforgeeks.org/how-to-get-youtube-video-data-by-using-youtube-data-api-and-php/
    // https://console.cloud.google.com/apis/credentials?orgonly=true&project=apt-helix-426002-r5&supportedpurview=project,organizationId,folder
    const apiKey = 'AIzaSyAkH2rWcj2SLdgLSpSxg6yxsVQAupJ38FE'; // Replace with your YouTube API key
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const videoData = data.items[0].snippet;
      console.log('videoData', videoData)
      return {
        title: videoData.title,
        description: videoData.description,
        videoId: videoId,
        channelTitle: videoData.channelTitle,
      };
    } catch (error) {
      console.error('Failed to fetch video details:', error);
      return null;
    }
  };

  const setFeeds= useCallback(async () => { 
    micropostApi.getAll({page: page}
    ).then(async (response: ListResponse<Micropost>) => {
      if (response.feed_items) {
        const updatedFeedItems = await Promise.all(
          response.feed_items.map(async (item) => {
            const videoId = extractVideoId(item.content);
            if (videoId) {
              const details = await fetchVideoDetails(videoId);
              if (details) {
                return { ...item, ...details };
              }
            }
            return item;
          })
        );
        setFeedItems(updatedFeedItems)
        setTotalCount(response.total_count)
        setFollowing(response.following)
        setFollowers(response.followers)
        setMicropost(response.micropost)
        setGavatar(response.gravatar)
      } else {
        setFeedItems([])
      }
    })
    .catch((error: any) => {
      console.log(error)
    })
  }, [page])

  useEffect(() => {
    if (userData.loggedIn) { setFeeds()}
  }, [setFeeds, userData.loggedIn])

  const handlePageChange = (pageNumber: React.SetStateAction<number>) => {
    setPage(pageNumber)
  }

  const handleContentInput = (e: any) => {
    setContent(e.target.value)
  }

  const handleImageInput = (e: any) => {
    if (e.target.files[0]) {
      const size_in_megabytes = e.target.files[0].size/1024/1024
      if (size_in_megabytes > 512) {
        alert("Maximum file size is 512MB. Please choose a smaller file.")
        setImage(null)
        e.target.value = null
      } else {
        setImage(e.target.files[0])
        setImageName(e.target.files[0].name)
      }
    }
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    const formData2 = new FormData()
    formData2.append('micropost[content]',
      content
    )
    if (image) {
    formData2.append('micropost[image]',
      image || new Blob,
      imageName
    )
    }

    var BASE_URL = ''
    if (process.env.NODE_ENV === 'development') {
      BASE_URL = 'http://localhost:3001/api'
    } else if (process.env.NODE_ENV === 'production') {
      BASE_URL = 'https://railstutorialapi.onrender.com/api'
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
        setFeeds()
        inputEl.current.blur()
        flashMessage(...data.flash)
        setContent('')
        setImage(null)
        inputImage.current.value = ''
        setErrors([])
      }
      if (data.error) {
        inputEl.current.blur()
        // setErrors(data.error)
      }

    })
    )
  }

  const removeMicropost = (micropostid: number) => {
    let sure = window.confirm("You sure?")
    if (sure === true) {
      micropostApi.remove(micropostid
      ).then(response => {
        if (response.flash) {
          flashMessage(...response.flash)
          setFeeds()
        }
      })
      .catch((error: any) => {
        console.log(error)
      })
    }
  }

  return userData.status === 'failed' ? (
    <>
    <Skeleton height={304} />
    <Skeleton circle={true} height={60} width={60} />
    </>
  ) : userData.error ? (
    <h2>{userData.error}</h2>
  ) : userData.loggedIn ? (
    <div className="row">
      <aside className="col-md-4 col-md-offset-4">
        {/* <section className="user_info">
          <Image
            className={"gravatar"}
            src={"https://secure.gravatar.com/avatar/"+gravatar+"?s=50"}
            alt={userData.value.name} 
            width={50}
            height={50}
            priority
          />
          <h1>{userData.value.name}</h1>
          <span><Link href={"/users/"+userData.value.id}>view my profile</Link></span>
          <span>{micropost} micropost{micropost !== 1 ? 's' : ''}</span>
        </section>

        <section className="stats">
          <div className="stats">
            <Link href={"/users/"+userData.value.id+"/following"}>
              <strong id="following" className="stat">
                {following}
              </strong> following
            </Link>
            <Link href={"/users/"+userData.value.id+"/followers"}>
              <strong id="followers" className="stat">
                {followers}
              </strong> followers
            </Link>
          </div>
        </section> */}

        <section className="micropost_form">
          <form
          encType="multipart/form-data"
          action="/microposts"
          acceptCharset="UTF-8"
          method="post"
          onSubmit={handleSubmit}
          >
            {/* { errors.length !== 0 &&
              errorMessage(errors)
            } */}
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
                {/* <Field
                  as='textarea'
                  id='comments'
                  name='comments'
                  validate={validateComments}
                />
                <ErrorMessage name='comments' component={TextError} /> */}
            </div>
            <input ref={inputEl} type="submit" name="commit" value="Share" className="btn btn-primary" data-disable-with="Post" />
            {/* <span className="image">
              <input
              ref={inputImage}
              accept="image/jpeg,image/gif,image/png"
              type="file"
              name="micropost[image]"
              id="micropost_image"
              onChange={handleImageInput}
              />
            </span> */}
          </form>
        </section>
      </aside>
  </div>
  ) : (
    <>
    {/* <div className="center jumbotron">
        <h1>Welcome to the Funny Movies App</h1>
        <h2>
        This is the home page for the <Link href="https://nextjs.org/" target="_blank">NextJS Tutorial</Link> funny movies application.
        </h2>
        <Link href="/signup" className="btn btn-lg btn-primary">Sign up now!</Link>
    </div>
    <Link href="https://nextjs.org/" target="_blank">
      <Image
        className={styles.logo}
        src="/next.svg"
        alt="Next.js logo"
        width={180}
        height={38}
        priority
      />
    </Link> */}
    </>
  )
}

export default Home

// export const getServerSideProps: GetServerSideProps = async () => {
//   try {
//     const userData = useAppSelector(selectUser);
//     return { userData }
//   } catch {
//     return {
//       props: {}
//     }
//   }
// }
