// API client with auth header support + simple tag invalidation

import { createContext, useContext, useState } from "react";
import { useAuth } from "../auth/AuthContext";

export const API = import.meta.env.VITE_API_URL;

const ApiContext = createContext();

export function ApiProvider({ children }) {
  //gets current user's auth token from AuthContext
  const { token } = useAuth();

  // Generic API request helper
  const request = async (resource, options = {}, isFormData = false) => {
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(API + resource, {
      ...options,
      headers,
    });

    const isJson = /json/.test(response.headers.get("Content-Type") || "");
    const result = isJson ? await response.json() : await response.text();

    if (!response.ok) throw Error(result);
    return result;
  };

  //tag-based cache invalidation system:
  const [tags, setTags] = useState({});

  const provideTag = (tag, query) => {
    setTags((prev) => ({ ...prev, [tag]: query }));
  };

  const invalidateTags = (tagsToInvalidate) => {
    const list = Array.isArray(tagsToInvalidate)
      ? tagsToInvalidate
      : tagsToInvalidate
      ? [tagsToInvalidate]
      : [];
    list.forEach((tag) => tags[tag]?.());
  };

  const value = { request, provideTag, invalidateTags };
  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

//Hook to use the api helpers in components, must use w/in <ApiProvider>
export function useApi() {
  const context = useContext(ApiContext);
  if (!context) throw Error("useApi must be used within a ApiProvider");
  return context;
}
