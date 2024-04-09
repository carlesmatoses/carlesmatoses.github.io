import React from "react";
import blogComponentPaths from "../blogs/blogs_list";

import DefaultGrid from "../components/default_grid";
import DefaultCard from "../components/default_card";

function ArticlesAndBlender() {

  return (
    <div className="container">
      <DefaultGrid Element={DefaultCard} dictionary={blogComponentPaths} />
    </div>

  )
}

export default ArticlesAndBlender