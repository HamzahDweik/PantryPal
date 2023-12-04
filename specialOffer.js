let questions = [
    { q: "Are you a student?", reason: "being a student" },
    { q: "Do you make less than $60,000 annually?", reason: "having a low income" },
    { q: "Are you above the age of 65?", reason: "being a senior" }
];
let currentQuestion = 0;
let startTime = null;
let reasons = [];

document.getElementById("specialOfferBtn").addEventListener("click", function() {
    startTime = new Date();
    document.getElementById("specialOfferBtn").style.display = 'none';
    document.getElementById("quizContainer").classList.remove('hidden');
    document.getElementById("question").textContent = questions[currentQuestion].q;
});

function answerQuestion(answer) {
    if(answer === 'Yes') {
        reasons.push(questions[currentQuestion].reason);
    }
    nextQuestion();
}

function nextQuestion() {
    currentQuestion++;
    if(currentQuestion < questions.length) {
        document.getElementById("question").textContent = questions[currentQuestion].q;
    } else {
        endQuiz();
    }
}

function endQuiz() {
    let endTime = new Date();
    let timeSpent = (endTime - startTime) / 1000;
    document.getElementById("quizContainer").classList.add('hidden');
    let offerText = "Thank you for participating! ";
    
    if(reasons.length > 0) {
        let discount = reasons.length * 15;
        offerText += `Because of ${reasons.join(" and ")}, you qualify for $${discount} off your purchase! `;
    } else {
        offerText += "Unfortunately, you do not qualify for our special offer this time. ";
    }
    
    offerText += `You spent ${timeSpent.toFixed(2)} seconds on the questionnaire.`;
    document.getElementById("offer").textContent = offerText;
}
