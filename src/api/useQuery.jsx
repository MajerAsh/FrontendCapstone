import { useState, useEffect } from "react";
import { useApi } from "./ApiContext";

// Basic query hook with tag registration for invalidation
export default function useQuery(resource, tag) {
  const { request, provideTag } = useApi();

  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const query = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await request(resource);
      setData(result);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    provideTag(tag, query);
    query();
  }, [resource]); // FF added

  return { data, loading, error };
}
