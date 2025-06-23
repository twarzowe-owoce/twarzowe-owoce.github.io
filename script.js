// —– Insert at top of script.js —–
const HYGRAPH_ENDPOINT = 'https://eu-west-2.cdn.hygraph.com/content/cmbqtjdfp005n07wd3tjy33e6/master';
const HYGRAPH_TOKEN    = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE3NDk2ODUyOTksImF1ZCI6WyJodHRwczovL2FwaS1ldS13ZXN0LTIuaHlncmFwaC5jb20vdjIvY21icXRqZGZwMDA1bjA3d2QzdGp5MzNlNi9tYXN0ZXIiLCJtYW5hZ2VtZW50LW5leHQuZ3JhcGhjbXMuY29tIl0sImlzcyI6Imh0dHBzOi8vbWFuYWdlbWVudC1ldS13ZXN0LTIuaHlncmFwaC5jb20vIiwic3ViIjoiYzdlNzhmODEtNmJiMy00ZGJjLWE1MTEtYjlmN2FkNDYxNDc0IiwianRpIjoiY21ic2xnOW40MHVmNTA3bDRnZmo1MjJ1eCJ9.JZM64B05Cb75B9P8lgHnI5LAHwoH2GEkEzZLmbxEkn1gZ2p6Y19Ka_AqO7iyljW17WNtR7TCyfKWQpbLZnaI-GGBfp3yk3cKnNF62ArS2QZIdutk3U7iW3z9JAeiiI8_omQEQgfIUJO1gHrHISMyx7Gr_XNMrr2mUh3nXJeC1qY_e7V7Cq0B8skJfR35AfjPIgh331H68EMOqINplDrzH-KO9yQM_XU24Ubiv0WmoV-RGEb-JlswOGWEFnRunJMR8wm9CrwtIsdNw2hBsZuAQ1ZgRbR4SX0O2qn3RNxJ8H-kZEjyvmKHy-4cLgjFNZzHBZE7TvAPKMVcwvVBJ9YtQiLWTFUVlAzlK0YxiFGA7USSDMlL1ytDnPSVqqQpO98xqBIJehHx4_yLOF29F7dklLvG_RyzATtVoDxNqoXPSmeLADav0hQ1JxPR_BOJfBViYr2GXm75U_UpaNz2RZ4DrsvAFZFHNALDQUlUuL6tQOnNxpL-Up6bKhfYYxq_nw4EE6qp9GxbuJXmdt3o1Goe241d2YqkAu1O9wlPoBcsTnB2ObSuFe0wG3EUTFvNlbA3vSXBRh-2Zw6PNgreQcc-IsepwuJE1A4ao3N8GY9PpG9YRqHVb3wjdrYSXUFbHnohAtJb_9uQFGdhAa9t2qmYQvS6jVrwpFKa66ChvlVTqBA';

// GraphQL mutation template
// Use the exact mutation name you saw in the Docs
const CREATE_RESPONSE_MUTATION = `
  mutation CreateUserResponses($data: UserResponsesCreateInput!) {
    createUserResponses(data: $data) {
      id
    }
  }
`;

// Function to send one response to Hygraph
async function sendToHygraph(response) {
  const payload = {
    query:   CREATE_RESPONSE_MUTATION,
    variables: { data: response }
  };

  try {
    const res = await fetch(HYGRAPH_ENDPOINT, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${HYGRAPH_TOKEN}`
      },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.errors) {
      console.error('Hygraph errors:', json.errors);
    } else {
      console.log('Hygraph created:', json.data.createUserResponses.id);
    }
  } catch (err) {
    console.error('Network error sending to Hygraph:', err);
  }
}


// ----- Configuration -----
const TOTAL_IMAGES = 10;
const IMAGE_PATH = 'images/';
const IMAGE_FILENAMES = [
  'image.webp',
  'image2.webp',
  'image3.webp',
  'image4.webp',
  'image5.webp',
  'image6.webp',
  'image7.webp',
  'image8.webp',
  'image9.webp',
  'image10.webp',
  'image11.webp',
  'image12.png',
  'image13.webp',
  'image14.webp',
  'image15.webp'
];

console.log("test 2")

// ----- State -----
let queue = [];
let currentIdx = 0;
let startTime = 0;
const responses = [];
let userId = localStorage.getItem('userId');

// ----- Elements -----
const welcomeScreen  = document.getElementById('welcome-screen');
const quizScreen     = document.getElementById('quiz-screen');
const thankyouScreen = document.getElementById('thankyou-screen');
const startBtn       = document.getElementById('start-btn');
const quizImage      = document.getElementById('quiz-image');
const faceBtns       = document.querySelectorAll('.face-btn');
const confInput      = document.getElementById('confidence-input');
const confDisplay    = document.getElementById('confidence-display');
const submitBtn      = document.getElementById('submit-btn');
const progressDisplay= document.getElementById('current-index');
const restartBtn     = document.getElementById('restart-btn');

// ----- Utils -----
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Generate a simple user ID if none exists
if (!userId) {
  userId = Date.now().toString() + Math.random().toString(36).slice(2);
  localStorage.setItem('userId', userId);
}

// ----- Flow -----
startBtn.addEventListener('click', () => {
  // prepare queue
  queue = IMAGE_FILENAMES.slice();
  shuffle(queue);
  queue = queue.slice(0, TOTAL_IMAGES);
  currentIdx = 0;
  responses.length = 0;

  welcomeScreen.hidden = true;
  thankyouScreen.hidden = true;
  quizScreen.hidden = false;
  loadNextImage();
});

faceBtns.forEach(btn =>
  btn.addEventListener('click', () => {
    // mark selected
    faceBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    submitBtn.disabled = false;
  })
);

confInput.addEventListener('input', () => {
  const pct = confInput.value;
  confDisplay.textContent = pct + '%';
  // update CSS variable for track fill
  confInput.style.setProperty('--slider-percent', pct + '%');
});


submitBtn.addEventListener('click', () => {
  // 1) Gather response data
  const isFace      = document.querySelector('.face-btn.selected').dataset.value === 'true';
  const confidence  = confInput.value / 100;
  const responseTime= Date.now() - startTime;
  const resp = {
    userId,
    image: queue[currentIdx],
    face: isFace,
    confidence,
    responseTime,
    index: currentIdx + 1
  };

  // 2) Store locally
  responses.push(resp);

  // 3) Send it straight to Hygraph
  sendToHygraph(resp);

  // 4) Reset UI state
  faceBtns.forEach(b => b.classList.remove('selected'));
  submitBtn.disabled = true;

  // 5) Advance to next image or finish
  currentIdx++;
  if (currentIdx < TOTAL_IMAGES) {
    loadNextImage();
  } else {
    endQuiz();
  }
});


restartBtn.addEventListener('click', () => startBtn.click());

// Load image and reset timers/UI
function loadNextImage() {
  quizImage.src = IMAGE_PATH + queue[currentIdx];
  progressDisplay.textContent = (currentIdx + 1).toString();
  startTime = Date.now();
}

// Show thank-you and (optionally) send data
function endQuiz() {
  quizScreen.hidden = true;
  thankyouScreen.hidden = false;

  console.log('All responses:', responses);
  // TODO: here you can batch-send `responses` to your backend via fetch()
}

