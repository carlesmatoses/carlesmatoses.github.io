# reference_block.rb
module Jekyll
  
class ReferenceCollector < Generator
  safe true
  priority :low  # Run after site is read, before rendering

  def generate(site)
    site.data["refs"] ||= {}
    referenceable_tags = %w[figure equation table]

    all_docs = site.pages + site.posts.docs + site.collections.values.flat_map(&:docs)

    all_docs.each do |doc|
      content = doc.content

      referenceable_tags.each do |tag|
        # Match both inline and block tags with attributes (like id="foo")
        tag_regex = /\{%\s*#{tag}\s+([^%]+?)%\}/

        content.scan(tag_regex) do |markup|
          attrs = Hash[markup[0].scan(/(\w+)\s*=\s*"([^"]+)"/)]
          id = attrs["id"]
          next unless id

          site.data["refs"][tag] ||= {}
          site.data["refs"][tag][id] ||= site.data["refs"][tag].size + 1
        end
      end
    end
  end
end

class ReferenceableBlock < Liquid::Block
  attr_reader :attributes, :tag, :id

  def initialize(tag_name, markup, tokens)
    super
    @tag = tag_name
    @attributes = {}

    # Extract all key="value" pairs
    markup.scan(/(\w+)\s*=\s*"([^"]+)"/) do |key, value|
      @attributes[key] = value
    end

    @id = @attributes["id"]
  end

  def render(context)
    site = context.registers[:site]
    site.data["refs"] ||= {}
    site.data["refs"][@tag] ||= {}

    unless site.data["refs"][@tag].key?(@id)
      site.data["refs"][@tag][@id] = site.data["refs"][@tag].size + 1
    end

    number = site.data["refs"][@tag][@id]
    content = super.strip
    render_content(number, content)
  end

  def render_content(number, content)
    raise NotImplementedError
  end
end

class RefTag < Liquid::Tag
  def initialize(tag_name, markup, tokens)
    super
    @type, @id = markup.strip.split(':', 2)
  end

  def render(context)
    site = context.registers[:site]
    refs = site.data["refs"] || {}
    number = refs.dig(@type, @id)

    if number
      "<a href='##{@id}'>#{number}</a>"
    else
      # Placeholder for unresolved references
      "<span class='missing-ref'>[??]</span>"
    end
  end
end

class FigureBlock < ReferenceableBlock
  def render_content(number, content)
    size = (@attributes["size"] || "1.0").to_f.clamp(0.0, 1.0)
    caption = @attributes["caption"] || "Figure"
    id = @id
    col = (@attributes["col"] || "0").to_i

    image_lines = content.lines.map(&:strip).reject(&:empty?)
    return "<!-- no images in figure -->" if image_lines.empty?

    container_width = (size * 100).round(2)
    epsilon = 1 # Small value to make images slightly smaller
    gap = 0.5 # Gap between images in `em` (same as in CSS)
    num_images = image_lines.size

    # Adjust image width to account for the gap
    image_width = ((100.0 - (gap * (num_images - 1))) / num_images - epsilon).round(2)
    if col > 0
      image_width = ((100.0 - (gap * (col - 1))) / col - epsilon).round(2)
    end

    images_html = image_lines.map do |line|
      <<~HTML.strip
        <img src="#{line}" alt="fig #{number}: #{caption}" style="width: #{image_width}%; height: auto;">
      HTML
    end.join("\n")

    <<~HTML
        <figure id="#{id}" style="width: #{container_width}%; display: flex; flex-direction: column; align-items: center;">
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: #{gap}em;">
            #{images_html}
          </div>
          <figcaption style="text-align: center; margin-top: 0.5em;">fig #{number}: #{caption}</figcaption>
        </figure>
    HTML
  end
end

    
class EquationBlock < ReferenceableBlock
  def render_content(number, content)
    equation_number = number
    label = @id

    <<~HTML
      <div id="#{label}" class="equation-block" style="display: flex; justify-content: space-between; align-items: center; margin: 1em 0;">
        <div style="flex: 1;">
          \\[
            #{content}
          \\]
        </div>
        <div style="margin-left: 1em; white-space: nowrap;">(#{equation_number})</div>
      </div>
    HTML
  end
end

end

Liquid::Template.register_tag('ref', Jekyll::RefTag)
Liquid::Template.register_tag('referenceable_block', Jekyll::ReferenceableBlock)
Liquid::Template.register_tag('figure', Jekyll::FigureBlock)
Liquid::Template.register_tag('equation', Jekyll::EquationBlock)