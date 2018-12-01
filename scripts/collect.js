(() => {

// Extractors
// These functions extract information from
// an article's row or details page.


let id = ($row) =>
    $row.find('.id_section')
        .text()


let date = ($row) => {
    let d =
        $row.find('.publish_datetime')
            .children(':first')
            .text()
            .match(/\d{4}-\d{2}-\d+/g)
    if (d == null) return ''
    else return d[0]
}


let hour = ($row) => {
    let h =
        $row.find('.publish_datetime')
            .children(':first')
            .text()
            .match(/\d+:\d+/g)
    if (h == null) return ''
    else return h[0]
}



let author = ($row) =>
    $row.find('div.author')
        .find('span')
        .text()
        .replace(/\s+/g, ' ')



let details_url = ($row) =>
    $row.find('.edit_section')
        .find('a')
        .attr('href')



let link = ($details) =>
    $details.find('div.main_content')
            .find('li:nth-child(3)')
            .find('a')
            .attr('href')



let type = ($details) =>
    $details.find('div.main_content')
            .find('li:nth-child(5)')
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .replace(/\s+/g, ' ')



let subject = ($details) =>
    $details.find('div.main_content')
            .find('li:nth-child(6)')
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .replace(/\s+/g, ' ')



let aname = ($details) =>
    $details.find('div.main_content')
            .find('li:nth-child(7)')
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .replace(/\s+/g, ' ')



let shout = ($details) =>
    $details.find('div.main_content')
            .find('li:nth-child(12)')
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .replace(/\s+/g, ' ')



let text = ($details) =>
    $details.find('div.main_content')
            .find('div.section:eq(2)')
            .find('div')
            .text()
            .replace(/\s+/g, ' ')



let keywords = ($details) =>
    $details.find('div.main_content')
            .find('span.meta_keyword')
            .map((i, span) =>
                $(span).text().trim()
            )
            .get()
            .join(', ')


let edit_url = (id) =>
    'https://admin.iflyer.tv/apex/theswan/article_text.php?id='+id+'&islang=en&pub_id=2'


let source_html = ($edit) =>
    $edit.find('#blogBody')
         .val()



// Main Pipeline

let log = console.log



let $rows =
    $('table.articles').find('tr.article_row')



let details_urls = $rows.map((i, row) =>
    details_url($(row))
).get()



let reqs = details_urls.map((url) => $.ajax(url))



$.when(...reqs)

    .fail(function() {
        throw "FAILED TO LOAD DETAILS"
    })

    .done(function() {
        log("LOADED DETAILS")

        let details =
            Array.from(arguments)
                 .map((result) => result[0])

        if ($rows.length != details.length) {
            log('rows: ' + $rows.length +
                ', details: ' + details.length
            )
            throw 'ROWS AND DETAILS ARENT ONE TO ONE'
        }

        let rowsAndDetails =
            details.map((detail, i) =>
                [$($rows[i]), $(detail)]
            )

        let outdata = rowsAndDetails.map((rad) => {
            let $row = rad[0]
            let $details = rad[1]

            return {
                id: id($row),
                date: date($row),
                hour: hour($row),
                author: author($row),
                link: link($details),
                type: type($details),
                subject: subject($details),
                name: aname($details),
                shout: shout($details),
                text: text($details),
                keywords: keywords($details)
            }
        })



        // Add HTML to outdata

        let edit_urls = outdata.map((datum) =>
            edit_url(datum.id)
        )

        let edit_reqs = edit_urls.map((url) => $.ajax(url))

        $.when(...edit_reqs)

            .fail(function() {
                throw "FAILED TO LOAD SOURCES"
            })

            .done(function() {
                log("LOADED SOURCES")

                let edits =
                    Array.from(arguments)
                         .map((result) => result[0])

                if ($rows.length != edits.length) {
                    log('rows: ' + $rows.length +
                        ', edits: ' + edits.length
                    )
                    throw 'ROWS AND SOURCES ARENT ONE TO ONE'
                }

                edits.forEach((edit, i) =>
                    outdata[i].source =
                        source_html($(edit))
                )

                log(outdata)

                log(JSON.stringify(outdata))

                cols = [
                    'id',
                    'date',
                    'hour',
                    'author',
                    'link',
                    'type',
                    'subject',
                    'name',
                    'shout',
                    'text',
                    'keywords',
                    'source'
                ]

                csv = outdata.reduce((csv, row) =>
                          csv + '\n'
                              + cols.map((name) =>
                                    row[name]
                                ).join('|')
                      , cols.join('|'))

                log(csv)
            })
    })
})();
