function start_opgave1() {
    window.open("opzet_vraag.html","_self");
}

function start_opgave2() {
    window.open("opzet_vraag2.html","_self");
}

function naar_theorie_8_1() {
    window.open("theorie-8.1.html", 'newwindow', 'width=910,height=800');
}

function open_theorie(i) {
    let text = i.toString();
    var opdracht = "theorie-" + text + ".html";
    window.open(opdracht, "_self");
}

function open_theorie_newwindow(i) {
    let text = i.toString();
    var opdracht = "theorie-" + text + ".html";
    window.open(opdracht, 'newwindow', 'width=910,height=780');
}