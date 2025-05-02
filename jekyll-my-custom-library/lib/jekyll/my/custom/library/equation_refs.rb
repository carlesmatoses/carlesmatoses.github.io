# _plugins/equation_refs.rb

module Jekyll
  class EquationBlock < Liquid::Block
    @@eq_counter = 0
    @@eq_ids = {}

    def initialize(tag_name, markup, tokens)
      super
      @id = markup.strip.match(/id\s*=\s*"([^"]+)"/)[1] rescue nil
    end

    def render(context)
      @@eq_counter += 1
      number = @@eq_counter
      context.registers[:site].data["equation_refs"] ||= {}
      context.registers[:site].data["equation_refs"][@id] = number

      content = super.strip
      <<~HTML
        <div class="equation-block" id="#{@id}">
          <span class="eq-number">(#{number})</span>
          <span class="eq-content">$$#{content}$$</span>
        </div>
      HTML
    end
  end

  class EquationRef < Liquid::Tag
    def initialize(tag_name, text, tokens)
      super
      @id = text.strip.gsub(/['"]/, '')
    end

    def render(context)
      number = context.registers[:site].data.dig("equation_refs", @id)
      if number
        "<a href=\"##{@id}\">(#{number})</a>"
      else
        "<span class=\"missing-ref\">[??]</span>"
      end
    end
  end
end

Liquid::Template.register_tag('equation', Jekyll::EquationBlock)
Liquid::Template.register_tag('ref', Jekyll::EquationRef)
