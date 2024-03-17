import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import blogComponentPaths from '../blogs/blogs_list';
import { Helmet } from 'react-helmet-async';

function transformText(text) {
    // Split the text by underscores and capitalize each word
    return text.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function BlogDetailPage() {
    const { blogId } = useParams();
    const [BlogComponent, setBlogComponent] = useState(null);

    useEffect(() => {
        // Dynamically import the component based on blogId
        const importComponent = async () => {
            const path = blogComponentPaths[blogId];
            if (path) {
                const module = await path();
                setBlogComponent(() => module.default);
            }
        };
        importComponent();
    }, [blogId]);

    return (
        <div>
            <Helmet>
                <title>{transformText(blogId)}</title>
            </Helmet>
            <h2>Blog Detail Page</h2>
            {BlogComponent && <BlogComponent />}
        </div>
    );
}

export default BlogDetailPage;
