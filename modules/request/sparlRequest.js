export default class sparqlRequest {
    basicUrl;


    constructor(url) {
    this.setBasicUrl(url)
    }

    setBasicUrl(url) {
        this.basicUrl=url
    }

    buildRequestURI(){
        var uri = "https://www.weizenbaum-library.de/sparql?"
        let query=decodeURI(this.getQuery()+("&"))
        let format=decodeURI(this.getFormat())

        let req=uri+query+format

        console.log(req)
    }

    decode(){
        return encodeURI('https://www.weizenbaum-library.de/sparql?default-graph-uri=&query=prefix+ns6%3A%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F%3E+%0D%0Aprefix+void%3A%3Chttp%3A%2F%2Frdfs.org%2Fns%2Fvoid%23%3E+%0D%0Aprefix+ns7%3A%3Chttp%3A%2F%2Fpurl.org%2Fontology%2Fbibo%2F%3E+%0D%0Aprefix+xsd%3A%3Chttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23%3E+%0D%0Aprefix+ns0%3A%3Chttp%3A%2F%2Fdigital-repositories.org%2Fontologies%2Fdspace%2F0.1.0%23%3E+%0D%0Aprefix+ns2%3A%3Chttps%3A%2F%2Fwww.weizenbaum-library.de%2F%3E+%0D%0Aprefix+foaf%3A%3Chttp%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F%3E+%0D%0Aprefix+dc%3A%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%3E+%0D%0Aselect+*where%7B%3Fx+ns6%3Atitle+%3Ftitle%7D&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+')
    }

    getQuery() {
        return "query=prefix+ns6:<http://purl.org/dc/terms/>+prefix+void:<http://rdfs.org/ns/void#>+prefix+ns7:<http://purl.org/ontology/bibo/>+prefix+xsd:<http://www.w3.org/2001/XMLSchema#>+prefix+ns0:<http://digital-repositories.org/ontologies/dspace/0.1.0#>+prefix+ns2:<https://www.weizenbaum-library.de/>+prefix+foaf:<http://xmlns.com/foaf/0.1/>+prefix+dc:<http://purl.org/dc/elements/1.1/>+select+*where{?x+ns6:title+?title}"

        // 'https://www.weizenbaum-library.de/sparql?' +
        //'&' +
        //'format=application/sparql-results+json'
        // return'query=prefix+ns6%3A%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F%3E+%0D%0Aprefix+void%3A%3Chttp%3A%2F%2Frdfs.org%2Fns%2Fvoid%23%3E+%0D%0Aprefix+ns7%3A%3Chttp%3A%2F%2Fpurl.org%2Fontology%2Fbibo%2F%3E+%0D%0Aprefix+xsd%3A%3Chttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23%3E+%0D%0Aprefix+ns0%3A%3Chttp%3A%2F%2Fdigital-repositories.org%2Fontologies%2Fdspace%2F0.1.0%23%3E+%0D%0Aprefix+ns2%3A%3Chttps%3A%2F%2Fwww.weizenbaum-library.de%2F%3E+%0D%0Aprefix+foaf%3A%3Chttp%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F%3E+%0D%0Aprefix+dc%3A%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%3E+%0D%0Aselect+*where%7B%3Fx+ns6%3Atitle+%3Ftitle%7D'
    }
    getPrefix(){
      return ''

    }



    getFormat(){
        return 'format=application/sparql-results+json'

    }


}