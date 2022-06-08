import { useState } from "react";
import {
  ApolloClient,
  ApolloProvider,
  from,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { UserContext } from "./Components/context";
import Pages from "./Pages";

export default function App() {
  const [user, setUser] = useState<any>(null);

  const errorLink = onError(({ graphQLErrors }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message }) => {
        alert(`Graphql error ${message} `);
      });
    }
  });

  const link = from([
    errorLink,
    new HttpLink({
      uri: "https://je4b5gma4vhazdwung6egsh3di.appsync-api.ap-southeast-2.amazonaws.com/graphql",
    }),
  ]);

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        Authorization: `${user.signInUserSession.accessToken.jwtToken}`,
      },
    };
  });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(link),
  });
  return (
    <ApolloProvider client={client}>
      <UserContext.Provider value={{ user, setUser }}>
        <Pages />
      </UserContext.Provider>
    </ApolloProvider>
  );
}
