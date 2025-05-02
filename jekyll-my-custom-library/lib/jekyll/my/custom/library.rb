# frozen_string_literal: true

require_relative "library/version"
require_relative "library/bibliography"
require_relative "library/bibliography_loader"
require_relative "library/ref"
require_relative "library/glb_viewer_tag"
require_relative "library/equation_refs"

module Jekyll
  module My
    module Custom
      module Library
        class Error < StandardError; end
        # Your code goes here...
        class RenderTimeTagBlock < Liquid::Block
          def render(context)
            text = super
            "<p>#{text} #{Time.now}</p>"
          end
        end

        
        # end you're code
      end
    end
  end
end
Liquid::Template.register_tag('render_time', Jekyll::My::Custom::Library::RenderTimeTagBlock)