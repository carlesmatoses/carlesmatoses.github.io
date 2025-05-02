module Jekyll
    class ReferenceTag < Liquid::Tag
      def initialize(tag_name, text, tokens)
        super
        @key = text.strip
      end
  
      def render(context)
        site = context.registers[:site]
        references = site.data["references"] || {}
  
        if references[@key]
          ref = references[@key]
          title = ref["title"]
          url = ref["url"]
  
          if url
            return "<a href='#{url}'>#{title}</a>"
          else
            return "<a href='##{@key}'>#{title}</a>"
          end
        else
          return "[Missing reference: #{@key}]"
        end
      end
    end
  end
  
  Liquid::Template.register_tag('cite', Jekyll::ReferenceTag)
  