# frozen_string_literal: true

require_relative "library/version"

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


      end
    end
  end
end
Liquid::Template.register_tag('render_time', Jekyll::My::Custom::Library::RenderTimeTagBlock)