require 'bibtex'

module Jekyll
    class BibliographyLoader < Liquid::Tag
        def initialize(tag_name, text, tokens)
            super
            @bibfile = text.strip
        end

        def render(context)
            site = context.registers[:site]
            bib_path = File.join(site.source, @bibfile)

            # Open and parse BibTeX file
            bib = BibTeX.open(bib_path, filter: :latex)

            # Clear previous references and store new ones in site data
            site.data["references"] = {}

            bib.each do |entry|
                key = entry.key.to_s  # Correct way to get the key

                site.data["references"][key] ||= {  # Preserve existing references
                    "key" => key,
                    "title" => entry[:title] ? entry[:title].to_s : "Untitled",
                    "author" => entry[:author] ? entry[:author].to_s.gsub(" and ", ", ") : "Unknown Author",
                    "year" => entry[:year] ? entry[:year].to_s : "Unknown Year",
                    "publisher" => entry[:publisher] ? entry[:publisher].to_s : nil,
                    "journal" => entry[:journal] ? entry[:journal].to_s : nil,
                    "volume" => entry[:volume] ? entry[:volume].to_s : nil,
                    "pages" => entry[:pages] ? entry[:pages].to_s : nil,
                    "doi" => entry[:doi] ? "https://doi.org/#{entry[:doi]}" : nil,
                    "url" => entry[:url] ? entry[:url].to_s : nil
                }
            end

            ""  # Return an empty string to render nothing
        end
    end
end

Liquid::Template.register_tag('bibliography_loader', Jekyll::BibliographyLoader)
