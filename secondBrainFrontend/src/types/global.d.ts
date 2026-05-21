// Global type declarations for external scripts loaded via <script> tags

declare global {
  interface Window {
    twttr?: {
      widgets: {
        createTweet: (
          tweetId: string,
          targetEl: HTMLElement,
          options?: { align?: "left" | "right" | "center" }
        ) => Promise<HTMLElement | undefined>;
      };
    };
  }
}

export {};
