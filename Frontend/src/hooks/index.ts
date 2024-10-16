import { useEffect, useState } from "react"
import axios from "axios";
import { BACKEND_URL } from "../config";


export interface Blog {
    "content": string;
    "title": string;
    "id": number
    "author": {
        "name": string
    }
}

export const useBlog = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState(true);
    const [blog, setBlog] = useState<Blog>();

    useEffect(() => {
        
        axios.get(`${BACKEND_URL}/api/v1/blog/blogbyid/${id}`, {
            withCredentials: true
        })
            .then(response => {
                setBlog(response.data.blog);
                setLoading(false);
            })
    }, [id])

    return {
        loading,
        blog
    }

}
export const useBlogs = () => {
    const [loading, setLoading] = useState(true);
    const [blogs, setBlogs] = useState<Blog[]>([]);

    useEffect(() => {
        async function fetch1(){
            await axios.get(`${BACKEND_URL}/api/v1/blog/allblogs`, {
                withCredentials: true
            })
            .then(response => {
                setBlogs(response.data.blogs);
                setLoading(false);
            })
        }
        fetch1()
    }, [])

    return {
        loading,
        blogs
    }
}