import {
  split,
  HttpLink,
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  from,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { GRAPHQL_SERVER, GRAPHQL_SERVER_WB } from "../utils/constants";
import Cookies from "universal-cookie";
import { onError } from "@apollo/client/link/error";

const cookie = new Cookies();

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (
        err.extensions?.code === "UNAUTHENTICATED" ||
        err.message.includes("jwt expired")
      ) {
        const currentPath = window.location.pathname;
        localStorage.setItem("lastPath", currentPath);

        window.location.href = "/login";
        return;
      }
    }
  }

  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
});

const authLink = new ApolloLink((operation, forward) => {
  const token = cookie.get("access_token");
  operation.setContext({
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  return forward(operation);
});

const httpLink = new HttpLink({
  uri: GRAPHQL_SERVER,
});

const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url: GRAPHQL_SERVER_WB,
          connectionParams: {
            Authorization: cookie.get("access_token")
              ? `Bearer ${cookie.get("access_token")}`
              : "",
          },
          on: {
            closed: () => {
              const token = cookie.get("access_token");
              if (!token) {
                const currentPath = window.location.pathname;
                localStorage.setItem("lastPath", currentPath);
                window.location.href = "/login";
              }
            },
          },
        })
      )
    : null;

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink || httpLink,
  from([errorLink, authLink, httpLink]) // Thêm errorLink vào chain
);

export function createApolloClient() {
  const isServer = typeof window === "undefined";

  return new ApolloClient({
    ssrMode: isServer,
    link: splitLink,
    credentials: "same-origin",
    cache: new InMemoryCache(),
  });
}
