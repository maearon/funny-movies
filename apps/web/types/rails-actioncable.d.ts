declare module "@rails/actioncable" {
  export interface Subscription {
    unsubscribe(): void;
  }

  export interface Consumer {
    subscriptions: {
      create(
        channel: string | Record<string, unknown>,
        mixin?: Record<string, unknown>,
      ): Subscription;
    };
    disconnect(): void;
  }

  export function createConsumer(url?: string): Consumer;
}
