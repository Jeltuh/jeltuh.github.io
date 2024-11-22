import { getLessonRef, getQuestionRef } from '../JS/lessonehc.js';
        
        // JavaScript to dynamically update the data
        async function displayResults() {
            const lessonRef = getLessonRef();
            const questionRef = g

            let totalQuestions = 0;
            let totalAttempts = 0;
            let summaryHtml = "";

            // Fetch all questions and their data
            const querySnapshot = await lessonRef.get();
            querySnapshot.forEach((doc) => {
                const questionData = doc.data();
                const attempts = questionData.attempts || 0;
                totalQuestions++;
                totalAttempts += attempts;

                // Add question to summary table
                summaryHtml += `
                    <tr>
                        <td>Question ${doc.id}</td>
                        <td>${attempts}</td>
                    </tr>
                `;
            });

            // Calculate score
            const score = ((totalQuestions / totalAttempts) * 100).toFixed(2);

            // Update HTML
            document.getElementById("total-questions").textContent = totalQuestions;
            document.getElementById("total-attempts").textContent = totalAttempts;
            document.getElementById("score").textContent = `${score}%`;
            document.getElementById("question-summary").innerHTML = summaryHtml;
        }

        // Call displayResults after DOM has loaded
        window.onload = displayResults;