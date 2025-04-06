import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import Base64 from 'base64-js';
import MarkdownIt from 'markdown-it';
import { maybeShowApiKeyBanner } from './gemini-api-banner';
import './style.css';

// 🔥🔥 FILL THIS OUT FIRST! 🔥🔥
// Get your Gemini API key by:
// - Selecting "Add Gemini API" in the "Project IDX" panel in the sidebar
// - Or by visiting https://g.co/ai/idxGetGeminiKey
let API_KEY = 'AIzaSyAJvDjusr8YoP__IIgxGvYuAM63OiOGiW8';

let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let output = document.querySelector('.output');
let output_status = document.querySelector('.output-status');

let output_array = [];

function sortByUrgency(arr) {
  if (!Array.isArray(arr)) {
    return "Input must be an array.";
  }

  return arr.slice().sort((a, b) => {
    // Handle null urgency_score (treat as lowest priority)
    const urgencyA = a.urgency_score === null ? Infinity : a.urgency_score;
    const urgencyB = b.urgency_score === null ? Infinity : b.urgency_score;

    return urgencyA - urgencyB; // Ascending order (lower urgency first)
  });
}



function renderTable(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return "<p>No data to display.</p>";
  }

  let tableHTML = `
    <table style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th style="border: 1px solid black; padding: 8px; text-align: left;">Urgency Score</th>
          <th style="border: 1px solid black; padding: 8px; text-align: left;">Urgency Justification</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach(item => {
    tableHTML += `
      <tr>
        <td style="border: 1px solid black; padding: 8px;">${item.urgency_score !== null ? item.urgency_score : 'N/A'}</td>
        <td style="border: 1px solid black; padding: 8px;">${item.urgency_justification || item.justification || 'N/A'}</td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  return tableHTML;
}

form.onsubmit = async (ev) => {
  ev.preventDefault();
  output_status.textContent = 'Generating...';



  try {
    // Load the image as a base64 string
    let imageUrl = form.elements.namedItem('chosen-image').value;
    let imageBase64 = await fetch(imageUrl)
      .then(r => r.arrayBuffer())
      .then(a => Base64.fromByteArray(new Uint8Array(a)));

    // Assemble the prompt by combining the text with the chosen image
    let contents = [
      {
        role: 'user',
        parts: [
          { inline_data: { mime_type: 'image/jpeg', data: imageBase64, } },
          {
            text: `
            Based on Crime Description	Victim Age	Weapon Used	Police Deployed and other important factors:			 


 Give me an urgency score between 1 to 10 and justification for the urgency score, on what factors it was given for the user's input case description, 
Give the output ONLY in table, nothing else
Give the Output in md table!:


  
  
  Input:  
  ${promptInput.value}           
  ` }
]
}
];
// Give the Output in raw JSON not in MD!:

    // Call the multimodal model, and get a stream of results
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // or gemini-1.5-pro
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    // const result = await model.generateContentStream({ contents });
    const result = await model.generateContent({ contents,
      generationConfig: {
        responseMimeType: "application/json",
      },
     });

    // Read from the stream and interpret the output as markdown
    // let buffer = [];
    // let md = new MarkdownIt();
    // for await (let response of result.stream) {
    //   buffer.push(response.text());
    //   output.innerHTML = md.render(buffer.join(''));
    // }

    const responseText = result.response.text();

    let md = new MarkdownIt();
    output.innerHTML += md.render(responseText);
    // output.innerHTML += responseText;
    // JSON.parse(responseText);

    output_array.push(JSON.parse(responseText));

    console.log(output_array);

    // output_array = sortByUrgency(output_array);
    const sortedByAge = output_array.sort((a, b) => b.urgency_score - a.urgency_score);


    const table = renderTable(sortedByAge);
console.log(table); // Output the HTML table string.

output.innerHTML = table;

  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};

// You can delete this once you've filled out an API key
maybeShowApiKeyBanner(API_KEY);