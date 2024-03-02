const inventory = document.querySelector("inventory");
const container = document.querySelector("container");
let lines = [];

function getCurrentStatement() {
    const currentStatements = [...document.querySelectorAll("container statement")].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.top > 0 && r.bottom < window.innerHeight;
    });
    if (currentStatements.length == 0) return undefined;
    return currentStatements[currentStatements.length - 1];
}


function getDirectCause(element) {
    if (element.getAttribute("thus") != undefined) {
        function getPreviousStatement(element) {
            let el = element.previousElementSibling
            for (let i = 0; i < 5; i++) {
                if (el.tagName == "STATEMENT" || el.tagName == "HYPOTHESIS" || el.tagName == "THEOREM")
                    return el;
                el = el.previousElementSibling;
            }
            return undefined;
        }

        const p = getPreviousStatement(element);
        if (p)
            return p;
    }
    return undefined;
}


function* getCauses(element) {
    const by = element.getAttribute("by");
    if (by)
        for (const el of by.split(",").map((id) => document.getElementById(id))) {
            yield el;
        }
}

document.querySelector("container").addEventListener('scroll', () => {
    [...document.querySelectorAll(".current")].forEach((el) => el.classList.remove("current"));
    [...document.querySelectorAll(".cause")].forEach((el) => el.classList.remove("cause"));

    [...document.querySelectorAll("theorem")].forEach((th) => {
        const proof = th.nextElementSibling;
        if (proof == null)
            return;

        if (proof.tagName == "PROOF" && proof.getBoundingClientRect().bottom > 32) {
            th.classList.add("theoremCurrentlyProven");
        }
        else
            th.classList.remove("theoremCurrentlyProven");
    });
    for (const line of lines)
        line.remove();

    lines = [];
    const currentStatement = getCurrentStatement();
    const statementsInFlow = [...document.querySelectorAll("container statement , container theorem")];

    const statementsAfter = statementsInFlow.filter(
        (el) => el.getBoundingClientRect().top >= (currentStatement ? currentStatement.getBoundingClientRect().top : 0));

    const relevantStatementsBefore = statementsInFlow.filter((el) => {
        if (!el.id) return false;

        //if el is not useful for the future of the proof => remove
        if (statementsAfter
            .filter((elA) => !elA.getAttribute("by") ? false : elA.getAttribute("by").indexOf(el.id) >= 0)
            .length == 0)
            return false;
        return el.getBoundingClientRect().top < container.offsetTop;//el.getBoundingClientRect().top < container.offsetTop;
    });

    inventory.innerHTML = "";
    relevantStatementsBefore.forEach((el) => inventory.prepend(el.cloneNode(true)));

    if (currentStatement == undefined) return;
    currentStatement.classList.add("current");


    const directCause = getDirectCause(currentStatement);

    if (directCause) {
        directCause.classList.add("cause");
        lines.push(new LeaderLine(
            LeaderLine.pointAnchor(directCause, {
                x: 20,
                y: directCause.getBoundingClientRect().height,
            }),
            LeaderLine.pointAnchor(currentStatement, {
                x: 20,
                y: 0,
            }),
            { color: '#FFFFFF88', outlineColor: 'black', endPlugColor: 'black', dropShadow: false, outline: true, path: "fluid" }
        ));
    }

    for (const el of getCauses(currentStatement)) {
        el.classList.add("cause");
        lines.push(new LeaderLine(
            el,
            currentStatement
            , {
                color: '#FFFFFF88',
                startSocket: el.parentElement == inventory ? 'left' : 'right',
                endSocket: el.parentElement == inventory ? 'right' : 'right',
                outlineColor: 'black', endPlugColor: 'black', dropShadow: false, outline: true, path: "fluid"
            }
        ));
    }


});





