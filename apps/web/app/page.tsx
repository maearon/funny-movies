"use client";

import type { NextPage } from "next";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Pagination from "react-js-pagination";
import Skeleton from "react-loading-skeleton";
import micropostApi, {
  CreateResponse,
  ListResponse,
  Micropost,
} from "../components/shared/api/micropostApi";
import ShowErrors, { ErrorMessageType } from "@/components/shared/errorMessages";
import flashMessage from "../components/shared/flashMessages";
import { useAppSelector } from "@/redux/hooks";
import { selectUser } from "@/redux/session/sessionSlice";
import { embedUrlFromVideoId, extractYoutubeVideoId } from "@/lib/youtube";
import { fetchYoutubeVideoDetails, YoutubeSnippetDetails } from "@/lib/youtubeApi";
import { redirectToGoogleOAuth } from "@/lib/googleOAuth";

const Home: NextPage = () => {
  const [demoVideo, setDemoVideo] = useState<YoutubeSnippetDetails | null>(null);
  const [page, setPage] = useState(1);
  const [feedItems, setFeedItems] = useState<Micropost[]>([]);
  const [total_count, setTotalCount] = useState(1);
  const [following, setFollowing] = useState<number>(0);
  const [followers, setFollowers] = useState<number>(0);
  const [micropost, setMicropost] = useState<number>(0);
  const [gravatar, setGavatar] = useState<string>("");
  const [content, setContent] = useState("");
  const inputEl = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<ErrorMessageType>({});
  const { value: current_user, status } = useAppSelector(selectUser);
  const loading = status === "loading";
  const [image, setImage] = useState(null)
  const [imageName, setImageName] = useState('')
  const inputImage = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    fetchYoutubeVideoDetails("H4BB9eGUEaE").then(setDemoVideo);
  }, []);

  const setFeeds = useCallback(async () => {
    try {
      const response: ListResponse<Micropost> = await micropostApi.getAll({
        page,
      });

      if (response.feed_items) {
        const enriched = await Promise.all(
          response.feed_items.map(async (item) => {
            const videoId = item.youtube_id ?? item.videoId;

            if (!videoId) return item;

            const details = await fetchYoutubeVideoDetails(videoId);

            if (!details) return item;

            return {
              ...item,
              channelTitle: details.channelTitle,
              description: details.description,
              title: details.title || item.title,
            };
          })
        );

        setFeedItems(enriched);
        setTotalCount(response.total_count);
        setFollowing(response.following);
        setFollowers(response.followers);
        setMicropost(response.micropost);
        setGavatar(response.gravatar);

        if (response.feed_items.length === 0 && page > 1) {
          setPage((prev) => prev - 1);
        }
      } else {
        setFeedItems([]);
      }
    } catch {
      // flashMessage("error", "Could not load feed");
    }
  }, [page]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (!code) return;

    void (async () => {
      try {
        const res = await fetch("/api/google-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();
        if (!res.ok) {
          flashMessage("error", data.error ?? "Google token exchange failed");
          return;
        }
        if (data.access_token) {
          localStorage.setItem("youtube_oauth_token", data.access_token);
          flashMessage("success", "Connected to YouTube for ratings");
        }
        window.history.replaceState({}, document.title, "/");
        void setFeeds();
      } catch {
        flashMessage("error", "Error exchanging Google authorization code");
      }
    })();
  }, [setFeeds]);

  useEffect(() => {
    void (async () => {
      await setFeeds();
    })();
  }, [page, setFeeds]);

  const handleAuthClick = () => {
    redirectToGoogleOAuth();
    if (!process.env.NEXT_PUBLIC_CLIENT_ID) {
      flashMessage("warning", "Google OAuth is not configured (NEXT_PUBLIC_CLIENT_ID)");
    }
  };

  const getYoutubeRatingToken = () => localStorage.getItem("youtube_oauth_token");

  const handleRate = async (videoId: string, rating: "like" | "dislike") => {
    const accessToken = getYoutubeRatingToken();

    if (!accessToken) {
      flashMessage("warning", "Sign in with Google to rate videos.");
      handleAuthClick();
      return;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos/rate?id=${encodeURIComponent(videoId)}&rating=${rating}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 204) {
        flashMessage("success", `Video ${rating} saved`);
        return;
      }

      if (response.status === 401) {
        localStorage.removeItem("youtube_oauth_token");
        flashMessage("warning", "YouTube session expired — please connect again.");
        handleAuthClick();
      } else {
        flashMessage("error", `Could not ${rating} this video`);
      }
    } catch {
      flashMessage("error", `Could not ${rating} this video`);
    }
  };

  const handlePageChange = (pageNumber: React.SetStateAction<number>) => {
    setPage(pageNumber);
  };


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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    const videoId = extractYoutubeVideoId(trimmed);
    if (!videoId) {
      flashMessage(
        "warning",
        "Paste a valid YouTube link (watch, embed, shorts, or youtu.be).",
      );
      return;
    }

    const details = await fetchYoutubeVideoDetails(videoId);
    if (!details) return;

    try {
      const data: CreateResponse = await micropostApi.create({
        content: trimmed,
        title: details.title,
        youtube_id: videoId,
        image: image as unknown as File,
      });

      if (data.flash) {
        await setFeeds();
        inputEl.current?.blur();
        flashMessage(...data.flash);
        setContent("");
        setErrors({});
      }
      if (data.error) {
        inputEl.current?.blur();
        setErrors(
          Array.isArray(data.error) ? { base: data.error } : data.error,
        );
      }
    } catch {
      flashMessage("error", "Could not share video");
    }
  };

  const removeMicropost = (micropostid: number) => {
    const sure = window.confirm("You sure?");
    if (sure !== true) return;

    micropostApi
      .remove(micropostid)
      .then((response) => {
        if (response.flash) {
          flashMessage(...response.flash);
          void setFeeds();
        }
      })
      .catch(() => {
        flashMessage("error", "Could not delete micropost");
      });
  };

  const videoEmbedSrc = (item: Micropost) => {
    const id = item.youtube_id ?? item.videoId;
    return id ? embedUrlFromVideoId(id) : "";
  };

  const ratingVideoId = (item: Micropost) =>
    item.youtube_id ?? item.videoId ?? "";

  return loading ? (
    <>
      <Skeleton height={304} />
      <Skeleton circle={true} height={60} width={60} />
    </>
  ) : current_user?.email ? (
    <div className="row">
      <aside className="col-md-4">
        <section className="user_info">
          <Image
            className={"gravatar"}
            src={`https://secure.gravatar.com/avatar/${gravatar || ""}?s=50`}
            alt={current_user?.name || "User avatar"}
            width={50}
            height={50}
            priority
          />
          <h1>{current_user.name}</h1>
          <span>
            <Link href={"/users/" + current_user.id}>view my profile</Link>
          </span>
          <span>
            {micropost} post{micropost !== 1 ? "s" : ""}
          </span>
        </section>

        <section className="stats">
          <div className="stats">
            <Link href={"/users/" + current_user.id + "/following"}>
              <strong id="following" className="stat">
                {following}
              </strong>{" "}
              following
            </Link>
            <Link href={"/users/" + current_user.id + "/followers"}>
              <strong id="followers" className="stat">
                {followers}
              </strong>{" "}
              followers
            </Link>
          </div>
        </section>

        <section className="micropost_form">
          <form
            encType="multipart/form-data"
            action="/microposts"
            acceptCharset="UTF-8"
            method="post"
            onSubmit={(e) => void handleSubmit(e)}
          >
            {Object.keys(errors).length !== 0 && (
              <ShowErrors errorMessage={errors} />
            )}
            <div className="field">
              <label htmlFor="micropost_content">YouTube URL</label>
              <textarea
                placeholder="https://www.youtube.com/watch?v=… or https://youtu.be/…"
                name="micropost[content]"
                id="micropost_content"
                value={content}
                // onChange={handleContentInput}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
              />
            </div>
            <input
              ref={inputEl}
              type="submit"
              name="commit"
              value="Share"
              className="btn btn-primary"
              data-disable-with="Post"
            />
            <span className="image">
              <input
                ref={inputImage}
                accept="image/jpeg,image/gif,image/png"
                type="file"
                name="micropost[image]"
                id="micropost_image"
                onChange={handleImageInput}
                className="form-control-file"
              />
            </span>
          </form>
        </section>
      </aside>

      <div className="col-md-8">
        {feedItems.length > 0 && (
          <>
            <ol className="microposts">
              {feedItems.map((i) => (
                <li key={i.id} id={"micropost-" + i.id}>
                  <Link href={"/users/" + i.user_id}>
                    <Image
                      className={"gravatar"}
                      src={
                        "https://secure.gravatar.com/avatar/" +
                        i.gravatar_id +
                        "?s=" +
                        i.size
                      }
                      alt={i.user_name ?? ""}
                      width={i.size}
                      height={i.size}
                      priority
                    />
                  </Link>
                  <span className="user">
                    <Link href={"/users/" + i.user_id}>{i.user_name}</Link>
                  </span>

                  <span className="content">
                    <b>{i.title ?? "Untitled"}</b>
                    {i.channelTitle && (
                      <Link
                        target="_blank"
                        rel="noopener noreferrer"
                        href={
                          "https://www.youtube.com/results?search_query=" +
                          encodeURIComponent(i.channelTitle)
                        }
                      >
                        {" "}
                        ({i.channelTitle})
                      </Link>
                    )}
                    {videoEmbedSrc(i) ? (
                      <div className="videoWrapper">
                        <iframe
                          title={i.title ?? "YouTube video"}
                          src={videoEmbedSrc(i)}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    ) : null}
                    {i.description ? <p>{i.description}</p> : null}
                    <p>
                      <small>
                        Original link:{" "}
                        <a
                          href={i.content}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {i.content}
                        </a>
                      </small>
                    </p>
                    <div className="btn-group" style={{ marginTop: 8 }}>
                      <button
                        type="button"
                        className="btn btn-default btn-sm"
                        onClick={() =>
                          void handleRate(ratingVideoId(i), "like")
                        }
                      >
                        <i className="fa fa-thumbs-o-up" aria-hidden="true" />{" "}
                        Like
                      </button>
                      <button
                        type="button"
                        className="btn btn-default btn-sm"
                        onClick={() =>
                          void handleRate(ratingVideoId(i), "dislike")
                        }
                      >
                        <i
                          className="fa fa-thumbs-o-down"
                          aria-hidden="true"
                        />{" "}
                        Dislike
                      </button>
                    </div>
                    {i.image && (
                      <Image
                        src={i.image}
                        alt="Example User"
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{ width: '100%', height: 'auto' }}
                        priority
                      />
                    )}
                  </span>
                  <span className="timestamp">
                    {"Shared " + i.timestamp + " ago. "}
                    {current_user?.id === i.user_id && (
                      <Link
                        href={"#/microposts/" + i.id}
                        onClick={(e) => {
                          e.preventDefault();
                          removeMicropost(i.id);
                        }}
                      >
                        delete
                      </Link>
                    )}
                  </span>
                </li>
              ))}
            </ol>

            <Pagination
              activePage={page}
              itemsCountPerPage={5}
              totalItemsCount={total_count}
              pageRangeDisplayed={5}
              onChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  ) : (
    <>
      <div className="center jumbotron">
        <h1>Welcome to the Funny Movies App</h1>
        <h2>
          This is the home page for the{" "}
          <Link href="https://funny-movies-pied.vercel.app">
            funny movies application
          </Link>
          .
        </h2>
        <span className="content">
          <b>{ demoVideo?.title || "Video Title" }</b>
          <Link
            target="_blank"
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(demoVideo?.channelTitle || "Channel Name")}`}
          >
            {" "}
            ({ demoVideo?.channelTitle || "Channel Name" })
          </Link>
          <div className="videoWrapper">
            <iframe
              title="Featured video"
              src="https://www.youtube.com/embed/H4BB9eGUEaE"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="btn-group" style={{ marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-default btn-sm"
              onClick={() => void handleRate("H4BB9eGUEaE", "like")}
            >
              <i className="fa fa-thumbs-o-up" aria-hidden="true" /> Like
            </button>
            <button
              type="button"
              className="btn btn-default btn-sm"
              onClick={() => void handleRate("H4BB9eGUEaE", "dislike")}
            >
              <i className="fa fa-thumbs-o-down" aria-hidden="true" /> Dislike
            </button>
          </div>
        </span>
        <Link href="/signup" className="btn btn-lg btn-primary">
          Sign up now!
        </Link>
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
      </Link>
    </>
  );
};

export default Home;
