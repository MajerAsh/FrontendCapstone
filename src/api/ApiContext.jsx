/* eslint-disable react-refresh/only-export-components */
/*ApiContext attaches the user's authentication token to API requests when possible + 
handles tags to refresh appropriate queries after a mutation*/

import { createContext, useContext, useState } from "react";
import { useAuth } from "../auth/AuthContext";
// Base API URL (vite env stuff)
export const API = import.meta.env.VITE_API_URL;

//creates context for the api helpers: request, tag caching
const ApiContext = createContext();

export function ApiProvider({ children }) {
  //gets current user's auth token from AuthContext
  const { token } = useAuth();

  /*request helper: const request...
 params:
  resource - the endpoint path ("/users")
  options object (method, body...)
  isFormData - true if sending FormData (skip JSON headers)
  */
  const request = async (resource, options = {}, isFormData = false) => {
    //make headers:
    const headers = {
      //adds auth header if logged in
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      //adds json "Content-Type" if its not FormData
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      //merge the custom headers from options:
      ...(options.headers || {}),
    };

    //The fetch request:
    const response = await fetch(API + resource, {
      ...options,
      headers,
    });

    //Checks if the response (content type) contains "json":
    const isJson = /json/.test(response.headers.get("Content-Type") || "");
    //parse accordingly
    const result = isJson ? await response.json() : await response.text();
    //throw error if status code is not OK (fourhundredsmthn or fivehundredsomthin)
    if (!response.ok) throw Error(result);
    return result; //the parsed data
  };

  //tag-based cache invalidation system:
  const [tags, setTags] = useState({});

  /*Register a query function under a "tag":
      params: tag - string key to identify the query
              query - function to re-run when invalidating */
  const provideTag = (tag, query) => {
    setTags((prev) => ({ ...prev, [tag]: query }));
  };

  /*invalidates one or more tags to trigger query refresh:
      param: tagsToInvalidate - array of tag strings*/
  const invalidateTags = (tagsToInvalidate) => {
    tagsToInvalidate?.forEach((tag) => tags[tag]?.());
  };
  //context value: exposes the request helper + tag methods:
  const value = { request, provideTag, invalidateTags };
  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

//Hook to use the api helpers in components! must use w/in <ApiProvider>
export function useApi() {
  const context = useContext(ApiContext);
  if (!context) throw Error("useApi must be used within a ApiProvider");
  return context;
}
