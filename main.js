const inventory = document.querySelector("inventory");
const container = document.querySelector("container");
let lines = [];

function getCurrentStatement() {
    const currentStatements = [...document.querySelectorAll("statement")].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.top > 0 && r.bottom < window.innerHeight;
    });
    if (currentStatements.length == 0) return undefined;
    return currentStatements[currentStatements.length - 1];
}

function* getCauses(element) {
    if (element.getAttribute("thus") != undefined) {
        function getPreviousStatement(element) {
            let el = element.previousElementSibling
            for(let i = 0; i < 5; i++) {
                if (el.tagName == "STATEMENT" || el.tagName == "HYPOTHESIS")
                    return el;
                el = el.previousElementSibling;
            }
            return undefined;
        }

        const p = getPreviousStatement(element);
        console.log(p)
        if (p)
            yield p;

    }
    const by = element.getAttribute("by");
    if (by)
        for (const el of by.split(",").map((id) => document.getElementById(id))) {
            yield el;
        }
}

document.querySelector("container").addEventListener('scroll', () => {
    [...document.querySelectorAll(".current")].forEach((el) => el.classList.remove("current"));
    [...document.querySelectorAll(".cause")].forEach((el) => el.classList.remove("cause"));

    for (const line of lines)
        line.remove();

    lines = [];
    const currentStatement = getCurrentStatement();

    const statementsAfter = [...document.querySelectorAll("container statement , container theorem")]
        .filter((el) => el.getBoundingClientRect().top >= (currentStatement ? currentStatement.getBoundingClientRect().top : 0));

    const relevantStatementsBefore = [...document.querySelectorAll("container statement,container theorem")].filter((el) => {
        if (!el.id) return false;

        //if el is not useful for the future of the proof => remove
        if (statementsAfter
            .filter((elA) => !elA.getAttribute("by") ? false : elA.getAttribute("by").indexOf(el.id) >= 0)
            .length == 0)
            return false;
        return el.getBoundingClientRect().top < container.offsetTop;
    });

    inventory.innerHTML = "";
    relevantStatementsBefore.forEach((el) => inventory.appendChild(el.cloneNode(true)));

    if (currentStatement == undefined) return;
    currentStatement.classList.add("current");

    for (const el of getCauses(currentStatement)) {
        el.classList.add("cause");
        lines.push(new LeaderLine(
            el,
            currentStatement
            , {  color: 'white',outlineColor: 'orange',endPlugColor: 'orange', dropShadow: false, outline: true, path: "magnet" }
        ));
    }


});