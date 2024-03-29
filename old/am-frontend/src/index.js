import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

//Setup GraphQL Apollo client
//const URL_QUERY_GRAPHQL = "http://localhost:4000/graphql";
const URL_QUERY_GRAPHQL = "http://localhost:8080/graphql";
const client = new ApolloClient({
  uri: URL_QUERY_GRAPHQL,
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApolloProvider client={client}>
      <App />
  </ApolloProvider>
);
reportWebVitals();
