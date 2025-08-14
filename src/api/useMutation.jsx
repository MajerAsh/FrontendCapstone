import { useState } from "react";
import { useApi } from "./ApiContext";

// mutate(body, overridePath?)

export default function useMutation(method, resource, tagsToInvalidate) {
  const { request, invalidateTags } = useApi();

  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (body, overridePath) => {
    setLoading(true);
    setError(null);

    try {
      const isFormData = body instanceof FormData;
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
      invalidateTags?.(tagsToInvalidate || []);
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
