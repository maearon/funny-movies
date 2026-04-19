"use client";

import type { NextPage } from "next";
import React, { useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import micropostApi, { CreateResponse } from "../../components/shared/api/micropostApi";
import flashMessage from "../../components/shared/flashMessages";
import { useAppSelector } from "@/redux/hooks";
import { selectUser } from "@/redux/session/sessionSlice";
import ShowErrors, { ErrorMessageType } from "@/components/shared/errorMessages";
import { useRouter } from "next/navigation";
import { extractYoutubeVideoId } from "@/lib/youtube";
import { fetchYoutubeVideoDetails } from "@/lib/youtubeApi";

const SharePage: NextPage = () => {
  const router = useRouter();
  const [content, setContent] = useState("");
  const inputEl = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<ErrorMessageType>({});
  const { value: current_user, status } = useAppSelector(selectUser);
  const loading = status === "loading";

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
      });

      if (data.flash) {
        inputEl.current?.blur();
        flashMessage(...data.flash);
        setContent("");
        setErrors({});
        router.push("/");
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
            onSubmit={(e) => void handleSubmit(e)}
          >
            {Object.keys(errors).length !== 0 && (
              <ShowErrors errorMessage={errors} />
            )}
            <div className="field">
              <label htmlFor="micropost_content">YouTube URL</label>
              <textarea
                placeholder="https://www.youtube.com/watch?v=…"
                name="micropost[content]"
                id="micropost_content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
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
          </form>
        </section>
      </aside>
    </div>
  ) : null;
};

export default SharePage;
