import { useState } from "react";
import { useApi } from "./ApiContext";

// mutate(body, overridePath?)

export default function useMutation(method, resource, tagsToInvalidate) {
  const { request, invalidateTags } = useApi();

  //local state to track mutation results
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //performs the mutation (API request)
  const mutate = async (body, overridePath) => {
    setLoading(true);
    setError(null);

    try {
      //shecks if we're sending FormData (skip JSON stringify + headers)
      const isFormData = body instanceof FormData;
      //fetch options: always include method, include body if provided
      const options = {
        method,
        ...(body !== null && body !== undefined
          ? { body: isFormData ? body : JSON.stringify(body) }
          : {}),
      };

      const result = await request(
        overridePath || resource,
        options,
        isFormData
      );
      setData(result);
      invalidateTags?.(
        Array.isArray(tagsToInvalidate)
          ? tagsToInvalidate
          : tagsToInvalidate
          ? [tagsToInvalidate]
          : []
      );
      return true;
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }

    return false;
  };

  return { mutate, data, loading, error };
}
