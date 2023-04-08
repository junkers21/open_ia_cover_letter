document.addEventListener("DOMContentLoaded", () => {

    let search = document.querySelector("#search")
    search.addEventListener(
        "click",
        handleMouseUp,
        false
    );

});

let handleMouseUp = (e) => {
    let input = document.querySelector("#url_to_scrap")

    if(input.value === "" || !isUrlValid(input.value) || $("#name").val() === ""){ return false }

    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/"+input.value,
        success: function(html){
            let uniqueTexts = new Set();

            $(html).find("div").each((e, el) => {
                let values = getText(el)
                values.forEach(item => {if(item !== "" && item.length > 31 ){ uniqueTexts.add(item) }})
            });
            const text = Array.from(uniqueTexts);
            $("#scraping_result").empty().append(text.join("<br>"))
            askLetterToOpenIa(text.join("\n"), $("#name").val(), $("#description").val())
        },
        error: function(data){
            console.log(data)
        }
    })
}

let getText = (element) => {
    let text = $(element).contents().map(function() {
      if (this.nodeType === Node.TEXT_NODE) {
        let val = $(this).text().trim()
        val = val.replace(/<img.*?>/g, "");
        return val;
      } else if (this.nodeType === Node.ELEMENT_NODE && !$(this).is("script, style")) {
        return getText(this);
      } else {
        return "";
      }
    }).get();
    return text;
  }
  

let isUrlValid = (url) => {
    const regex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-zA-Z0-9]+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
    return regex.test(url);
}

let askLetterToOpenIa = (text, name, description) => {
    $.ajax({
        url: "https://api.openai.com/v1/chat/completions",
        method: "POST",
        headers: {
            "Authorization": "Bearer [open_ia_key]",// TODO: Enter here your own api key.
            "Content-Type": "application/json"
        },
        data: JSON.stringify( {
            model: "gpt-3.5-turbo",
            temperature: 0.8,
            messages: [
                {
                    role: "system",
                    content: "Tu est un expert redacteur qui redige des lettres de motivation en prennant la place de "+name+" a partir de textes retrouvés sur"+
                    " les sites des entreprises. Ces textes sont en faite le contenu des balises scrapés du site. Faudra faire attention puisque dans"+
                    " ces textes on peut y trouver des mots sans aucun interet qui font partie du menu du site mais d'autres sont des titres des sections qui "+
                    "les suivent. Tente d'eviter les repetitions et d'utiliser et ameliorer le contenu suivant qui est une breve description de "+name+": "+description
                },
                {
                    role: "user",
                    content: text
                }
            ]
        }),
        success: function(data){
            $("#ia_result").empty().append(data.choices[0].message.content.replace("\n", "<br>"))
        },
        error: function(data){
            console.log(data)
        }
    })
}