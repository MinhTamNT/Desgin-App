import { GRAPHQL_SERVER_WB } from "../utils/constants";

import { createClient, Client } from "graphql-ws";
import { useEffect } from "react";

const GRAPHQL_WS_URL = GRAPHQL_SERVER_WB;

const useGraphQLSubscription = (token: string) => {
  useEffect(() => {
    if (!token) return;

    const client = createClient({
      url: GRAPHQL_WS_URL,
      connectionParams: {
        Authorization: token,
      },
      retryAttempts: 3,
      shouldRetry: () => true,
    }) as Client;

    const dispose = client.subscribe(
      {
        query: `subscription { userStatusChanged { userId status } }`,
      },
      {
        next: () => console.log("Connected to GraphQL Subscription"),
        error: (error) => console.error("GraphQL Subscription error:", error),
        complete: () => console.log("Connection closed"),
      }
    );

    return () => {
      dispose();
    };
  }, [token]);
};

export default useGraphQLSubscription;
