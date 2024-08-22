document.addEventListener('DOMContentLoaded', () => {
    const problemNumberInput = document.getElementById('problemNumber');
    const fetchButton = document.getElementById('fetchButton');
    const loadingMessage = document.getElementById('loadingMessage');
    const content = document.getElementById('content');
    const problemDescription = document.getElementById('problemDescription');
    const solution = document.getElementById('solution');
    const generatePdfButton = document.getElementById('generatePdfButton');

    fetchButton.addEventListener('click', fetchProblem);
    generatePdfButton.addEventListener('click', generatePDF);

    async function fetchProblem() {
        const problemNumber = problemNumberInput.value;
        if (!problemNumber) {
            alert('Please enter a problem number');
            return;
        }

        loadingMessage.classList.remove('hidden');
        content.classList.add('hidden');

        try {
            const response = await fetch(`https://www.perplexity.ai/search?q=Give+me+the+full+problem+description+and+a+detailed+solution+for+LeetCode+problem+number+${problemNumber}`);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const answerElement = doc.querySelector('.prose');

            if (answerElement) {
                const fullText = answerElement.textContent;
                const [descriptionText, solutionText] = fullText.split('Solution:');
                
                problemDescription.textContent = descriptionText.trim();
                solution.textContent = solutionText ? solutionText.trim() : 'Solution not found.';
                
                loadingMessage.classList.add('hidden');
                content.classList.remove('hidden');
            } else {
                throw new Error('Could not find the answer element');
            }
        } catch (error) {
            console.error('Error fetching problem:', error);
            alert('Error fetching problem. Please try again.');
            loadingMessage.classList.add('hidden');
        }
    }

    function generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Set default font
        doc.setFont("helvetica");

        // Helper function to add multi-line text
        function addMultiLineText(text, x, y, maxWidth) {
            const lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, x, y);
            return y + (lines.length * 7);
        }

        // Helper function to add styled text
        function addStyledText(text, x, y, fontSize, fontStyle = 'normal') {
            doc.setFontSize(fontSize);
            doc.setFont("helvetica", fontStyle);
            return addMultiLineText(text, x, y, 170);
        }

        // Start with a light gray background
        doc.setFillColor(247, 249, 250);
        doc.rect(0, 0, 210, 297, 'F');

        // Add white container
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(20, 20, 170, 257, 3, 3, 'F');

        // Add title
        let yPosition = addStyledText(`LeetCode Problem #${problemNumberInput.value}`, 25, 30, 24, 'bold');

        // Add problem description
        yPosition = addStyledText('Problem Description:', 25, yPosition + 10, 18, 'bold');
        yPosition = addStyledText(problemDescription.textContent, 25, yPosition + 5, 12);

        // Add solution
        yPosition = addStyledText('Solution:', 25, yPosition + 10, 18, 'bold');
        
        // Check if the solution contains code (simple check for common programming keywords)
        const codeKeywords = ['function', 'class', 'def ', 'var ', 'let ', 'const ', 'return'];
        if (codeKeywords.some(keyword => solution.textContent.includes(keyword))) {
            // If code is detected, use monospace font and add background
            doc.setFont("courier");
            doc.setFillColor(247, 249, 250);
            doc.rect(25, yPosition, 160, 100, 'F');
            yPosition = addMultiLineText(solution.textContent, 30, yPosition + 5, 150);
        } else {
            // If no code is detected, use regular font
            yPosition = addStyledText(solution.textContent, 25, yPosition + 5, 12);
        }

        doc.save(`leetcode_problem_${problemNumberInput.value}.pdf`);
    }
});
