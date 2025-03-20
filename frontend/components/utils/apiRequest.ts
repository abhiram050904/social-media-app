import { AxiosError } from "axios";
import { toast } from "sonner";

interface ApiErrorResponse {
  message: string;
}

export const handleAuthRequest = async <T>(
  requestCallBack: () => Promise<T>,
  setLoading?: (loading: boolean) => void
): Promise<T | null> => {
  if (setLoading) setLoading(true);

  try {
    const response = await requestCallBack();
    console.log("API Response:", response); // Log response to check output
    return response;
  } catch (err) {
    const axiosError = err as AxiosError<ApiErrorResponse>;
    console.error("API Error:", err);

    if (axiosError?.response?.data?.message) {
      toast.error(axiosError.response.data.message);
    } else {
      toast.error("An unexpected error occurred");
    }

    return null;
  } finally {
    if (setLoading) setLoading(false);
  }
};
