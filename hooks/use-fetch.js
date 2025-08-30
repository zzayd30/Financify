import { toast } from "sonner";

const { useState } = require("react")

const useFetch = (cb) =>{
    const [data, setData] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fn = async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const response = await cb(...args);
            setData(response);
            setError(null);
        } catch (error) {
            setError(error);
            toast.error(error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, fn, setData };
};
export default useFetch;