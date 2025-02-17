module Jekyll
    class BibliographyTag < Liquid::Tag
      def render(context)
        site = context.registers[:site]
        references = site.data["references"] || {}
  
        html = "<div class='bibliography'>"
        references.each do |key, entry|
          key = entry["key"]
          title = entry["title"] || "Untitled"
          authors = entry["author"]
          year = entry["year"]
          publisher = entry["publisher"]
          journal = entry["journal"] ? "<i>#{entry["journal"]}</i>" : nil
          volume = entry["volume"] ? "Vol. #{entry["volume"]}" : nil
          pages = entry["pages"] ? "pp. #{entry["pages"]}" : nil
          doi = entry["doi"] ? "<a href='#{entry["doi"]}'>DOI</a>" : nil
          url = entry["url"] ? "<a href='#{entry["url"]}'>Link</a>" : nil
  
          html << "<p id='#{key}'>\n<strong>#{title}</strong><br>\n"
          html << "#{authors}<br>\n"
          html << "#{year}<br>\n" if year
          html << "#{publisher}<br>\n" if publisher
          html << "#{[journal, volume, pages].compact.join(", ")}<br>\n" if journal || volume || pages
          html << "#{[doi, url].compact.join(" | ")}\n</p>\n" if doi || url
        end
        html << "</div>\n"
        html
      end
    end
  end
  
  Liquid::Template.register_tag('bibliography', Jekyll::BibliographyTag)
  