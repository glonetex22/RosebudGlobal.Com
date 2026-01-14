import { useState, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = null, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const config = { method, url, ...options };
      
      if (data) {
        if (method.toLowerCase() === 'get') {
          config.params = data;
        } else {
          config.data = data;
        }
      }
      
      const response = await api(config);
      return response.data;
      
    } catch (err) {
      const message = err.response?.data?.message || 'Request failed';
      setError(message);
      
      if (!options.silent) {
        toast.error(message);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url, params, options) => 
    request('get', url, params, options), [request]);
    
  const post = useCallback((url, data, options) => 
    request('post', url, data, options), [request]);
    
  const put = useCallback((url, data, options) => 
    request('put', url, data, options), [request]);
    
  const del = useCallback((url, options) => 
    request('delete', url, null, options), [request]);

  return { loading, error, get, post, put, del, request };
};
