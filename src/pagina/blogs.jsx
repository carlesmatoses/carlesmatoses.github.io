  import React, { useState, useEffect } from 'react';
  import { useParams } from 'react-router-dom';
  import blogComponentPaths from '../blogs/blogs_list';
  
  function BlogDetailPage() {
    const { blogId } = useParams();
    const [BlogComponent, setBlogComponent] = useState(null);
  
    useEffect(() => {
      // Dynamically import the component based on blogId
      const importComponent = async () => {
        const path = blogComponentPaths[blogId];
        if (path) {
          const module = await path();
          console.log(module.default); // Log the imported module
          setBlogComponent(() => module.default);
        }
      };
      importComponent();
    }, [blogId]);
  
    return (
      <div>
        <h2>Blog Detail Page</h2>
        {BlogComponent && <BlogComponent />}
      </div>
    );
  }
  
  export default BlogDetailPage;
  