# filepath: jekyll-my-custom-library\lib\jekyll\my\custom\library\bibliography.rb
require 'bibtex'
require 'yaml'

module Jekyll
  class RenderBibliography < Liquid::Tag
    def initialize(tag_name, text, tokens)
      super
      params = text.strip.split
      @bibfile = params[0]
      @format = params[1] || "html" # Default to HTML
    end

    def render(context)
      site = context.registers[:site]
      bib_path = File.join(site.source, @bibfile)

      # Open and parse BibTeX file
      bib = BibTeX.open(bib_path, filter: :latex)

      if @format == "yaml"
        return convert_to_yaml(bib)
      else
        return generate_html(bib)
      end
    end

    private

    def generate_html(bib)
        html = "<div class='bibliography'>\n<h2>Bibliography</h2>\n"
        bib.each do |entry|
          title = entry[:title] || "Untitled"
          authors = format_authors(entry[:author])
          year = entry[:year] || "Unknown Year"
          publisher = entry[:publisher] || "Unknown Publisher"
          journal = entry[:journal] ? "<i>#{entry[:journal]}</i>" : nil
          volume = entry[:volume] ? "Vol. #{entry[:volume]}" : nil
          pages = entry[:pages] ? "pp. #{entry[:pages]}" : nil
          doi = entry[:doi] ? "<a href='https://doi.org/#{entry[:doi]}'>DOI</a>" : nil
          url = entry[:url] ? "<a href='#{entry[:url]}'>Link: #{entry[:url]}</a>" : nil
      
          html << "<p>\n<strong>#{title}</strong><br>\n"
          html << "#{authors}<br>\n"
          html << "#{year}<br>\n"
          html << "#{publisher}<br>\n"
          html << "#{[journal, volume, pages].compact.join(", ")}<br>\n"
          html << "#{[doi, url].compact.join(" | ")}\n</p>\n"
        end
        html << "</div>\n"
        html
      end
      
      

    def convert_to_yaml(bib)
        references = bib.map do |entry|
          {
            id: entry.key,
            type: entry.type.to_s,
            title: entry[:title].to_s,
            author: entry[:author] ? format_authors_yaml(entry[:author]) : nil,
            year: entry[:year] ? entry[:year].to_i : nil,
            publisher: entry[:publisher] ? entry[:publisher].to_s : nil,
            journal: entry[:journal] ? entry[:journal].to_s : nil,
            volume: entry[:volume] ? entry[:volume].to_s : nil,
            pages: entry[:pages] ? entry[:pages].to_s : nil,
            doi: entry[:doi] ? "https://doi.org/#{entry[:doi]}" : nil,
            url: entry[:url] ? entry[:url].to_s : nil
          }.compact  # Removes nil values
        end
      
        { "references" => references }.to_yaml
    end
      
      

    def format_authors(authors)
      return "Unknown Author" unless authors
      authors.to_s.gsub(" and ", ", ")
    end

    def format_authors_yaml(authors)
      return nil unless authors
      authors.map do |author|
        parts = author.to_s.split(", ")
        { "family" => parts[0], "given" => parts[1] || "" }
      end
    end
  end
end

Liquid::Template.register_tag('bibliography', Jekyll::RenderBibliography)
