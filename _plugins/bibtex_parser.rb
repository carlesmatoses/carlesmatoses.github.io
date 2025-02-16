# filepath: /c:/Users/carle/Documents/github/carlesmatoses.github.io/_plugins/bibtex_parser.rb
require 'bibtex'

module Jekyll
  class RenderBibliography < Liquid::Tag
    def initialize(tag_name, text, tokens)
      super
      @bibfile = text.strip
    end

    def render(context)
      site = context.registers[:site]
      bib_path = File.join(site.source, @bibfile)
      bib = BibTeX.open(bib_path)

      html = "<div class='bibliography'>\n"
      html << "<h2>Bibliography</h2>\n"
      bib.each do |entry|
        html << "<p>\n"
        html << "<strong>#{entry.title}</strong><br>\n"
        html << "#{entry.author}<br>\n"
        html << "#{entry.year}<br>\n"
        html << "#{entry.publisher}\n"
        html << "</p>\n"
      end
      html << "</div>\n"
      html
    end
  end
end

Liquid::Template.register_tag('bibliography', Jekyll::RenderBibliography)