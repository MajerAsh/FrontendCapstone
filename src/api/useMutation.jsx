import { useState } from "react";
import { useApi } from "./ApiContext";

/**
 * Returns a function to mutate a resource.
 * Usage:
 *   const { mutate } = useMutation("DELETE", "/finds", ["my-finds"]);
 *   await mutate(null, `/finds/${id}`);
 *
 * - body: object | null
 * - overridePath: string | undefined (overrides the resource)
 */

export default function useMutation(method, resource, tagsToInvalidate) {
  const { request, invalidateTags } = useApi();

  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (body, overridePath) => {
    setLoading(true);
    setError(null);

    try {
      const result = await request(overridePath || resource, {
        method,
        // only send a JSON body when provided; otherwise omit
        ...(body !== null && body !== undefined
          ? { body: JSON.stringify(body) }
          : {}),
      });

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
