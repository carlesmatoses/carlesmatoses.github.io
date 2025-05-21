# frozen_string_literal: true

module Jekyll
  module My
    module Custom
      module Library
        class Error < StandardError; end
        # Your code goes here...
        Dir[File.join(__dir__, 'library', '*.rb')].sort.each { |f| require f }
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