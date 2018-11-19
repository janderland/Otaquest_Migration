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



// Main Pipeline

let log = console.log



let $rows =
    $('table.articles')//.find('tr:not(:first-child)')
                       //.not('.note_added')
                       .find('tr.article_row')



let urls = $rows.map((i, row) =>
    details_url($(row))
).get()



let reqs = urls.map((url) => $.ajax(url))



let rowsAndDetails = $.when(...reqs)

    .fail(function() {
        throw "failed to load details"
    })

    .done(function() {
        log("loaded details")

        let details =
            Array.from(arguments)
                 .map((result) => result[0])

        if ($rows.length != details.length) {
            log('rows: ' + $rows.length +
                ', details: ' + details.length
            )
            throw 'WARN! rows and details arent one to one'
        }

        let rowsAndDetails =
            details.map((detail, i) =>
                [$($rows[i]), $(detail)]
            )

        log(rowsAndDetails)

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
            'keywords'
        ]

        csv = outdata.reduce((csv, row) =>
                  csv + '\n'
                      + cols.map((name) =>
                            row[name]
                        ).join('|')
              , cols.join('|'))

        log(csv)
    })

})();
