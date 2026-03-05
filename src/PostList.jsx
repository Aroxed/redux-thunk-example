import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchPosts, incrementPage } from "./postsSlice";

const PostList = () => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts.posts);
  const status = useSelector((state) => state.posts.status);
  const error = useSelector((state) => state.posts.error);
  const page = useSelector((state) => state.posts.page);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchPosts(page));
    }
  }, [dispatch, status, page]);

  const loadMorePosts = () => {
    dispatch(incrementPage());
    dispatch(fetchPosts(page + 1));
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "failed") {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Post List</h2>
      {posts.map((post) => (
        <div key={post.id}>
          <h3>
            {post.id}. {post.title}
          </h3>
          <p>{post.body}</p>
        </div>
      ))}
      <button onClick={loadMorePosts}>Load More</button>
    </div>
  );
};

export default PostList;
