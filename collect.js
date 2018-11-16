// Extractors
// These functions extract information from
// an article's row or details page.

var id = ($row) =>
    $row.find('.id_section')
        .text()


var date = ($row) => {
    let d =
        $row.find('.publish_datetime')
            .children(':first')
            .text()
            .match(/\d{4}-\d{2}-\d+/g)
    if (d == null) return ''
    else return d[0]
}


var hour = ($row) => {
    let h =
        $row.find('.publish_datetime')
            .children(':first')
            .text()
            .match(/\d+:\d+/g)
    if (h == null) return ''
    else return h[0]
}



var author = ($row) =>
    $row.find('div.author')
        .find('span')
        .text()
        .replace(/\s+/g, ' ')



var details_url = ($row) =>
    $row.find('.edit_section')
        .find('a')
        .attr('href')



var link = ($details) =>
    $details.find('div.main_content')
            .find('li:nth-child(3)')
            .find('a')
            .attr('href')



var type = ($details) =>
    $details.find('div.main_content')
            .find('li:nth-child(5)')
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .trim()



var subject = ($details) =>
    $details.find('div.main_content')
            .find('li:nth-child(6)')
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .trim()



var aname = ($details) =>
    $details.find('div.main_content')
            .find('li:nth-child(7)')
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .trim()



var shout = ($details) =>
    $details.find('div.main_content')
            .find('li:nth-child(12)')
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .trim()



var text = ($details) =>
    $details.find('div.main_content')
            .find('div.section:eq(2)')
            .find('div')
            .text()
            .trim()



var keywords = ($details) =>
    $details.find('div.main_content')
            .find('span.meta_keyword')
            .map((i, span) =>
                $(span).text().trim()
            )
            .get()
            .join(', ')



// Main Pipeline

var log = console.log



var $rows = $('table.articles').find('tr:not(:first-child)')



var urls = $rows.map((i, row) =>
    details_url($(row))
).get()



var reqs = urls.map((url) => $.ajax(url))



var rowsAndDetails = $.when(...reqs)

    .always(() =>
        log("ajax finished")
    )

    .fail(() =>
        log("failed to load details")
    )

    .done(function() {
        log("loaded details")

        let details =
            Array.from(arguments)
                 .map((result) => result[0])

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

        log(outdata)
    })