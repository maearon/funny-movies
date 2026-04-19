import { describe, expect, it } from "vitest";
import { embedUrlFromVideoId, extractYoutubeVideoId } from "./youtube";

describe("extractYoutubeVideoId", () => {
  it("parses watch URLs with extra query params", () => {
    expect(
      extractYoutubeVideoId(
        "https://www.youtube.com/watch?v=pRdv7lDoqIo&list=RDMMH4BB9eGUEaE&index=8",
      ),
    ).toBe("pRdv7lDoqIo");
  });

  it("parses embed URLs", () => {
    expect(
      extractYoutubeVideoId(
        "https://www.youtube.com/embed/pRdv7lDoqIo?si=l43z5RVM1Df8ioYD",
      ),
    ).toBe("pRdv7lDoqIo");
  });

  it("parses youtu.be short links", () => {
    expect(extractYoutubeVideoId("https://youtu.be/pRdv7lDoqIo")).toBe(
      "pRdv7lDoqIo",
    );
  });
});

describe("embedUrlFromVideoId", () => {
  it("builds embed URL", () => {
    expect(embedUrlFromVideoId("pRdv7lDoqIo")).toBe(
      "https://www.youtube.com/embed/pRdv7lDoqIo",
    );
  });
});
