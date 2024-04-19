// This file works as a white list

const blogs = [
  "irradiance_cube_map"
]

// blogs require:
// 1. preview data 
//    ID
//    ImagePreview
//    Name

const blogComponentPaths = blogs.map(blog=>{
  let image =  `../src/blogs/${blog}/preview.png`;
  let name = blog;
  let url = `src/blogs/${blog}`

  return {image, name, url}
});

export default blogComponentPaths